import os , re,requests
from dotenv import load_dotenv
# from google import genai
from groq import Groq
from openai import OpenAI
from prompts import EXPLANATION_PROMPT, SOLVER_PROMPT, CONVERSION_PROMPT, build_classification_prompt, build_conversion_prompt, build_explanation_prompt, build_solver_prompt
from solver import solve_equation, solve_system
from utils import clean_input, clean_equation_output, is_word_problem, classify_problem, explain_with_fallback, solve_with_fallback, convert_with_fallback, clean_gemini_output, format_solution, solve_jee_with_gemini , beautify_math_text
import time

load_dotenv()

# gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def extract_difficulty(text):
    if text is None:
        return "Could not generate solution","Medium"
    """Pull DIFFICULTY line out of Gemini response, return (cleaned_text, difficulty)"""
    difficulty = "Medium"  # default
    lines = text.split('\n')
    cleaned_lines = []

    for line in lines:
        if line.strip().startswith('DIFFICULTY:'):
            raw = line.split(':', 1)[1].strip()
            if raw in ("Easy", "Medium", "Hard"):
                difficulty = raw
        else:
            cleaned_lines.append(line)

    cleaned_text = '\n'.join(cleaned_lines).strip()
    return cleaned_text, difficulty

def sanitize_eq(raw: str):
    """Validate and clean a single equation string."""
    if not raw:
        return None
    raw = raw.strip().replace(" ", "")
    # Reject if contains plain english words (more than 3 letters not math funcs)
    math_funcs = r'sqrt|sin|cos|tan|log|exp|abs|pi'
    cleaned = re.sub(math_funcs, '', raw, flags=re.IGNORECASE)
    if re.search(r'[a-zA-Z]{3,}', cleaned):  # leftover words = bad output
        return None
    if len(raw) > 60:
        return None
    # Normalize unicode
    raw = raw.replace("√", "sqrt(").replace("²", "^2").replace("³", "^3")
    raw = raw.replace("×", "*").replace("÷", "/").replace("−", "-")
    # Fix unclosed sqrt( if needed
    if raw.count("(") != raw.count(")"):
        raw += ")" * (raw.count("(") - raw.count(")"))
    # Only allow valid math characters
    if not re.match(r'^[\w\+\-\*\/\^\(\)\.\,]+$', raw):
        return None
    return raw


def get_plot_equations(ptype, question, solution, groq_client):
    """
    Always returns a LIST of equation strings (1 or more).
    Returns [] if nothing can be plotted.
    """
    # Word problems rarely have a simple plottable curve
    if ptype not in ("equation", "direct","calculus","jee_hard"):
        return []

    prompt = f"""You are a strict math graph extraction engine.

Your task: Extract ALL mathematical functions needed to draw the complete graph.

RULES:
- Return one function per line
- No explanations, no words, no sentences
- No "y=", no "f(x)=", no intervals, no spaces
- Convert √ to sqrt(), use ^ for powers
- Each line must be a valid math.js expression

SPECIAL RETURNS (one word only):
- If nothing to plot: NONE
- Return ALL curves needed (e.g. for intersection problems return both)

EXAMPLES:

Question: plot y = x^2
Output:
x^2

Question: Find area between y=x^2 and y=2x
Output:
x^2
2*x

Question: Draw y=sin(x) and y=cos(x)
Output:
sin(x)
cos(x)

Question: Find roots of x^2 - 5x + 6 = 0
Output:
x^2-5*x+6

Question: In how many ways can 5 boys sit...
Output:
NONE

Question: {question}
Output:"""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )
        raw = response.choices[0].message.content.strip()
        print("PLOT EQ RAW:", raw)

        if raw.upper() == "NONE":
            return []

        # Split into lines, sanitize each one
        lines = [line.strip() for line in raw.splitlines() if line.strip()]
        equations = []
        for line in lines:
            clean = sanitize_eq(line)
            if clean:
                equations.append(clean)

        print("PLOT EQS FINAL:", equations)
        return equations

    except Exception as e:
        print("Plot equation error:", e)
        return []




