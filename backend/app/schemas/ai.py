from typing import List
from pydantic import BaseModel


class ResumeAnalysisResponse(BaseModel):
    match_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    cv_skills: List[str]
    jd_skills: List[str]
    recommendations: List[str]
