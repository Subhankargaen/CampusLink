import os
import uuid
import aiofiles
from fastapi import UploadFile, HTTPException
from app.config import get_settings

settings = get_settings()

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc"}


def ensure_upload_dirs():
    """Create upload directories if they don't exist."""
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "resumes"), exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "jds"), exist_ok=True)


async def save_upload_file(file: UploadFile, subfolder: str) -> str:
    """Save an uploaded file and return the relative path."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    # Validate extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{ext}' not allowed. Accepted: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Validate file size
    contents = await file.read()
    max_size = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if len(contents) > max_size:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE_MB}MB"
        )

    # Generate unique filename
    unique_name = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, subfolder, unique_name)

    # Save file
    ensure_upload_dirs()
    async with aiofiles.open(file_path, "wb") as out_file:
        await out_file.write(contents)

    return file_path


def get_file_path(relative_path: str) -> str:
    """Get the absolute path for a stored file."""
    return os.path.abspath(relative_path)
