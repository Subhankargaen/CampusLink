"""
JD Parser — Extract structured job requirements from job descriptions.

Classifies requirements as HARD (mandatory) vs SOFT (preferred).
"""

import re
from app.ai.skill_normalizer import normalize_skill, normalize_skills


# Known branch names for matching
KNOWN_BRANCHES = [
    "CSE", "Computer Science", "IT", "Information Technology",
    "ECE", "Electronics", "EEE", "Electrical", "Mechanical",
    "Civil", "Chemical", "Biotech", "Biotechnology",
    "Mathematics", "Physics", "MCA", "BCA",
]

HARD_KEYWORDS = ["must have", "required", "mandatory", "minimum", "essential", "necessary"]
SOFT_KEYWORDS = ["preferred", "good to have", "nice to have", "bonus", "desirable", "optional", "advantage"]


def parse_jd_text(text: str) -> dict:
    """Parse a job description text and extract structured requirements."""

    result = {
        "job_role": extract_job_role(text),
        "location": extract_location(text),
        "ctc_lpa": extract_ctc(text),
        "eligible_branches": extract_branches(text),
        "min_cgpa": extract_min_cgpa(text),
        "max_backlogs": extract_backlog_requirement(text),
        "required_batch": extract_batch(text),
        "mandatory_skills": [],
        "preferred_skills": [],
        "min_experience_months": extract_experience_months(text),
        "selection_process": extract_selection_process(text),
        "hard_requirements": [],
        "soft_requirements": [],
    }

    # Extract and classify skills
    all_skills = extract_all_skills(text)
    mandatory, preferred = classify_skills(text, all_skills)
    result["mandatory_skills"] = normalize_skills(mandatory)
    result["preferred_skills"] = normalize_skills(preferred)

    # Build hard/soft requirement summaries
    if result["eligible_branches"]:
        result["hard_requirements"].append(f"Branch: {', '.join(result['eligible_branches'])}")
    if result["min_cgpa"]:
        result["hard_requirements"].append(f"Minimum CGPA: {result['min_cgpa']}")
    if result["max_backlogs"] is not None:
        result["hard_requirements"].append(f"Maximum backlogs: {result['max_backlogs']}")
    if result["required_batch"]:
        result["hard_requirements"].append(f"Batch: {result['required_batch']}")
    if result["mandatory_skills"]:
        result["hard_requirements"].append(f"Skills: {', '.join(result['mandatory_skills'])}")

    if result["preferred_skills"]:
        result["soft_requirements"].append(f"Preferred skills: {', '.join(result['preferred_skills'])}")

    return result


def extract_job_role(text: str) -> str | None:
    patterns = [
        r'(?:role|position|title|designation)[\s:]+([^\n]+)',
        r'(?:hiring|looking for|recruiting)[\s:]+(?:a\s+)?([^\n]+)',
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).strip()[:100]
    return None