def process_math_question(question):

    print("\nSolving your problem......\n")

    start = time.time()

    # safe defaults
    solution   = "Could not solve"
    difficulty = "Medium"
    ptype      = "unknown"
    final_output = "Could not generate solution"

    classification = classify_problem(question, groq_client)

    ptype = classification["type"]
    graphable = classification["graphable"]
    graph_type = classification["graph_type"]

    print("Detected Type:", ptype)
    print("Graphable:", graphable)
    print("Graph Type:", graph_type)



    if ptype == "equation":

        cleaned = clean_input(question)
        solution = solve_equation(cleaned)

        print(f"SymPy Output: {solution}\n")

        if solution == "Could not solve":

            print("Switching to AI fallback....")

            raw_output = solve_with_fallback(
                question,
                # gemini_client,
                None,
                groq_client
            )

        else:

            formatted_solution = format_solution(solution)

            prompt = build_explanation_prompt(
                question,
                formatted_solution
            )

            raw_output = explain_with_fallback(
                prompt,
                # gemini_client,
                None,
                groq_client
            )

        final_output, difficulty = extract_difficulty(raw_output)


    elif ptype == "direct":

        raw_output = solve_with_fallback(
            question,
            # gemini_client,
            None,
            groq_client
        )

        final_output, difficulty = extract_difficulty(raw_output)


    elif ptype == "word":

        equation = convert_with_fallback(
            question,
            # gemini_client,
            None,
            groq_client
        )

        equation = clean_gemini_output(equation)

        solution = solve_equation(equation)

        print(f"SymPy Output: {solution}\n")

        if solution == "Could not solve":

            print("Switching to AI fallback....")

            raw_output = solve_with_fallback(
                question,
                # gemini_client,
                None,
                groq_client
            )

        else:

            formatted_solution = format_solution(solution)

            prompt = build_explanation_prompt(
                question,
                formatted_solution
            )

            raw_output = explain_with_fallback(
                prompt,
                # gemini_client,
                None,
                groq_client
            )

        final_output, difficulty = extract_difficulty(raw_output)


    elif ptype == "jee_hard":

        raw_output = solve_jee_with_gemini(
            question,
            # gemini_client
            None
        )

        final_output, difficulty = extract_difficulty(raw_output)

        solution = "Advanced reasoning problem"


    elif ptype == "calculus":

        raw_output = solve_with_fallback(
            question,
            # gemini_client,
            None,
            groq_client
        )

        final_output, difficulty = extract_difficulty(raw_output)

        solution = "Calculus problem"


    elif ptype == "unknown":

        final_output = (
            "This doesn't look like a solvable math problem. "
            "Please enter a valid math question."
        )

        difficulty = "—"


    else:

        raw_output = solve_with_fallback(
            question,
            # gemini_client,
            None,
            groq_client
        )

        final_output, difficulty = extract_difficulty(raw_output)

    end = time.time()

    method = "SymPy + Gemini" if solution != "Could not solve" else "Gemini"
    roots  = str(solution)    if solution != "Could not solve" else "N/A"
   
    clean_question = question.lower().replace(" ","")

    if "y" in clean_question:
        roots = "N/A"
        method = "Calculus"
    
    plot_eq = []

    if graphable:

        plot_eq = get_plot_equations(
        ptype,
        question,
        solution,
        groq_client
    )

    print("FINAL PLOT EQS:", plot_eq)
    final_output = beautify_math_text(final_output)

    return {
        "answer": final_output,
        "problem_type": ptype,
        "time_taken":  round(end - start, 2),
        "method":     method,
        "difficulty":  difficulty,
        "roots":     roots,
        "solver":  "SymPy + Gemini",
        "tip":     "-",
        "plot_equation": plot_eq
    }