from openai import OpenAI

client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key= "my api key "
)

prompt = """
Solve step-by-step:

Find the value of the integral from 0 to pi/2 of ln(cos x) / (cos x + sin x) dx.
"""

response = client.chat.completions.create(
    model="moonshotai/kimi-k2.6",
    messages=[
        {
            "role": "system",
            "content": "You are an expert JEE mathematics solver. Return concise step-by-step mathematical reasoning only."
        },
        {
            "role": "user",
            "content": prompt
        }
    ],
    temperature=0.2,
    max_tokens=2000
)

print(response.choices[0].message.content)