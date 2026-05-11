import re
from prompts import CLASSIFICATION_PROMPT,EXPLANATION_PROMPT,SOLVER_PROMPT,CONVERSION_PROMPT
from google import genai
from sympy import N

def clean_input(q):
    q = q.strip()       # removing extra space

    q = q.replace("^","**")  # replacing ^ --> **

    q = q.replace("= 0","").replace("=0","")

    # add * between number and variable (2x → 2*x)
    q = re.sub(r'(\d)([a-zA-Z])', r'\1*\2', q)

    # add * between variable and number (x2 → x*2) 
    q = re.sub(r'([a-zA-Z])(\d)', r'\1*\2', q)

    # normalize spaces around operators
    q = re.sub(r'\s*([\+\-\/])\s', r' \1 ', q)

    # remove extra spaces
    q = re.sub(r'\s+', ' ', q)

    return q


def clean_equation_output(q):
    lines = q.split("\n")
    cleaned = []

    for line in lines:
        line = line.strip()
        if line:
            line = line.replace("==","=")
            cleaned.append(line)

    return cleaned


def is_word_problem(question):
    return any(word in question.lower() for word in ["find","what","number","sum","product","subtract","difference"])


def classify_problem(question,client):
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "user",
                "content": CLASSIFICATION_PROMPT.format(question=question)
            }
        ],
        temperature=0
    )

    result = response.choices[0].message.content.strip().lower()

    valid = ["equation", "direct", "word", "unknown"]

    for v in valid:
        if v in result:
            return v

    return "unknown"


def explain_with_fallback(prompt, gemini_client, groq_client):
    try:
        response = gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text

    except Exception:
        print("Gemini failed, switching to Groq.....")
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content
    


def solve_with_fallback(question, gemini_client, groq_client):
    prompt = SOLVER_PROMPT.format(question=question)

    try:
        response = gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text

    except:
        print("Gemini failed, switching to Groq...")

        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        return response.choices[0].message.content
    

def convert_with_fallback(question, gemini_client, groq_client):
    prompt = CONVERSION_PROMPT.format(question=question)

    try:
        # 🔵 Gemini try
        response = gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text.strip()

    except Exception:
        print("Gemini conversion failed, switching to Groq...")

        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        return response.choices[0].message.content.strip()
    


def clean_gemini_output(text):
    lines = text.split("\n")
    
    cleaned_lines = []

    for line in lines:
        line = line.strip()

        # skip empty lines
        if not line:
            continue

        # keep only lines that look like equations
        if "=" in line:
            cleaned_lines.append(line)

    return "\n".join(cleaned_lines)


def format_solution(solution):
    try:
        exact = solution
        approx = [round(float(N(sol)), 4) for sol in solution]
        
        # skip approx if it's the same as exact
        if all(float(N(sol)) == round(float(N(sol)), 4) for sol in solution):
            return f"Exact: {exact}"
        
        return f"Exact: {exact}\nApprox: {approx}"
    except:
        return str(solution)