"""
Eligibility Engine — Rule-based hard requirement checking.

Checks students against job eligibility criteria in strict order.
If any hard requirement fails, the student is NOT eligible.
"""


def check_eligibility(student: dict, job: dict) -> dict:
    """Check if a student meets the hard eligibility requirements of a job.

    Args:
        student: dict with keys: branch, cgpa, active_backlogs, graduation_year, total_experience_months
        job: dict with keys: eligible_branches, min_cgpa, max_backlogs, required_batch, min_experience_months

    Returns:
        dict with: eligible (bool), passed_requirements (list), failed_requirements (list)
    """
    passed = []
    failed = []

    # 1. Branch check
    eligible_branches = job.get("eligible_branches", [])
    if eligible_branches:
        student_branch = (student.get("branch") or "").upper()
        branch_matches = any(
            b.upper() == student_branch or b.upper() in student_branch or student_branch in b.upper()
            for b in eligible_branches
        )
        if branch_matches:
            passed.append(f"Branch: {student.get('branch')} ✓")
        else:
            failed.append(f"Branch: {student.get('branch')} not in {eligible_branches}")

    # 2. CGPA check
    min_cgpa = job.get("min_cgpa", 0)
    if min_cgpa > 0:
        student_cgpa = student.get("cgpa") or 0
        if student_cgpa >= min_cgpa:
            passed.append(f"CGPA: {student_cgpa} >= {min_cgpa} ✓")
        else:
            failed.append(f"CGPA: {student_cgpa} < {min_cgpa} (minimum required)")

    # 3. Backlog check
    max_backlogs = job.get("max_backlogs", 0)
    student_backlogs = student.get("active_backlogs", 0)
    if student_backlogs <= max_backlogs:
        passed.append(f"Backlogs: {student_backlogs} <= {max_backlogs} ✓")
    else:
        failed.append(f"Backlogs: {student_backlogs} > {max_backlogs} (maximum allowed)")

    # 4. Batch/Graduation year check
    required_batch = job.get("required_batch")
    if required_batch:
        student_year = student.get("graduation_year")
        if student_year and student_year == required_batch:
            passed.append(f"Batch: {student_year} == {required_batch} ✓")
        elif not student_year:
            failed.append(f"Batch: Graduation year not specified (required: {required_batch})")
        else:
            failed.append(f"Batch: {student_year} != {required_batch}")

    # 5. Experience check
    min_exp = job.get("min_experience_months", 0)
    if min_exp > 0:
        student_exp = student.get("total_experience_months", 0)
        if student_exp >= min_exp:
            passed.append(f"Experience: {student_exp} months >= {min_exp} months ✓")
        else:
            failed.append(f"Experience: {student_exp} months < {min_exp} months (minimum required)")

    return {
        "eligible": len(failed) == 0,
        "passed_requirements": passed,
        "failed_requirements": failed,
    }
