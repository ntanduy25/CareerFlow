from typing import Dict, List
from pydantic import BaseModel
from app.schemas.reminder import ReminderResponse


class DashboardSummary(BaseModel):
    total_applications: int
    active_applications: int
    interviews_count: int
    offers_count: int
    interview_rate: float
    offer_rate: float
    by_status: Dict[str, int]
    upcoming_reminders: List[ReminderResponse]
