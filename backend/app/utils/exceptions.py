from fastapi import HTTPException, status


class AppException(HTTPException):
    """Base application exception."""
    def __init__(self, status_code: int = 400, detail: str = "An error occurred"):
        super().__init__(status_code=status_code, detail=detail)


class NotFoundError(AppException):
    def __init__(self, resource: str = "Resource"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=f"{resource} not found")


class DuplicateError(AppException):
    def __init__(self, detail: str = "Resource already exists"):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


class ForbiddenError(AppException):
    def __init__(self, detail: str = "You don't have permission to perform this action"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)
