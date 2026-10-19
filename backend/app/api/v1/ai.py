from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from app.api.v1.deps import get_current_user
from app.models.user import User
from app.schemas.ai import ResumeAnalysisResponse
from app.services.ai_service import AIService

router = APIRouter(prefix="/ai", tags=["AI Resume Analysis"])


@router.post("/analyze-resume", response_model=ResumeAnalysisResponse)
async def analyze_resume(
    cv_file: UploadFile = File(..., description="PDF format of the Candidate's CV"),
    job_description: str = Form(..., description="Target Job Description requirements"),
    current_user: User = Depends(get_current_user),
):
    """
    Upload a candidate's CV in PDF format and compare it with the Job Description.
    Extracts tech skills, computes match score, and gives actionable advice.
    """
    if not cv_file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Currently only PDF documents are supported for CV analysis.",
        )

    try:
        pdf_bytes = await cv_file.read()
        cv_text = AIService.extract_text_from_pdf(pdf_bytes)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not parse the PDF file: {str(e)}",
        )

    if not cv_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded PDF appears to be empty or contains only scanned images.",
        )

    result = AIService.analyze_cv_match(cv_text, job_description)
    return result
