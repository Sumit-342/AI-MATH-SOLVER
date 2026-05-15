import os , re
from dotenv import load_dotenv
from google import genai
from groq import Groq
from prompts import EXPLANATION_PROMPT, SOLVER_PROMPT, CONVERSION_PROMPT, build_classification_prompt, build_conversion_prompt, build_explanation_prompt, build_solver_prompt
from solver import solve_equation, solve_system
from utils import clean_input, clean_equation_output, is_word_problem, classify_problem, explain_with_fallback, solve_with_fallback, convert_with_fallback, clean_gemini_output, format_solution, solve_jee_with_gemini
import time

load_dotenv()

gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def extract_difficulty(text):
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




def sanitize_plot_eq(raw: str) -> str | None:
    if not raw:
        return None
    
    raw = raw.strip()
    
    # Reject if it contains these dead giveaways of bad output
    bad_patterns = ["from", "to", "where", "curve", "area", " ", "\n", "x="]
    for bad in bad_patterns:
        if bad in raw.lower():
            return None
    
    # Reject if too long (valid expressions are short)
    if len(raw) > 50:
        return None
    
    # Reject NONE / MULTI
    if raw.upper() in ("NONE", "MULTI"):
        return None
    
    # Normalize unicode math symbols
    raw = raw.replace("√", "sqrt(") 
    raw = raw.replace("²", "^2").replace("³", "^3")
    raw = raw.replace("×", "*").replace("÷", "/")
    raw = raw.replace("−", "-")
    
    # If we added sqrt( without closing ), close it
    if raw.count("(") != raw.count(")"):
        raw += ")"
    
    # Validate: only allow math characters
    if not re.match(r'^[a-zA-Z0-9\+\-\*\/\^\(\)\.\,\_]+$', raw):
        return None
    
    return raw

def get_plot_equation(question, groq_client):

    prompt = f"""

    You are a strict math graph extraction engine.

    Your task:
    Extract ONLY a valid mathematical function that can be directly parsed by math.js.

    STRICT RULES:

    - Return ONLY the function expression
    - No sentences
    - No explanations
    - No intervals
    - No extra text
    - No punctuation
    - No "from x=..."
    - No words like "curve", "area", "graph"
    - No variable descriptions

    VALID OUTPUT EXAMPLES:
    x^2
    sin(x)
    sqrt(x)
    x^3-x
    2*x+1

    SPECIAL RULES:

    - If graph is impossible or not meaningful, return ONLY:
    NONE

    - If the problem requires multiple functions/curves, return ONLY:
    MULTI

    - Convert √x into sqrt(x)

    - Never include y=

    - Never include spaces

    EXAMPLES:

    Question:
    y=x^2
    Output:
    x^2

    Question:
    Find the graph of y=sin(x)
    Output:
    sin(x)

    Question:
    Find area under y=√x from x=0 to x=4
    Output:
    sqrt(x)

    Question:
    Find area bounded by y=x^2 and y=2x
    Output:
    MULTI

    Question:
    In how many ways can 5 boys and 4 girls sit...
    Output:
    NONE

    Question:
    {question}
    """

    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0
    )

    result = response.choices[0].message.content.strip()

    print("PLOT EQ:", result)

    return result



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
                gemini_client,
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
                gemini_client,
                groq_client
            )

        final_output, difficulty = extract_difficulty(raw_output)


    elif ptype == "direct":

        raw_output = solve_with_fallback(
            question,
            gemini_client,
            groq_client
        )

        final_output, difficulty = extract_difficulty(raw_output)


    elif ptype == "word":

        equation = convert_with_fallback(
            question,
            gemini_client,
            groq_client
        )

        equation = clean_gemini_output(equation)

        solution = solve_equation(equation)

        print(f"SymPy Output: {solution}\n")

        if solution == "Could not solve":

            print("Switching to AI fallback....")

            raw_output = solve_with_fallback(
                question,
                gemini_client,
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
                gemini_client,
                groq_client
            )

        final_output, difficulty = extract_difficulty(raw_output)


    elif ptype == "jee_hard":

        raw_output = solve_jee_with_gemini(
            question,
            gemini_client
        )

        final_output, difficulty = extract_difficulty(raw_output)

        solution = "Advanced reasoning problem"


    elif ptype == "calculus":

        raw_output = solve_with_fallback(
            question,
            gemini_client,
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
            gemini_client,
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
    

    if graphable:

        raw_eq = get_plot_equation(question, groq_client)

        plot_eq = sanitize_plot_eq(raw_eq)

        print("SANITIZED PLOT EQ:", plot_eq)

    else:

        plot_eq = None

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