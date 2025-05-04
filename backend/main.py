from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os
import uuid
from pydantic import BaseModel

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React development server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class UploadResponse(BaseModel):
    success: bool
    fileIds: List[str]
    message: str

@app.post("/upload", response_model=UploadResponse)
async def upload_files(files: List[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    if len(files) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 files allowed")
    
    file_ids = []
    error_messages = []
    
    for file in files:
        try:
            # Validate file type
            if not file.content_type == "application/pdf":
                error_messages.append(f"File {file.filename} is not a PDF")
                continue
            
            # Generate unique filename
            file_id = str(uuid.uuid4())
            file_extension = os.path.splitext(file.filename)[1]
            new_filename = f"{file_id}{file_extension}"
            file_path = os.path.join(UPLOAD_DIR, new_filename)
            
            # Save file
            with open(file_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
            
            file_ids.append(file_id)
            
        except Exception as e:
            error_messages.append(f"Error processing {file.filename}: {str(e)}")
    
    if not file_ids and error_messages:
        raise HTTPException(status_code=400, detail=". ".join(error_messages))
    
    return UploadResponse(
        success=True,
        fileIds=file_ids,
        message=f"Successfully uploaded {len(file_ids)} file(s)" + 
                (f". Errors: {' '.join(error_messages)}" if error_messages else "")
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)
