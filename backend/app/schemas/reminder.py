from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class ReminderBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    scheduled_at: datetime


class ReminderCreate(ReminderBase):
    application_id: str


class ReminderUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    scheduled_at: Optional[datetime] = None
    completed: Optional[bool] = None


class ReminderResponse(ReminderBase):
    id: str
    user_id: str
    application_id: str
    completed: bool
    created_at: datetime
    company_name: Optional[str] = None
    job_title: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
