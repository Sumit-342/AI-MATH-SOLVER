import re
from prompts import CLASSIFICATION_PROMPT,EXPLANATION_PROMPT,SOLVER_PROMPT,CONVERSION_PROMPT, JEE_HARD_PROMPT
# from google import genai
import requests
import os
from sympy import N
import json

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



def classify_problem(question, groq_client):

    prompt = CLASSIFICATION_PROMPT.format(question=question)

    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0
    )

    text = response.choices[0].message.content.strip()

    print("RAW CLASSIFIER:", text)

    try:
        return json.loads(text)
    except Exception as e:
        print("Classification JSON error:", e)

        return {
            "type": "unknown",
            "graphable": False,
            "graph_type": "none"
        }




def kimi_generate(prompt):

    invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {os.getenv('KIMI_API_KEY')}",
        "Accept": "application/json"
    }

    payload = {
        "model": "moonshotai/kimi-k2.6",
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are an expert JEE mathematics solver. "
                    "Solve step-by-step clearly and accurately."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "max_tokens": 4000,
        "temperature": 0.2,
        "top_p": 1.0,
        "stream": False,
        "chat_template_kwargs": {
            "thinking": True
        }
    }

    response = requests.post(
        invoke_url,
        headers=headers,
        json=payload
    )

    data = response.json()
    print(data)
    return data["choices"][0]["message"]["content"]

def explain_with_fallback(prompt, gemini_client, groq_client):
    try:
        # response = gemini_client.models.generate_content(
        #     model="gemini-2.5-flash",
        #     contents=prompt
        # )
        # return response.text
        return kimi_generate(prompt)

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
        # response = gemini_client.models.generate_content(
        #     model="gemini-2.5-flash",
        #     contents=prompt
        # )
        # return response.text
        return kimi_generate(prompt)

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
        # # 🔵 Gemini try
        # response = gemini_client.models.generate_content(
        #     model="gemini-2.5-flash",
        #     contents=prompt
        # )
        # return response.text.strip()
        return kimi_generate(prompt).strip()

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
    
def solve_jee_with_gemini(question, gemini_client):
    prompt = JEE_HARD_PROMPT.format(question=question)
    try:
        # response = gemini_client.models.generate_content(
        #     model="gemini-2.5-flash",
        #     contents=prompt
        # )
        # return response.text
        return kimi_generate(prompt)
    except Exception as e:
        print(f"Gemini JEE solve failed: {e}")
        return "Could not solve this problem. Please try rephrasing."




