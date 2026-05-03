import os
from dotenv import load_dotenv
from google import genai
from groq import Groq
from prompts import EXPLANATION_PROMPT ,SOLVER_PROMPT , CONVERSION_PROMPT , build_classification_prompt, build_conversion_prompt,build_explanation_prompt, build_solver_prompt
from solver import solve_equation , solve_system
from utils import clean_input , clean_equation_output,is_word_problem,classify_problem,explain_with_fallback,solve_with_fallback,convert_with_fallback, clean_gemini_output,format_solution
import time


load_dotenv()

#gemini api call
gemini_client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

# groq api call
groq_client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


question = input("Enter Your math question : ")

print("\nSolving your problem......\n")

start = time.time()

ptype = classify_problem(question,groq_client)
print("Detected Type : ",ptype)

if ptype == "equation":
    cleaned = clean_input(question)
    solution = solve_equation(cleaned)
    print(f"SymPy Output  : {solution}\n")

    if solution == "Could not solve":
        print("Switching to AI fallback....")
        final_output = solve_with_fallback(question, gemini_client, groq_client)
    else:
        formatted_solution = format_solution(solution)
        prompt = build_explanation_prompt(question, formatted_solution)
        final_output = explain_with_fallback(prompt, gemini_client, groq_client)


elif ptype == "direct":
    final_output = solve_with_fallback(question, gemini_client, groq_client)


elif ptype == "word":
    equation = convert_with_fallback(question, gemini_client, groq_client)
    equation = clean_gemini_output(equation)
    solution = solve_equation(equation)
    print(f"SymPy Output  : {solution}\n")

    if solution == "Could not solve":
        print("Switching to AI fallback....")
        final_output = solve_with_fallback(question, gemini_client, groq_client)
    else:
        formatted_solution = format_solution(solution)
        prompt = build_explanation_prompt(question, formatted_solution)
        final_output = explain_with_fallback(prompt, gemini_client, groq_client)


elif ptype == "unknown":
    final_output = "This doesn't look like a solvable math problem. Please enter a valid math question."


else:
    final_output = solve_with_fallback(question, gemini_client, groq_client)


end = time.time()
print(final_output)
print("Time:", round(end - start, 2), "seconds")