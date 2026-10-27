from pathlib import Path
from pypdf import PdfReader

def extract_text(file_path):
    extension = Path(file_path).suffix.lower()
    
    if extension == ".txt":
        with open(file_path, "r", encoding="utf-8", errors="ignore") as file:
            return file.read()
    elif extension == ".pdf":
        reader = PdfReader(file_path)
        text = ""
        
        for page in reader.pages:
            text += page.extract_text() or ""
        
        return text
    
    raise ValueError("Unsupported fiel type")