def extract_location(text: str) -> str | None:
    patterns = [
        r'(?:location|office|based in|work location)[\s:]+([^\n]+)',
        r'(?:Bangalore|Bengaluru|Mumbai|Delhi|Hyderabad|Pune|Chennai|Kolkata|Noida|Gurgaon|Gurugram|Remote|Hybrid)',
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(0).strip() if match.lastindex is None else match.group(1).strip()
    return None


def extract_ctc(text: str) -> float | None:
    patterns = [
        r'(\d+(?:\.\d+)?)\s*(?:LPA|lpa|Lakh|lakhs?\s*per\s*annum)',
        r'(?:CTC|ctc|salary|package)[\s:]*(?:Rs\.?\s*)?(\d+(?:\.\d+)?)\s*(?:LPA|lpa|L)',
        r'(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*(?:LPA|lpa)',
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            if match.lastindex and match.lastindex >= 2:
                # Range: take the higher end
                return float(match.group(2))
            return float(match.group(1))
    return None


def extract_branches(text: str) -> list[str]:
    found = []
    text_lower = text.lower()
    branch_map = {
        "cse": "CSE", "computer science": "CSE", "cs": "CSE",
        "it": "IT", "information technology": "IT",
        "ece": "ECE", "electronics and communication": "ECE", "electronics": "ECE",
        "eee": "EEE", "electrical": "EEE",
        "mechanical": "MECH", "mech": "MECH",
        "civil": "CIVIL",
    }
    for key, val in branch_map.items():
        if key in text_lower and val not in found:
            found.append(val)
    return found


def extract_min_cgpa(text: str) -> float | None:
    patterns = [
        r'(?:minimum|min)?\s*(?:CGPA|GPA|CPI)[\s:]*(?:of\s+)?(\d+\.?\d*)',
        r'(\d+\.?\d*)\s*(?:CGPA|GPA|CPI)\s*(?:and above|or above|\+|minimum)',
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            val = float(match.group(1))
            if 0 < val <= 10:
                return val
    return None


def extract_backlog_requirement(text: str) -> int | None:
    patterns = [
        r'no\s*(?:active\s+)?backlog',
        r'(?:backlog|backlogs)[\s:]*(\d+)',
        r'zero\s*backlog',
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            if "no" in match.group(0).lower() or "zero" in match.group(0).lower():
                return 0
            if match.lastindex:
                return int(match.group(1))
    return None


def extract_batch(text: str) -> int | None:
    patterns = [
        r'(?:batch|graduating|graduation)\s*(?:of|year)?[\s:]*(\d{4})',
        r'(\d{4})\s*(?:batch|pass\s*out|graduating)',
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            year = int(match.group(1))
            if 2020 <= year <= 2030:
                return year
    return None


def extract_experience_months(text: str) -> int:
    patterns = [
        r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?experience',
        r'experience[\s:]*(\d+)\+?\s*(?:years?|yrs?)',
        r'(\d+)\+?\s*(?:months?|mos?)\s*(?:of\s+)?experience',
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            val = int(match.group(1))
            if "month" in pattern.lower() or "mo" in pattern.lower():
                return val
            return val * 12  # Convert years to months
    return 0


def extract_all_skills(text: str) -> list[str]:
    """Extract potential skill mentions from the text."""
    from app.ai.skill_normalizer import SKILL_ALIASES
    found = []
    text_lower = text.lower()

    # Check each known skill
    for alias, canonical in SKILL_ALIASES.items():
        if alias in text_lower and canonical not in found:
            found.append(canonical)

    return found


def classify_skills(text: str, skills: list[str]) -> tuple[list[str], list[str]]:
    """Classify skills as mandatory vs preferred based on context."""
    text_lower = text.lower()
    mandatory = []
    preferred = []

    # Check if text has explicit sections
    has_required_section = any(kw in text_lower for kw in ["required skills", "must have", "mandatory"])
    has_preferred_section = any(kw in text_lower for kw in ["preferred", "nice to have", "good to have"])

    if has_required_section and has_preferred_section:
        # Try to split by sections
        req_idx = -1
        pref_idx = -1
        for kw in HARD_KEYWORDS:
            idx = text_lower.find(kw)
            if idx != -1 and (req_idx == -1 or idx < req_idx):
                req_idx = idx
        for kw in SOFT_KEYWORDS:
            idx = text_lower.find(kw)
            if idx != -1 and (pref_idx == -1 or idx < pref_idx):
                pref_idx = idx

        for skill in skills:
            skill_lower = skill.lower()
            skill_idx = text_lower.find(skill_lower)
            if skill_idx == -1:
                mandatory.append(skill)  # Default to mandatory
            elif pref_idx != -1 and skill_idx > pref_idx:
                preferred.append(skill)
            else:
                mandatory.append(skill)
    else:
        # No clear sections — first 60% mandatory, rest preferred
        split = int(len(skills) * 0.6)
        mandatory = skills[:split] if split > 0 else skills
        preferred = skills[split:] if split < len(skills) else []

    return mandatory, preferred


def extract_selection_process(text: str) -> list[str]:
    """Extract selection process steps."""
    process_keywords = [
        "aptitude", "coding test", "online test", "technical round",
        "hr round", "interview", "group discussion", "gd",
        "coding round", "machine coding", "system design round",
        "managerial round", "final round",
    ]
    found = []
    text_lower = text.lower()
    for kw in process_keywords:
        if kw in text_lower and kw not in found:
            found.append(kw.title())
    return found
