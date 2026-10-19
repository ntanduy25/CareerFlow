from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, desc
from fastapi import HTTPException, status
from app.models.application import (
    Application,
    ApplicationStatus,
    ApplicationStatusHistory,
)
from app.schemas.application import (
    ApplicationCreate,
    ApplicationUpdate,
    ApplicationStatusUpdate,
)


class ApplicationService:
    @staticmethod
    def get_user_applications(
        db: Session,
        user_id: str,
        status: Optional[str] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Application]:
        query = db.query(Application).filter(Application.user_id == user_id)

        if status:
            query = query.filter(Application.status == status)

        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Application.company_name.ilike(search_term),
                    Application.job_title.ilike(search_term),
                )
            )

        return (
            query.order_by(desc(Application.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_application_by_id(
        db: Session, application_id: str, user_id: str
    ) -> Application:
        application = (
            db.query(Application)
            .options(
                joinedload(Application.status_history),
                joinedload(Application.reminders),
            )
            .filter(Application.id == application_id, Application.user_id == user_id)
            .first()
        )
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found or you do not have permission to view it.",
            )
        return application

    @staticmethod
    def create_application(
        db: Session, user_id: str, app_in: ApplicationCreate
    ) -> Application:
        application = Application(
            user_id=user_id,
            company_name=app_in.company_name,
            job_title=app_in.job_title,
            job_url=str(app_in.job_url) if app_in.job_url else None,
            status=app_in.status.value,
            salary_min=app_in.salary_min,
            salary_max=app_in.salary_max,
            applied_at=app_in.applied_at,
            notes=app_in.notes,
        )
        db.add(application)
        db.flush()  # Flush to get application.id

        # Record initial status in status history
        history = ApplicationStatusHistory(
            application_id=application.id,
            old_status=None,
            new_status=application.status,
        )
        db.add(history)
        db.commit()
        db.refresh(application)
        return application

    @staticmethod
    def update_application(
        db: Session,
        application_id: str,
        user_id: str,
        app_in: ApplicationUpdate,
    ) -> Application:
        application = (
            db.query(Application)
            .filter(Application.id == application_id, Application.user_id == user_id)
            .first()
        )
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found or you do not have permission to modify it.",
            )

        update_data = app_in.model_dump(exclude_unset=True)
        old_status = application.status
        new_status = update_data.get("status")

        if new_status is not None:
            status_value = (
                new_status.value
                if isinstance(new_status, ApplicationStatus)
                else new_status
            )
            if old_status != status_value:
                update_data["status"] = status_value
                history = ApplicationStatusHistory(
                    application_id=application.id,
                    old_status=old_status,
                    new_status=status_value,
                )
                db.add(history)

        for field, value in update_data.items():
            if field == "job_url" and value is not None:
                value = str(value)
            setattr(application, field, value)

        db.commit()
        db.refresh(application)
        return application

    @staticmethod
    def update_application_status(
        db: Session,
        application_id: str,
        user_id: str,
        status_in: ApplicationStatusUpdate,
    ) -> Application:
        application = (
            db.query(Application)
            .filter(Application.id == application_id, Application.user_id == user_id)
            .first()
        )
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found or you do not have permission to modify it.",
            )

        if application.status != status_in.status.value:
            history = ApplicationStatusHistory(
                application_id=application.id,
                old_status=application.status,
                new_status=status_in.status.value,
            )
            db.add(history)
            application.status = status_in.status.value
            db.commit()
            db.refresh(application)

        return application

    @staticmethod
    def delete_application(
        db: Session, application_id: str, user_id: str
    ) -> None:
        application = (
            db.query(Application)
            .filter(Application.id == application_id, Application.user_id == user_id)
            .first()
        )
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found or you do not have permission to delete it.",
            )
        db.delete(application)
        db.commit()

    @staticmethod
    def get_status_history(
        db: Session, application_id: str, user_id: str
    ) -> List[ApplicationStatusHistory]:
        # Verify ownership first
        ApplicationService.get_application_by_id(db, application_id, user_id)
        return (
            db.query(ApplicationStatusHistory)
            .filter(ApplicationStatusHistory.application_id == application_id)
            .order_by(desc(ApplicationStatusHistory.changed_at))
            .all()
        )
