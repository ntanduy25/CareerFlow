from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.v1.deps import get_current_user
from app.models.user import User
from app.models.application import ApplicationStatus
from app.schemas.application import (
    ApplicationCreate,
    ApplicationUpdate,
    ApplicationStatusUpdate,
    ApplicationResponse,
    ApplicationDetailResponse,
    StatusHistoryResponse,
)
from app.services.application_service import ApplicationService

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.get("", response_model=List[ApplicationResponse])
def list_applications(
    status: Optional[ApplicationStatus] = Query(None, description="Filter by application status"),
    search: Optional[str] = Query(None, description="Search company name or job title"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve all job applications belonging to the current user."""
    status_str = status.value if status else None
    return ApplicationService.get_user_applications(
        db=db,
        user_id=current_user.id,
        status=status_str,
        search=search,
        skip=skip,
        limit=limit,
    )


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    app_in: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new job application."""
    return ApplicationService.create_application(
        db=db, user_id=current_user.id, app_in=app_in
    )


@router.get("/{application_id}", response_model=ApplicationDetailResponse)
def get_application(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get detailed information of a specific application including status history and reminders."""
    return ApplicationService.get_application_by_id(
        db=db, application_id=application_id, user_id=current_user.id
    )


@router.patch("/{application_id}", response_model=ApplicationResponse)
def update_application(
    application_id: str,
    app_in: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update details of a job application."""
    return ApplicationService.update_application(
        db=db,
        application_id=application_id,
        user_id=current_user.id,
        app_in=app_in,
    )


@router.patch("/{application_id}/status", response_model=ApplicationResponse)
def update_application_status(
    application_id: str,
    status_in: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update only the status of an application (e.g. dragging across Kanban board)."""
    return ApplicationService.update_application_status(
        db=db,
        application_id=application_id,
        user_id=current_user.id,
        status_in=status_in,
    )


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a job application and its associated reminders and status histories."""
    ApplicationService.delete_application(
        db=db, application_id=application_id, user_id=current_user.id
    )
    return None


@router.get("/{application_id}/history", response_model=List[StatusHistoryResponse])
def get_application_history(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the full chronological status change history of an application."""
    return ApplicationService.get_status_history(
        db=db, application_id=application_id, user_id=current_user.id
    )
