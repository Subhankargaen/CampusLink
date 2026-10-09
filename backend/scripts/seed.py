import os
import sys
import random
import uuid
import json
from datetime import datetime, timezone, timedelta

# Add parent directory to path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, Base, engine
from app.models.user import User
from app.models.student import Student
from app.models.company import Company
from app.models.recruiter import Recruiter
from app.models.job import Job
from app.models.placement_drive import PlacementDrive
from app.models.application import Application
from app.models.interview import Interview
from app.models.offer import Offer
from app.models.student_skill import StudentSkill
from app.models.student_project import StudentProject
from app.models.student_experience import StudentExperience
from app.models.student_certification import StudentCertification
from app.models.match import Match
from app.models.risk_assessment import RiskAssessment
from app.auth.password import hash_password
from app.ai.match_engine import compute_match_score

def seed_db():
    print("Ensuring tables exist...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Seed TPO Admin
        tpo = db.query(User).filter(User.role == "tpo").first()
        if not tpo:
            print("Creating TPO Admin...")
            tpo = User(
                email="admin@campuslink.com",
                password_hash=hash_password("admin123"),
                role="tpo"
            )
            db.add(tpo)
            db.commit()
            db.refresh(tpo)
            print("✓ TPO Admin created: admin@campuslink.com / admin123")

        # 2. Seed Placement Drives
        drives_data = [
            ("2026 Batch Engineering Phase 1 Drive", "2025-2026", "Comprehensive placement cycle for 2026 graduating students across software, cloud, and analytics roles."),
            ("FinTech & Quantitative Hiring Track", "2025-2026", "Exclusive placement drive with premier banking and algorithmic trading technology firms."),
            ("Core Engineering & IoT Innovation Drive", "2025-2026", "Recruitment drive focused on hardware, embedded systems, and industrial automation."),
        ]
        created_drives = []
        for name, year, desc in drives_data:
            d = db.query(PlacementDrive).filter(PlacementDrive.name == name).first()
            if not d:
                d = PlacementDrive(name=name, academic_year=year, description=desc, status="active")
                db.add(d)
                db.commit()
                db.refresh(d)
            created_drives.append(d)
        print(f"[OK] {len(created_drives)} Placement Drives available.")

        # 3. Seed Companies & Recruiters
        companies_data = [
            ("TechCorp Solutions", "Cloud & Enterprise Software", "https://techcorp.example.com", "careers@techcorp.example.com", "+91 98765 43210", "Bangalore, India", "recruiter@techcorp.com", "recruiter123", "Rajiv Menon", "Senior Talent Partner"),
            ("CloudScale Networks", "Cloud Infrastructure & DevOps", "https://cloudscale.example.com", "campus@cloudscale.example.com", "+91 98765 43211", "Hyderabad, India", "recruiter@cloudscale.com", "cloud123", "Ananya Deshmukh", "Campus Lead"),
            ("DataAI Systems", "Artificial Intelligence & Analytics", "https://dataai.example.com", "hiring@dataai.example.com", "+91 98765 43212", "Pune, India", "recruiter@dataai.com", "data123", "Vikram Sen", "Head of Tech Hiring"),
            ("FinTech Global", "Quantitative Trading & Banking Tech", "https://fintechglobal.example.com", "graduates@fintechglobal.example.com", "+91 98765 43213", "Mumbai, India", "recruiter@fintech.com", "fintech123", "Pooja Hegde", "Recruitment Director"),
            ("Apex Systems", "Full Stack Web & Mobile Engineering", "https://apexsystems.example.com", "talent@apexsystems.example.com", "+91 98765 43214", "Gurgaon, India", "recruiter@apex.com", "apex123", "Karan Malhotra", "Engineering Recruiter"),
        ]

        created_companies = []
        for c_name, ind, web, em, ph, loc, rec_em, rec_pw, rec_name, desig in companies_data:
            comp = db.query(Company).filter(Company.name == c_name).first()
            if not comp:
                comp = Company(
                    name=c_name, industry=ind, website=web, is_approved=True,
                    description=f"Premier hiring partner offering industry-leading compensation and engineering opportunities."
                )
                db.add(comp)
                db.commit()
                db.refresh(comp)

                # Create user for recruiter
                r_user = db.query(User).filter(User.email == rec_em).first()
                if not r_user:
                    r_user = User(email=rec_em, password_hash=hash_password(rec_pw), role="recruiter")
                    db.add(r_user)
                    db.commit()
                    db.refresh(r_user)

                rec = Recruiter(user_id=r_user.id, company_id=comp.id, name=rec_name, designation=desig, phone=ph)
                db.add(rec)
                db.commit()

            created_companies.append(comp)
        print(f"[OK] {len(created_companies)} Tier-1 Companies & Recruiters seeded.")

        # 4. Seed Jobs
        jobs_data = [
            ("Software Development Engineer", created_companies[0].id, created_drives[0].id, 14.5, "Bangalore / Hybrid", 7.5, 0, ["Python", "FastAPI", "React", "PostgreSQL"], ["Docker", "AWS", "Redis"], ["CSE", "IT", "ECE"]),
            ("Cloud DevOps Engineer", created_companies[1].id, created_drives[0].id, 12.0, "Hyderabad, India", 7.0, 0, ["Linux", "Docker", "Kubernetes", "AWS"], ["Terraform", "Python", "Go"], ["CSE", "IT", "ECE", "EE"]),
            ("AI / Machine Learning Engineer", created_companies[2].id, created_drives[0].id, 18.0, "Pune / Hybrid", 8.0, 0, ["Python", "PyTorch", "SQL", "Pandas"], ["Docker", "MLflow", "FastAPI"], ["CSE", "IT"]),
            ("Quantitative Analyst & Algo Developer", created_companies[3].id, created_drives[1].id, 24.0, "Mumbai, India", 8.5, 0, ["C++", "Python", "Algorithms", "Linear Algebra"], ["SQL", "Distributed Systems"], ["CSE", "ECE", "EE"]),
            ("Full Stack Web Trainee", created_companies[4].id, created_drives[0].id, 9.5, "Gurgaon / Noida", 6.8, 1, ["React", "JavaScript", "Node.js", "SQL"], ["TailwindCSS", "Git", "TypeScript"], ["CSE", "IT", "ECE", "ME"]),
            ("Data Engineer & Pipeline Specialist", created_companies[2].id, created_drives[0].id, 13.5, "Bangalore, India", 7.2, 0, ["SQL", "Python", "Spark", "PostgreSQL"], ["Airflow", "Kafka", "AWS"], ["CSE", "IT"]),
            ("Associate Security Engineer", created_companies[0].id, created_drives[0].id, 11.0, "Bangalore, India", 7.0, 0, ["Network Security", "Linux", "Python", "OWASP"], ["Penetration Testing", "Docker"], ["CSE", "IT", "ECE"]),
            ("FinTech Backend Systems Trainee", created_companies[3].id, created_drives[1].id, 16.0, "Mumbai / Hybrid", 7.8, 0, ["Java", "Spring Boot", "SQL", "Microservices"], ["Docker", "Kafka", "Redis"], ["CSE", "IT"]),
        ]

        created_jobs = []
        for title, comp_id, drive_id, ctc, loc, min_cgpa, max_back, mand, pref, branches in jobs_data:
            jb = db.query(Job).filter(Job.title == title, Job.company_id == comp_id).first()
            if not jb:
                jb = Job(
                    title=title, company_id=comp_id, drive_id=drive_id, ctc_lpa=ctc,
                    location=loc, min_cgpa=min_cgpa, max_backlogs=max_back,
                    required_batch=2026, status="active",
                    raw_jd=f"We are hiring {title} graduates for our engineering team. Minimum CGPA {min_cgpa}. Package {ctc} LPA."
                )
                jb.set_mandatory_skills(mand)
                jb.set_preferred_skills(pref)
                jb.set_eligible_branches(branches)
                jb.set_selection_process(["Online Screening Assessment", "Technical Interview Round 1", "System Design & Culture Round"])
                db.add(jb)
                db.commit()
                db.refresh(jb)
            created_jobs.append(jb)
        print(f"[OK] {len(created_jobs)} Technical Job Postings created.")

        # 5. Seed 50 Students across Branches
        first_names = ["Aarav", "Priya", "Rohan", "Sneha", "Aditya", "Ananya", "Ishaan", "Diya", "Kabir", "Meera", "Arjun", "Tanvi", "Siddharth", "Avni", "Kunal", "Rhea", "Nikhil", "Simran", "Rahul", "Pooja", "Vikram", "Shreya", "Aryan", "Neha", "Varun", "Kavya", "Dhruv", "Isha", "Manish", "Bhavna", "Harsh", "Radhika", "Gaurav", "Anjali", "Suresh", "Komal", "Deepak", "Aayushi", "Kartik", "Shruti", "Akash", "Tanya", "Vivek", "Preeti", "Mayank", "Nisha", "Alok", "Payal", "Ritesh", "Divya"]
        last_names = ["Sharma", "Verma", "Patel", "Gupta", "Iyer", "Nair", "Reddy", "Chopra", "Deshmukh", "Mukherjee", "Sen", "Bose", "Mehta", "Singh", "Joshi", "Bhatia", "Saxena", "Kapoor", "Malhotra", "Kulkarni"]
        branches_pool = ["CSE", "CSE", "CSE", "IT", "IT", "ECE", "ECE", "EE", "ME"]

        all_skills_pool = [
            ("python", "Python"), ("react", "React"), ("fastapi", "FastAPI"), ("sql", "SQL"),
            ("postgresql", "PostgreSQL"), ("docker", "Docker"), ("aws", "AWS"), ("javascript", "JavaScript"),
            ("c++", "C++"), ("java", "Java"), ("spring boot", "Spring Boot"), ("linux", "Linux"),
            ("machine learning", "Machine Learning"), ("pandas", "Pandas"), ("git", "Git"), ("redis", "Redis")
        ]

        created_students = []
        # Ensure our primary demo student student@campuslink.com exists
        main_student_user = db.query(User).filter(User.email == "student@campuslink.com").first()
        if not main_student_user:
            main_student_user = User(email="student@campuslink.com", password_hash=hash_password("student123"), role="student")
            db.add(main_student_user)
            db.commit()
            db.refresh(main_student_user)

        main_student = db.query(Student).filter(Student.user_id == main_student_user.id).first()
        if not main_student:
            main_student = Student(
                user_id=main_student_user.id, name="Aarav Sharma", phone="+91 98765 00001",
                branch="CSE", cgpa=8.85, graduation_year=2026, active_backlogs=0,
                readiness_score=88.0, profile_complete=True, career_goal="Full Stack Cloud & AI Engineer"
            )
            db.add(main_student)
            db.commit()
            db.refresh(main_student)
            # Give core skills
            for norm, sk_name in all_skills_pool[:8]:
                db.add(StudentSkill(student_id=main_student.id, skill_name=sk_name, normalized_name=norm, proficiency=4))
            # Give project
            p1 = StudentProject(student_id=main_student.id, title="Distributed E-Commerce Microservices", description="Built resilient high-throughput order microservice handling 5k req/sec with FastAPI, Redis, and PostgreSQL.")
            p1.set_tech_stack(["Python", "FastAPI", "Docker", "PostgreSQL", "Redis"])
            db.add(p1)
            # Give internship
            e1 = StudentExperience(student_id=main_student.id, company="InnovateTech Labs", role="Software Engineering Intern", duration_months=3, is_internship=True)
            db.add(e1)
            db.commit()

        created_students.append(main_student)

        # Generate remaining 49 students
        print("Generating 50 realistic student profiles across engineering departments...")
        for i in range(1, 50):
            fn = first_names[i % len(first_names)]
            ln = last_names[i % len(last_names)]
            full_name = f"{fn} {ln}"
            stu_email = f"{fn.lower()}.{ln.lower()}{i}@campus.edu"
            
            s_user = db.query(User).filter(User.email == stu_email).first()
            if not s_user:
                s_user = User(email=stu_email, password_hash=hash_password("student123"), role="student")
                db.add(s_user)
                db.commit()
                db.refresh(s_user)

            student = db.query(Student).filter(Student.user_id == s_user.id).first()
            if not student:
                branch = branches_pool[i % len(branches_pool)]
                cgpa = round(random.uniform(6.2, 9.6), 2)
                backlogs = 1 if (cgpa < 6.8 and random.random() > 0.4) else 0
                readiness = round(min(95, max(45, (cgpa * 10) + random.uniform(-10, 10))), 1)

                student = Student(
                    user_id=s_user.id, name=full_name, phone=f"+91 98765 {10000+i}",
                    branch=branch, cgpa=cgpa, graduation_year=2026, active_backlogs=backlogs,
                    readiness_score=readiness, profile_complete=True,
                    career_goal=f"{branch} Software & Solutions Specialist"
                )
                db.add(student)
                db.commit()
                db.refresh(student)

                # Assign 3 to 7 skills
                num_skills = random.randint(3, 7)
                sampled_skills = random.sample(all_skills_pool, num_skills)
                for norm, sk_name in sampled_skills:
                    db.add(StudentSkill(student_id=student.id, skill_name=sk_name, normalized_name=norm, proficiency=random.randint(2, 5)))

                # Assign a capstone project
                project_titles = [
                    "AI Automated Medical Diagnostics", "Smart IoT Campus Power Monitor", "Cryptographic Asset Wallet",
                    "Real-Time Collaborative Code Editor", "High Frequency Order Book Engine", "Autonomous Robot Navigation System"
                ]
                pr = StudentProject(student_id=student.id, title=random.choice(project_titles), description="Comprehensive final-year capstone engineering project with microservices and containerized deployment.")
                pr.set_tech_stack([s[1] for s in random.sample(sampled_skills, min(3, len(sampled_skills)))])
                db.add(pr)

                # Risk assessment if readiness < 65 or backlogs > 0
                if readiness < 65 or backlogs > 0:
                    r_level = "critical" if backlogs > 0 or readiness < 55 else "high"
                    factors = json.dumps([
                        {"factor": "Academic Backlogs", "impact": "High" if backlogs > 0 else "Low"},
                        {"factor": "Project Portfolio Deficit", "impact": "Critical" if readiness < 60 else "Moderate"}
                    ])
                    recomms = json.dumps([
                        {"action": "Enroll in Fast-Track Capstone Lab", "priority": "Urgent"},
                        {"action": "Pair with Student Placement Peer Mentor", "priority": "High"}
                    ])
                    db.add(RiskAssessment(
                        student_id=student.id,
                        risk_score=round(100 - readiness, 1),
                        risk_level=r_level,
                        contributing_factors=factors,
                        recommendations=recomms
                    ))

                db.commit()

            created_students.append(student)

        print(f"[OK] {len(created_students)} Students successfully seeded with skills, capstones, and readiness metrics.")

        # 6. Seed 100+ Applications, 20 Interviews, 12 Offers
        print("Generating application lifecycle records, AI rankings, and offers...")
        app_count = 0
        interview_count = 0
        offer_count = 0

        for idx, student in enumerate(created_students):
            # Each student applies to 1-3 jobs
            num_apps = random.randint(1, 3)
            applied_jobs = random.sample(created_jobs, min(num_apps, len(created_jobs)))

            for job in applied_jobs:
                existing_app = db.query(Application).filter(Application.student_id == student.id, Application.job_id == job.id).first()
                if not existing_app:
                    # Status progression
                    rand_val = random.random()
                    if rand_val > 0.8:
                        status = "offered"
                    elif rand_val > 0.6:
                        status = "interview"
                    elif rand_val > 0.4:
                        status = "shortlisted"
                    else:
                        status = "applied"

                    app_rec = Application(student_id=student.id, job_id=job.id, status=status)
                    db.add(app_rec)
                    db.commit()
                    db.refresh(app_rec)
                    app_count += 1

                    # Compute and persist Match
                    student_skills = [s.normalized_name for s in db.query(StudentSkill).filter(StudentSkill.student_id == student.id).all()]
                    stu_data = {
                        "skills": student_skills, "projects": [], "experiences": [], "certifications": [],
                        "cgpa": student.cgpa, "branch": student.branch
                    }
                    jb_data = {
                        "mandatory_skills": job.get_mandatory_skills(),
                        "preferred_skills": job.get_preferred_skills(),
                    }
                    m_res = compute_match_score(stu_data, jb_data)

                    match_obj = Match(
                        application_id=app_rec.id,
                        overall_score=m_res["overall_score"],
                        factor_scores=str(m_res["factor_scores"]),
                        matched_skills=str(m_res["matched_skills"]),
                        missing_skills=str(m_res["missing_skills"]),
                        explanation=m_res["explanation"],
                        confidence=m_res["confidence"]
                    )
                    db.add(match_obj)
                    db.commit()

                    # Create Interview if status is interview or offered
                    if status in ("interview", "offered") and interview_count < 22:
                        iv = Interview(
                            application_id=app_rec.id,
                            round_name="Technical Round 1",
                            round_number=1,
                            scheduled_at=datetime.now(timezone.utc) + timedelta(days=random.randint(1, 4), hours=random.randint(1, 6)),
                            duration_minutes=45,
                            location_or_link="https://meet.google.com/campuslink-interview-slot",
                            status="scheduled"
                        )
                        db.add(iv)
                        db.commit()
                        interview_count += 1

                    # Create Offer if status is offered
                    if status == "offered" and offer_count < 12:
                        off_status = "accepted" if random.random() > 0.3 else "extended"
                        off = Offer(
                            application_id=app_rec.id,
                            ctc_lpa=job.ctc_lpa,
                            role=job.title,
                            location=job.location,
                            status=off_status,
                            joining_date=datetime.now(timezone.utc).date() + timedelta(days=90),
                            deadline=datetime.now(timezone.utc).date() + timedelta(days=14)
                        )
                        db.add(off)
                        db.commit()
                        offer_count += 1

        print(f"[OK] Seed Summary: {len(created_students)} Students | {len(created_companies)} Companies | {len(created_jobs)} Jobs | {app_count} Applications | {interview_count} Interviews | {offer_count} Offers")
        print("\nDemo Accounts Ready for Presentation:")
        print("  - TPO Admin: admin@campuslink.com / admin123")
        print("  - Recruiter: recruiter@techcorp.com / recruiter123")
        print("  - Student:   student@campuslink.com / student123")

    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
