from fastapi import FastAPI,UploadFile, File, HTTPException
from pydantic import BaseModel
from app import process_math_question
from fastapi.middleware.cors import CORSMiddleware
from ocr import extract_text_from_image
import tempfile
import shutil
import uuid
import os


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



@app.post("/solve-image")
async def solve_image(file: UploadFile = File(...)):

    # validate image type
    if file.content_type not in ["image/png", "image/jpeg", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Only PNG/JPG supported")

    # temp file path
    temp_dir = tempfile.gettempdir()

    filename = f"{uuid.uuid4()}_{file.filename}"

    temp_path = os.path.join(temp_dir, filename)

    # save image temporarily
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:

        # OCR
        extracted_text = extract_text_from_image(temp_path)

        if not extracted_text:
            raise HTTPException(status_code=400, detail="Could not extract text")

        print(f"OCR TEXT:", extracted_text)

        # existing solver pipeline
        result = process_math_question(extracted_text)

        # attach OCR text
        result["ocr_text"] = extracted_text

        return result

    finally:

        # cleanup
        if os.path.exists(temp_path):
            os.remove(temp_path)