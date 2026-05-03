from sympy import symbols, sympify, solve, nsolve,Eq
from sympy.core.sympify import SympifyError

def solve_equation(question):
    x = symbols("x")

    try:
        question = question.replace("^", "**")

        if "=" in question:
            left, right = question.split("=", 1)
            expr = sympify(left) - sympify(right)
        else:
            expr = sympify(question)

        # symbolic solve first
        solution = solve(expr, x)
        if solution:
            return solution

        #  numeric fallback (multi-guess)
        numeric_solutions = []

        guesses = [-10, -5, -1, 0.1, 1, 5, 10]

        for guess in guesses:
            try:
                sol = nsolve(expr, x, guess)

                # remove duplicates
                if not any(abs(sol - s) < 1e-6 for s in numeric_solutions):
                    numeric_solutions.append(sol)

            except Exception:
                continue

        if numeric_solutions:
            return numeric_solutions

        return "Could not solve"

    except SympifyError:
        return "Could not solve"

    except Exception:
        return "Could not solve"



def solve_system(equations):
    x,y = symbols('x y ')

    sympy_eqn = []

    for eqn in equations:
        left , right = eqn.split("=")
        sympy_eqn.append(Eq(sympify(left), sympify(right)))
    
    solution = solve(sympy_eqn, (x ,y))

    return solution