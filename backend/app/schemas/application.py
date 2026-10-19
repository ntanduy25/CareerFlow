from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, Field, HttpUrl, ConfigDict
from app.models.application import ApplicationStatus
from app.schemas.reminder import ReminderResponse


class StatusHistoryResponse(BaseModel):
    id: str
    application_id: str
    old_status: Optional[str] = None
    new_status: str
    changed_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ApplicationBase(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=255)
    job_title: str = Field(..., min_length=1, max_length=255)
    job_url: Optional[str] = None
    status: ApplicationStatus = ApplicationStatus.SAVED
    salary_min: Optional[float] = Field(None, ge=0)
    salary_max: Optional[float] = Field(None, ge=0)
    applied_at: Optional[date] = None
    notes: Optional[str] = None


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationUpdate(BaseModel):
    company_name: Optional[str] = Field(None, min_length=1, max_length=255)
    job_title: Optional[str] = Field(None, min_length=1, max_length=255)
    job_url: Optional[str] = None
    status: Optional[ApplicationStatus] = None
    salary_min: Optional[float] = Field(None, ge=0)
    salary_max: Optional[float] = Field(None, ge=0)
    applied_at: Optional[date] = None
    notes: Optional[str] = None


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus


class ApplicationResponse(ApplicationBase):
    id: str
    user_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ApplicationDetailResponse(ApplicationResponse):
    status_history: List[StatusHistoryResponse] = []
    reminders: List[ReminderResponse] = []

    model_config = ConfigDict(from_attributes=True)
