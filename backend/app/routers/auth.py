from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.student import Student
from app.models.company import Company
from app.models.recruiter import Recruiter
from app.schemas.auth import RegisterRequest, LoginRequest, RefreshRequest, TokenResponse, UserResponse
from app.auth.password import hash_password, verify_password
from app.auth.jwt_handler import create_access_token, create_refresh_token, decode_token
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user (student or recruiter). TPO accounts are pre-seeded."""
    # Check if email already exists
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    # Create user
    user = User(
        email=req.email,
        password_hash=hash_password(req.password),
        role=req.role,
    )
    db.add(user)
    db.flush()  # Get user.id

    name = req.name

    if req.role == "student":
        student = Student(user_id=user.id, name=name)
        db.add(student)
    elif req.role == "recruiter":
        # Create or find company
        if not req.company_name:
            raise HTTPException(status_code=400, detail="company_name is required for recruiter registration")
        company = Company(name=req.company_name, industry=req.company_industry)
        db.add(company)
        db.flush()
        recruiter = Recruiter(user_id=user.id, company_id=company.id, name=name)
        db.add(recruiter)

    db.commit()
    db.refresh(user)

    # Generate tokens
    token_data = {"sub": user.id, "role": user.role}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        role=user.role,
        user_id=user.id,
        name=name,
    )


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Login with email and password."""
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    # Get name based on role
    name = req.email  # Fallback
    if user.role == "student" and user.student:
        name = user.student.name
    elif user.role == "recruiter" and user.recruiter:
        name = user.recruiter.name
    elif user.role == "tpo":
        name = "TPO Admin"

    token_data = {"sub": user.id, "role": user.role}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        role=user.role,
        user_id=user.id,
        name=name,
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(req: RefreshRequest, db: Session = Depends(get_db)):
    """Refresh an access token using a valid refresh token."""
    payload = decode_token(req.refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or deactivated")

    name = user.email
    if user.role == "student" and user.student:
        name = user.student.name
    elif user.role == "recruiter" and user.recruiter:
        name = user.recruiter.name
    elif user.role == "tpo":
        name = "TPO Admin"

    token_data = {"sub": user.id, "role": user.role}
    new_access = create_access_token(token_data)
    new_refresh = create_refresh_token(token_data)

    return TokenResponse(
        access_token=new_access,
        refresh_token=new_refresh,
        role=user.role,
        user_id=user.id,
        name=name,
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user info."""
    return current_user
