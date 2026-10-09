"""
Resume Parser — Extract structured profile data from PDF/DOCX resumes.

Uses regex + heuristic section detection. No ML models required.
"""

import re
import os
from app.ai.skill_normalizer import normalize_skill


def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from a PDF file."""
    try:
        from PyPDF2 import PdfReader
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text
    except Exception as e:
        return f"[PDF extraction error: {str(e)}]"


def extract_text_from_docx(file_path: str) -> str:
    """Extract text from a DOCX file."""
    try:
        from docx import Document
        doc = Document(file_path)
        text = "\n".join([para.text for para in doc.paragraphs])
        return text
    except Exception as e:
        return f"[DOCX extraction error: {str(e)}]"


def extract_text(file_path: str) -> str:
    """Extract text from a resume file (PDF or DOCX)."""
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    elif ext in (".docx", ".doc"):
        return extract_text_from_docx(file_path)
    else:
        return ""


def extract_email(text: str) -> str | None:
    match = re.search(r'[\w\.\-\+]+@[\w\.\-]+\.\w+', text)
    return match.group(0) if match else None


def extract_phone(text: str) -> str | None:
    match = re.search(r'[\+]?[\d][\d\s\-\(\)]{8,14}[\d]', text)
    return match.group(0).strip() if match else None


def extract_name(text: str) -> str | None:
    """Extract name from the first few lines of the resume."""
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    if lines:
        # First non-empty line is usually the name
        first_line = lines[0]
        # Filter out lines that look like headers/urls/emails
        if '@' not in first_line and 'http' not in first_line.lower() and len(first_line) < 60:
            return first_line
    return None


def extract_cgpa(text: str) -> float | None:
    patterns = [
        r'(?:CGPA|GPA|CPI|SGPA)[\s:]*(\d+\.?\d*)\s*/?\s*(?:10|4)',
        r'(?:CGPA|GPA|CPI)[\s:]*(\d+\.?\d*)',
        r'(\d+\.\d+)\s*/\s*(?:10|4\.0)\s*(?:CGPA|GPA|CPI)?',
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            val = float(match.group(1))
            if 0 < val <= 10:
                return val
    return None


def extract_graduation_year(text: str) -> int | None:
    # Look for 4-digit years near education keywords
    education_section = extract_section(text, ["education", "academic", "qualification"])
    search_text = education_section or text

    matches = re.findall(r'20[1-3]\d', search_text)
    if matches:
        # Return the latest year (likely graduation)
        years = [int(y) for y in matches]
        return max(years)
    return None


def extract_section(text: str, keywords: list[str]) -> str | None:
    """Extract a section of text that starts with one of the given keywords."""
    lines = text.split('\n')
    section_lines = []
    in_section = False
    section_headers = [
        "education", "skills", "experience", "projects", "certification",
        "achievement", "award", "interest", "hobby", "reference",
        "objective", "summary", "contact", "personal", "training",
        "internship", "work", "technical", "professional",
    ]

    for line in lines:
        stripped = line.strip().lower()
        if any(kw in stripped for kw in keywords):
            in_section = True
            continue
        elif in_section:
            # Check if we've hit the next section
            if any(header in stripped for header in section_headers if header not in keywords):
                if len(stripped) < 40:  # Likely a section header
                    break
            section_lines.append(line)

    return '\n'.join(section_lines) if section_lines else None


def extract_skills(text: str) -> list[dict]:
    """Extract skills from the skills section."""
    skills_section = extract_section(text, ["skills", "technical skills", "technologies", "tech stack"])
    search_text = skills_section or text

    # Common delimiters in skill lists
    raw_skills = re.split(r'[,|•·\n\r\t]+', search_text)

    skills = []
    seen = set()
    for s in raw_skills:
        cleaned = s.strip().strip('-').strip('•').strip()
        if cleaned and len(cleaned) < 50 and len(cleaned) > 1:
            normalized = normalize_skill(cleaned)
            if normalized.lower() not in seen:
                seen.add(normalized.lower())
                skills.append({
                    "skill_name": cleaned,
                    "normalized_name": normalized,
                    "source": "resume_parsed",
                })

    return skills[:30]  # Cap at 30 skills


def extract_projects(text: str) -> list[dict]:
    """Extract projects from the projects section."""
    section = extract_section(text, ["projects", "project work", "academic projects"])
    if not section:
        return []

    projects = []
    lines = section.split('\n')
    current_project = None

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        # Heuristic: project titles are often shorter, may be bold or at start
        if len(stripped) < 80 and not stripped.startswith(('-', '•', '*')):
            if current_project:
                projects.append(current_project)
            current_project = {"title": stripped, "description": ""}
        elif current_project:
            current_project["description"] += stripped + " "

    if current_project:
        projects.append(current_project)

    return projects[:10]  # Cap at 10


def extract_experience(text: str) -> list[dict]:
    """Extract work experience from the experience section."""
    section = extract_section(text, ["experience", "work experience", "internship", "employment"])
    if not section:
        return []

    experiences = []
    lines = section.split('\n')
    current_exp = None

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        # Look for company/role patterns
        if len(stripped) < 100 and not stripped.startswith(('-', '•', '*')):
            if current_exp:
                experiences.append(current_exp)
            current_exp = {"company": stripped, "role": "", "description": ""}
        elif current_exp:
            current_exp["description"] += stripped + " "

    if current_exp:
        experiences.append(current_exp)

    return experiences[:10]


def extract_certifications(text: str) -> list[dict]:
    """Extract certifications."""
    section = extract_section(text, ["certification", "certificates", "certified"])
    if not section:
        return []

    certs = []
    lines = section.split('\n')
    for line in lines:
        stripped = line.strip().strip('-').strip('•').strip()
        if stripped and len(stripped) > 3 and len(stripped) < 200:
            certs.append({"name": stripped, "issuer": ""})

    return certs[:10]


def extract_links(text: str) -> list[str]:
    """Extract URLs from the resume."""
    urls = re.findall(r'https?://[^\s<>"\']+', text)
    return list(set(urls))[:10]


def parse_resume(file_path: str) -> dict:
    """Parse a resume file and return structured data.

    Returns a dictionary with all extracted fields.
    """
    text = extract_text(file_path)
    if not text or text.startswith("["):
        return {"error": "Could not extract text from resume", "raw_text": text}

    result = {
        "name": extract_name(text),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "cgpa": extract_cgpa(text),
        "graduation_year": extract_graduation_year(text),
        "skills": extract_skills(text),
        "projects": extract_projects(text),
        "experience": extract_experience(text),
        "certifications": extract_certifications(text),
        "links": extract_links(text),
        "raw_text_length": len(text),
    }

    return result