def beautify_math_text(text: str) -> str:
    """
    Beautifies plain-text math notation into readable textbook-style symbols.
    Safe post-processing only — does NOT change meaning, no LaTeX, no restructuring.
    """

    if not text or not isinstance(text, str):
        return text

    # ── SUPERSCRIPT MAP ───────────────────────────────────────
    SUPERSCRIPT = str.maketrans(
        "0123456789+-",
        "⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻"
    )

    def to_superscript(n: str) -> str:
        """Convert digit string to superscript unicode characters."""
        return n.translate(SUPERSCRIPT)

    # ── SUBSCRIPT MAP ─────────────────────────────────────────
    SUBSCRIPT = str.maketrans(
        "0123456789",
        "₀₁₂₃₄₅₆₇₈₉"
    )

    def to_subscript(n: str) -> str:
        return n.translate(SUBSCRIPT)

    # ================================================================
    # STEP 1 — Powers / Exponents
    # x^2 → x²   x^10 → x¹⁰   x^(n+1) skipped (complex exponent)
    # ================================================================

    # Simple numeric exponents: x^2, x^23, (x+1)^3
    # Pattern: any char or ) followed by ^ and digits only
    def replace_simple_power(m):
        base = m.group(1)     # what's before ^
        exp  = m.group(2)     # the digits
        return base + to_superscript(exp)

    text = re.sub(
        r'(\w|\))\^(\d+)',
        replace_simple_power,
        text
    )

    # e^x → eˣ  (single letter exponent)
    SUPER_ALPHA = {'x': 'ˣ', 'n': 'ⁿ', 'a': 'ᵃ', 'b': 'ᵇ',
                   'i': 'ⁱ', 'k': 'ᵏ', 'm': 'ᵐ', 't': 'ᵗ'}

    def replace_letter_power(m):
        base   = m.group(1)
        letter = m.group(2)
        sup    = SUPER_ALPHA.get(letter)
        # Only replace if we have a unicode superscript for it
        return (base + sup) if sup else m.group(0)

    text = re.sub(
        r'(\w|\))\^([a-z])',
        replace_letter_power,
        text
    )

    # ================================================================
    # STEP 2 — Square roots / nth roots
    # sqrt(x) → √(x)    sqrt(x+1) → √(x+1)
    # cbrt(x) → ∛(x)
    # ================================================================

    text = re.sub(r'\bsqrt\b',  '√',  text, flags=re.IGNORECASE)
    text = re.sub(r'\bcbrt\b',  '∛',  text, flags=re.IGNORECASE)
    text = re.sub(r'\bsqrt2\b', '√2', text, flags=re.IGNORECASE)

    # ================================================================
    # STEP 3 — Greek letters (whole word only, case-sensitive where needed)
    # Protects words like "alphabet", "beta-testing", "therapist"
    # ================================================================

    GREEK = {
        # Lowercase
        r'\balpha\b':   'α',
        r'\bbeta\b':    'β',
        r'\bgamma\b':   'γ',
        r'\bdelta\b':   'δ',
        r'\bepsilon\b': 'ε',
        r'\btheta\b':   'θ',
        r'\blambda\b':  'λ',
        r'\bmu\b':      'μ',
        r'\bnu\b':      'ν',
        r'\bxi\b':      'ξ',
        r'\bpi\b':      'π',
        r'\brho\b':     'ρ',
        r'\bsigma\b':   'σ',
        r'\btau\b':     'τ',
        r'\bphi\b':     'φ',
        r'\bchi\b':     'χ',
        r'\bpsi\b':     'ψ',
        r'\bomega\b':   'ω',
        r'\beta\b':     'η',    # eta — careful: check after beta
        # Uppercase
        r'\bGamma\b':   'Γ',
        r'\bDelta\b':   'Δ',
        r'\bTheta\b':   'Θ',
        r'\bLambda\b':  'Λ',
        r'\bSigma\b':   'Σ',
        r'\bPhi\b':     'Φ',
        r'\bPsi\b':     'Ψ',
        r'\bOmega\b':   'Ω',
    }

    for pattern, symbol in GREEK.items():
        text = re.sub(pattern, symbol, text)

    # ================================================================
    # STEP 4 — Constants and special values
    # ================================================================

    # pi/π already handled above
    text = re.sub(r'\binfinity\b',  '∞',  text, flags=re.IGNORECASE)
    text = re.sub(r'\binf\b',       '∞',  text, flags=re.IGNORECASE)
    text = re.sub(r'\-infinity\b',  '-∞', text, flags=re.IGNORECASE)
    text = re.sub(r'\bE\b',         'e',  text)   # Euler's number uppercase

    # ================================================================
    # STEP 5 — Comparison and logic operators
    # Order matters: longer patterns first to avoid partial replacement
    # ================================================================

    # Arrows — do before single = or > checks
    text = text.replace('=>',  '⟹')   # logical implies
    text = text.replace('->',  '→')
    text = text.replace('<-',  '←')
    text = text.replace('<=>',  '⟺')
    text = text.replace('...',  '…')

    # Inequalities — order: <= before <, >= before >
    text = text.replace('<=',  '≤')
    text = text.replace('>=',  '≥')
    text = text.replace('!=',  '≠')
    text = text.replace('~=',  '≈')
    text = text.replace('+-',  '±')
    text = text.replace('+/-', '±')

    # Set / logic symbols
    text = text.replace('∈',   '∈')   # already unicode, keep
    text = re.sub(r'\bforall\b', '∀', text, flags=re.IGNORECASE)
    text = re.sub(r'\bexists\b', '∃', text, flags=re.IGNORECASE)
    

    # ================================================================
    # STEP 6 — Multiplication dot
    # Converts "3 * x" → "3·x" but NOT inside words or URLs
    # ================================================================

    # Only replace * when surrounded by math tokens (digit/var), not **
    text = re.sub(
        r'(?<!\*)(?<![a-zA-Z])\*(?!\*)(?![a-zA-Z])',
        '·',
        text
    )
    # "2 * x" style with spaces
    text = re.sub(r'(\d)\s*\*\s*([a-zA-Z])', r'\1·\2', text)
    text = re.sub(r'([a-zA-Z])\s*\*\s*(\d)', r'\1·\2', text)

    # ================================================================
    # STEP 7 — Fractions  "1/2" → "½"  (only common ones, safe)
    # ================================================================

    FRACTIONS = {
        '1/2': '½',  '1/3': '⅓',  '2/3': '⅔',
        '1/4': '¼',  '3/4': '¾',  '1/8': '⅛',
        '3/8': '⅜',  '5/8': '⅝',  '7/8': '⅞',
    }

    for plain, symbol in FRACTIONS.items():
        # Only replace when surrounded by spaces or line boundaries
        # Avoids breaking "http://..." or "127.0.0.1/path"
        text = re.sub(
            r'(?<!\w)' + re.escape(plain) + r'(?!\w)',
            symbol,
            text
        )

    # ================================================================
    # STEP 8 — Absolute value  |x|  stays as-is (already readable)
    # Integral / summation notation — leave as-is (no safe unicode)
    # ================================================================

    # ================================================================
    # STEP 9 — Subscripts  x_1 → x₁   x_n stays as x_n (letter sub)
    # ================================================================

    def replace_subscript(m):
        base = m.group(1)
        sub  = m.group(2)
        return base + to_subscript(sub)

    text = re.sub(
        r'([a-zA-Z])_(\d+)',
        replace_subscript,
        text
    )

    # ================================================================
    # STEP 10 — Degree symbol   "90 degrees" → "90°"
    # ================================================================

    text = re.sub(r'(\d+)\s*degrees?\b', r'\1°', text, flags=re.IGNORECASE)
    text = re.sub(r'(\d+)\s*deg\b',      r'\1°', text, flags=re.IGNORECASE)

    # ================================================================
    # STEP 11 — Tidy up spacing around symbols we just inserted
    # e.g. "x ² " → "x²"  (no space before superscript)
    # ================================================================

    # Remove space before superscript/subscript characters
    text = re.sub(r'\s+([⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ⁿˣ])', r'\1', text)
    text = re.sub(r'\s+([₀₁₂₃₄₅₆₇₈₉])',        r'\1', text)

    # Ensure single space around → ≤ ≥ ≠ ≈ ∈
    for sym in ['→', '←', '≤', '≥', '≠', '≈', '∈', '∀', '∃', '⟹', '⟺']:
        text = re.sub(r'\s*' + re.escape(sym) + r'\s*', f' {sym} ', text)

    # Clean up any double spaces introduced
    text = re.sub(r'  +', ' ', text)

    return text.strip()