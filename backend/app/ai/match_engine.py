"""
Match Engine — 7-factor weighted candidate matching with full explainability.

Scores: 0-100 scale.
Weights: Mandatory Skills (40), Project Relevance (20), Preferred Skills (10),
         Experience (10), Academic Fit (10), Certifications (5), Other (5).
"""

import json
from app.ai.skill_normalizer import normalize_skill


def compute_match_score(student: dict, job: dict) -> dict:
    """Compute an explainable match score for a student against a job.

    Args:
        student: dict with skills (list[str]), projects (list[dict]), experiences (list[dict]),
                 certifications (list[dict]), cgpa, branch, profile fields
        job: dict with mandatory_skills, preferred_skills, eligible_branches, min_cgpa, etc.

    Returns:
        dict with overall_score, factor_scores, matched_skills, missing_skills,
        relevant_projects, explanation, confidence
    """
    student_skills = set(s.lower() for s in student.get("skills", []))
    mandatory = [s.lower() for s in job.get("mandatory_skills", [])]
    preferred = [s.lower() for s in job.get("preferred_skills", [])]
    all_job_skills = set(mandatory + preferred)

    # ── Factor 1: Mandatory Skills (40%) ──
    if mandatory:
        matched_mandatory = [s for s in mandatory if s in student_skills]
        mandatory_score = (len(matched_mandatory) / len(mandatory)) * 40
    else:
        matched_mandatory = []
        mandatory_score = 40  # No skills required → full marks

    # ── Factor 2: Project Relevance (20%) ──
    project_scores = []
    relevant_projects = []
    for proj in student.get("projects", []):
        proj_skills = set(s.lower() for s in proj.get("tech_stack", []))
        proj_desc = (proj.get("description") or "").lower()

        # Count skill overlap
        overlap = proj_skills & all_job_skills
        desc_overlap = sum(1 for s in all_job_skills if s in proj_desc)
        total_overlap = len(overlap) + min(desc_overlap, 3)

        if all_job_skills:
            relevance = min(total_overlap / len(all_job_skills), 1.0)
        else:
            relevance = 0.5  # Neutral if no skills specified

        project_scores.append(relevance)
        if relevance > 0.2:
            relevant_projects.append({
                "title": proj.get("title", "Untitled"),
                "overlap_skills": list(overlap),
                "relevance": round(relevance, 2),
            })

    if project_scores:
        max_proj = max(project_scores)
        avg_proj = sum(project_scores) / len(project_scores)
        project_score = (max_proj * 15 + avg_proj * 5)
    else:
        project_score = 0
    project_score = min(project_score, 20)

    # ── Factor 3: Preferred Skills (10%) ──
    if preferred:
        matched_preferred = [s for s in preferred if s in student_skills]
        preferred_score = (len(matched_preferred) / len(preferred)) * 10
    else:
        matched_preferred = []
        preferred_score = 10  # No preferred skills → full marks

    # ── Factor 4: Experience/Internship (10%) ──
    relevant_exp_months = 0
    has_relevant_exp = False
    for exp in student.get("experiences", []):
        exp_text = f"{exp.get('role', '')} {exp.get('description', '')} {exp.get('company', '')}".lower()
        if any(s in exp_text for s in all_job_skills) or any(
            keyword in exp_text for keyword in [job.get("title", "").lower()]
        ):
            relevant_exp_months += exp.get("duration_months", 0) or 0
            has_relevant_exp = True

    min_exp = max(job.get("min_experience_months", 0), 6)
    duration_score = min(relevant_exp_months / min_exp, 1.0) * 7 if min_exp > 0 else 7
    exp_bonus = 3 if has_relevant_exp else 0
    experience_score = min(duration_score + exp_bonus, 10)

    # ── Factor 5: Academic Fit (10%) ──
    student_cgpa = student.get("cgpa") or 0
    cgpa_score = (student_cgpa / 10.0) * 8
    branch_bonus = 2 if student.get("branch", "").upper() in [
        b.upper() for b in job.get("eligible_branches", [])
    ] else 0
    academic_score = min(cgpa_score + branch_bonus, 10)

    # ── Factor 6: Certifications (5%) ──
    relevant_certs = 0
    for cert in student.get("certifications", []):
        cert_text = f"{cert.get('name', '')} {cert.get('issuer', '')}".lower()
        if any(s in cert_text for s in all_job_skills):
            relevant_certs += 1
    cert_score = min(relevant_certs, 3) / 3 * 5

    # ── Factor 7: Other Factors (5%) ──
    profile_fields = [
        student.get("resume_path") is not None,
        len(student.get("projects", [])) > 0,
        len(student.get("skills", [])) >= 3,
        len(student.get("experiences", [])) > 0,
        student.get("phone") is not None,
        student.get("career_goal") is not None,
    ]
    completeness = sum(1 for f in profile_fields if f) / len(profile_fields)
    other_score = completeness * 5

    # ── Overall Score ──
    overall = round(
        mandatory_score + project_score + preferred_score +
        experience_score + academic_score + cert_score + other_score,
        1
    )

    # ── Matched & Missing Skills ──
    all_matched = list(set(matched_mandatory + matched_preferred))
    missing_mandatory = [s for s in mandatory if s not in student_skills]

    # ── Confidence Score ──
    data_signals = [
        len(student.get("skills", [])) > 0,
        len(student.get("projects", [])) > 0,
        student.get("cgpa") is not None,
        student.get("resume_path") is not None,
        len(student.get("experiences", [])) > 0,
    ]
    confidence = round(sum(1 for s in data_signals if s) / len(data_signals), 2)

    # ── Generate Explanation ──
    explanation_parts = []
    if matched_mandatory:
        explanation_parts.append(
            f"Matches {len(matched_mandatory)}/{len(mandatory)} required skills."
        )
    if missing_mandatory:
        explanation_parts.append(
            f"Missing: {', '.join(s.title() for s in missing_mandatory[:5])}."
        )
    if relevant_projects:
        explanation_parts.append(
            f"{len(relevant_projects)} relevant project(s) found."
        )
    if has_relevant_exp:
        explanation_parts.append(
            f"Has {relevant_exp_months} months of relevant experience."
        )
    if student_cgpa >= 8:
        explanation_parts.append("Strong academic performance.")
    elif student_cgpa >= 7:
        explanation_parts.append("Good academic performance.")

    explanation = " ".join(explanation_parts)

    return {
        "overall_score": overall,
        "confidence": confidence,
        "factor_scores": {
            "mandatory_skills": {
                "score": round(mandatory_score, 1), "max": 40,
                "detail": f"{len(matched_mandatory)}/{len(mandatory)} mandatory skills matched"
            },
            "project_relevance": {
                "score": round(project_score, 1), "max": 20,
                "detail": f"{len(relevant_projects)} relevant projects found"
            },
            "preferred_skills": {
                "score": round(preferred_score, 1), "max": 10,
                "detail": f"{len(matched_preferred)}/{len(preferred)} preferred skills matched"
            },
            "experience": {
                "score": round(experience_score, 1), "max": 10,
                "detail": f"{relevant_exp_months} months relevant experience"
            },
            "academic_fit": {
                "score": round(academic_score, 1), "max": 10,
                "detail": f"CGPA {student_cgpa}/10"
            },
            "certifications": {
                "score": round(cert_score, 1), "max": 5,
                "detail": f"{relevant_certs} relevant certifications"
            },
            "other": {
                "score": round(other_score, 1), "max": 5,
                "detail": f"Profile {int(completeness*100)}% complete"
            },
        },
        "matched_skills": [s.title() for s in all_matched],
        "missing_skills": [s.title() for s in missing_mandatory],
        "relevant_projects": relevant_projects,
        "explanation": explanation,
    }
