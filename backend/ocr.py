import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("OCR_SPACE_API_KEY")

def extract_text_from_image(image_path):

    url = "https://api.ocr.space/parse/image"

    with open(image_path,"rb") as f:

        response = requests.post(
            url,
            files={"filename": f},
            data={
                "apikey": API_KEY,
                "language": "eng",
                "isOverlayRequired": False,
                "OCREngine" : 2 ,
            }
        )

    result = response.json()

    try:
        parsed_text = result["ParsedResults"][0]["ParsedText"]
        return parsed_text.strip()

    except Exception as e:
        print("OCR ERROR:", e)
        return None