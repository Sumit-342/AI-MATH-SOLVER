from fastapi import FastAPI
from pydantic import BaseModel
from app import process_math_question
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


class MathRequest( BaseModel):
    question : str

@app.get('/')
def home():
    return{'message' : 'FastApi is running'}

@app.post('/solve')
def solve(req : MathRequest):
    result = process_math_question(req.question)
    return result
   