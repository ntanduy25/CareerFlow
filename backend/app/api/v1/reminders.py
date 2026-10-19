from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.v1.deps import get_current_user
from app.models.user import User
from app.models.reminder import Reminder
from app.models.application import Application
from app.schemas.reminder import (
    ReminderCreate,
    ReminderUpdate,
    ReminderResponse,
)

router = APIRouter(prefix="/reminders", tags=["Reminders"])


@router.get("", response_model=List[ReminderResponse])
def list_reminders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all reminders for the authenticated user, ordered by scheduled time."""
    results = (
        db.query(Reminder, Application.company_name, Application.job_title)
        .join(Application, Reminder.application_id == Application.id)
        .filter(Reminder.user_id == current_user.id)
        .order_by(Reminder.scheduled_at.asc())
        .all()
    )

    response: List[ReminderResponse] = []
    for r, comp_name, job_title in results:
        response.append(
            ReminderResponse(
                id=r.id,
                user_id=r.user_id,
                application_id=r.application_id,
                title=r.title,
                scheduled_at=r.scheduled_at,
                completed=r.completed,
                created_at=r.created_at,
                company_name=comp_name,
                job_title=job_title,
            )
        )
    return response


@router.post("", response_model=ReminderResponse, status_code=status.HTTP_201_CREATED)
def create_reminder(
    reminder_in: ReminderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a reminder for a specific job application."""
    # Ensure application belongs to the user
    application = (
        db.query(Application)
        .filter(
            Application.id == reminder_in.application_id,
            Application.user_id == current_user.id,
        )
        .first()
    )
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found or access denied.",
        )

    reminder = Reminder(
        user_id=current_user.id,
        application_id=reminder_in.application_id,
        title=reminder_in.title,
        scheduled_at=reminder_in.scheduled_at,
        completed=False,
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)

    return ReminderResponse(
        id=reminder.id,
        user_id=reminder.user_id,
        application_id=reminder.application_id,
        title=reminder.title,
        scheduled_at=reminder.scheduled_at,
        completed=reminder.completed,
        created_at=reminder.created_at,
        company_name=application.company_name,
        job_title=application.job_title,
    )


@router.patch("/{reminder_id}", response_model=ReminderResponse)
def update_reminder(
    reminder_id: str,
    reminder_in: ReminderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a reminder (e.g. mark as completed or reschedule)."""
    reminder = (
        db.query(Reminder)
        .filter(Reminder.id == reminder_id, Reminder.user_id == current_user.id)
        .first()
    )
    if not reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found or access denied.",
        )

    update_data = reminder_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(reminder, field, value)

    db.commit()
    db.refresh(reminder)

    application = (
        db.query(Application).filter(Application.id == reminder.application_id).first()
    )

    return ReminderResponse(
        id=reminder.id,
        user_id=reminder.user_id,
        application_id=reminder.application_id,
        title=reminder.title,
        scheduled_at=reminder.scheduled_at,
        completed=reminder.completed,
        created_at=reminder.created_at,
        company_name=application.company_name if application else None,
        job_title=application.job_title if application else None,
    )


@router.delete("/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reminder(
    reminder_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a reminder."""
    reminder = (
        db.query(Reminder)
        .filter(Reminder.id == reminder_id, Reminder.user_id == current_user.id)
        .first()
    )
    if not reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found or access denied.",
        )

    db.delete(reminder)
    db.commit()
    return None
