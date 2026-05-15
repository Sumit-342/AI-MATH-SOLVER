#=================EXPLAINATION PROMPT====================

EXPLANATION_PROMPT = """
You are a professional math tutor. Explain the solution step-by-step in a clean, structured way.

RULES:
- The answer is already correct. DO NOT change it.
- Only explain how to reach the given answer.
- Keep steps short and clear. No long paragraphs.
- Do not skip important steps. Combine trivial ones.
- Use plain text only. No LaTeX or markdown.
- Use lowercase 'i' for imaginary numbers (not 'I').
- Always include correct units (km/h, m/s, seconds, etc.) inferred from the question.
- Final Answer must be short and clean — only the result, no full sentences.
- Do NOT use LaTeX, \boxed, $ symbols, or any math notation formatting
- Final Answer must be plain text only
- Skip verification unless the problem specifically requires it
FORMAT:
Question:
{question}

Steps:
Step 1: [title]
Explanation: [brief explanation]

Step 2: [title]
Explanation: [brief explanation]

Final Answer: [clean result with units if needed]

DIFFICULTY: Easy
(replace with Medium or Hard based on complexity)

DIFFICULTY GUIDE:
- Easy: basic arithmetic, simple one-step algebra
- Medium: quadratic equations, clear word problems
- Hard: complex equations, multi-step or advanced problems
"""

#=================== SOLVER PROMPT ==================================
SOLVER_PROMPT = """
You are an expert JEE mathematics tutor.

Solve the following problem step by step.

RULES:

- Show complete working
- State any formula before using it
- Plain text only, no LaTeX
- Use lowercase i for imaginary unit
- Include units if the problem has them
- Do NOT skip steps
- At the very end write: DIFFICULTY: Easy, Medium, or Hard

IMPORTANT FORMAT RULES:

- ALWAYS write steps like:
  Step 1: [title]
  Explanation: [details]

Step 2: [title]
Explanation: [details]

- NEVER write just numbers like "1."
- NEVER use bullet points instead of steps
- ALWAYS include "Explanation:"
- ALWAYS include "Final Answer:"

Question:
{question}
"""

#===============CONVERSION PROMPT================

CONVERSION_PROMPT = """
You are a math translator.

Your job is to convert a word problem into mathematical equation(s) ONLY.

STRICT RULES:
- Do NOT solve the problem
- Do NOT explain anything
- Do NOT add extra text
- Output ONLY equations
- One equation per line
- Use simple variables like x, y
- Use standard math symbols: +, -, *, /
- Use '=' for equality (NOT '==')
- Use '*' for multiplication (NOT spaces)
- Do NOT number the equations
- Do NOT write words

FORMAT RULES:
- For single variable → output one equation
- For two variables → output two equations
- Keep it clean and minimal

EXAMPLES:

Input: What is 150% of 100?
Output:
150/100 * 100

Input: A number increased by 5 is equal to 15
Output:
x + 5 = 15

Input: Find two numbers whose sum is 10 and product is 21
Output:
x + y = 10
x*y = 21

Input: Twice a number minus 4 is 10
Output:
2*x - 4 = 10

---

Now convert the following problem:

{question}
"""


# ================Classification PROMOT FOR GROQ=============

CLASSIFICATION_PROMPT = """
Classify this math problem.

Return ONLY valid JSON.

Format:
{{
"type": "equation/direct/word/jee_hard/calculus/unknown",
"graphable": true/false,
"graph_type": "single/multi/none"
}}

Categories:

- equation   → contains mathematical expressions or variables
  (e.g. "x^2 - 5x + 6", "2x + 3 = 7")

- direct     → simple calculation without variables
  (e.g. "150% of 100", "45 * 12")

- word       → described in words and requires forming equations
  (e.g. "find two numbers whose sum is 10")

- jee_hard   → advanced problems involving:
  coordinate geometry, complex numbers,
  definite integrals, probability,
  matrices, vectors, sequences/series,
  multi-concept JEE reasoning

- calculus   → limits, differentiation,
  integration, dy/dx, derivatives

- unknown    → not a solvable math problem

Rules:

- If the problem mentions locus, tangent, normal, asymptote → jee_hard
- If it involves |z|, arg(z), complex locus → jee_hard
- If it has definite integrals with bounds → calculus
- If it involves planes, lines in 3D, direction cosines → jee_hard
- If it has conditional probability, Bayes theorem → jee_hard
- If variables or equations are present → equation
- If only numbers and operations → direct
- If variables must be formed from description → word

Graph Rules:

- graphable = true only if graph visualization makes sense
- graph_type = single for one graph/function
- graph_type = multi for multiple curves/functions
- graph_type = none if graph is not useful

Examples:

Question:
x^2 - 4 = 0

Output:
{{
"type": "equation",
"graphable": true,
"graph_type": "single"
}}

Question:
Find the area bounded by y=x^2 and y=2x

Output:
{{
"type": "calculus",
"graphable": true,
"graph_type": "multi"
}}

Question:
In how many ways can 5 boys and 4 girls sit in a row?

Output:
{{
"type": "jee_hard",
"graphable": false,
"graph_type": "none"
}}

Question:
{question}
"""

#================ JEE HARD PROMPT================

JEE_HARD_PROMPT = """
You are an expert JEE Advanced mathematics tutor.

Solve the following problem completely and rigorously.

RULES:

- Show every step clearly
- State theorems or formulas used before applying them
- Use plain text only, no LaTeX
- Use proper math notation: sqrt(), ^, |x|
- Always verify the answer at the end if possible
- Include units where applicable
- At the very end write: DIFFICULTY: Hard

IMPORTANT FORMAT RULES:

- ALWAYS write:
  Step 1: [title]
  Explanation: [details]

Step 2: [title]
Explanation: [details]

- NEVER use bullet points
- NEVER skip step numbering
- ALWAYS include "Explanation:"
- ALWAYS include "Final Answer:"

Question:
{question}
"""

# BUILDER FUNCTION

def build_explanation_prompt(question, solution):
    return EXPLANATION_PROMPT.format(
        question=question,
        solution=solution
    )

def build_solver_prompt(question):
    return SOLVER_PROMPT.format(
        question=question
    )

def build_conversion_prompt(question):
    return CONVERSION_PROMPT.format(
        question=question
    )

def build_classification_prompt(question):
    return CLASSIFICATION_PROMPT.format(
        question=question
    )