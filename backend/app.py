import os
from dotenv import load_dotenv
from google import genai
from groq import Groq
from prompts import EXPLANATION_PROMPT, SOLVER_PROMPT, CONVERSION_PROMPT, build_classification_prompt, build_conversion_prompt, build_explanation_prompt, build_solver_prompt
from solver import solve_equation, solve_system
from utils import clean_input, clean_equation_output, is_word_problem, classify_problem, explain_with_fallback, solve_with_fallback, convert_with_fallback, clean_gemini_output, format_solution
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


def get_plot_equation(ptype, question, solution):
    """Return a plottable equation string or None"""
    if ptype == "equation":
        cleaned = clean_input(question)
        # remove = 0 if present, return left side
        if "=" in cleaned:
            return cleaned.split("=")[0].strip()
        return cleaned
    return None

def process_math_question(question):

    print("\nSolving your problem......\n")

    start = time.time()

    # safe defaults
    solution   = "Could not solve"
    difficulty = "Medium"
    ptype      = "unknown"

    ptype = classify_problem(question, groq_client)
    print("Detected Type:", ptype)

    if ptype == "equation":
        cleaned  = clean_input(question)
        solution = solve_equation(cleaned)
        print(f"SymPy Output: {solution}\n")

        if solution == "Could not solve":
            print("Switching to AI fallback....")
            raw_output = solve_with_fallback(question, gemini_client, groq_client)
        else:
            formatted_solution = format_solution(solution)
            prompt     = build_explanation_prompt(question, formatted_solution)
            raw_output = explain_with_fallback(prompt, gemini_client, groq_client)

        final_output, difficulty = extract_difficulty(raw_output)

    elif ptype == "direct":
        raw_output   = solve_with_fallback(question, gemini_client, groq_client)
        final_output, difficulty = extract_difficulty(raw_output)

    elif ptype == "word":
        equation = convert_with_fallback(question, gemini_client, groq_client)
        equation = clean_gemini_output(equation)
        solution = solve_equation(equation)
        print(f"SymPy Output: {solution}\n")

        if solution == "Could not solve":
            print("Switching to AI fallback....")
            raw_output = solve_with_fallback(question, gemini_client, groq_client)
        else:
            formatted_solution = format_solution(solution)
            prompt     = build_explanation_prompt(question, formatted_solution)
            raw_output = explain_with_fallback(prompt, gemini_client, groq_client)

        final_output, difficulty = extract_difficulty(raw_output)

    elif ptype == "unknown":
        final_output = "This doesn't look like a solvable math problem. Please enter a valid math question."
        difficulty   = "—"

    else:
        raw_output   = solve_with_fallback(question, gemini_client, groq_client)
        final_output, difficulty = extract_difficulty(raw_output)

    end = time.time()

    method = "SymPy + Gemini" if solution != "Could not solve" else "Gemini"
    roots  = str(solution)    if solution != "Could not solve" else "N/A"

    plot_eq = get_plot_equation(ptype, question, solution)

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