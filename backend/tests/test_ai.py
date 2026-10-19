from app.services.ai_service import AIService


def test_ai_skill_extraction():
    sample_text = """
    Software Engineer with 2 years of experience in Python, FastAPI, and Docker.
    Proficient in building RESTful APIs, working with PostgreSQL and Redis.
    Familiar with React, TypeScript, Git, and automated testing using Pytest.
    """
    skills = AIService.extract_skills(sample_text)
    assert "Python" in skills
    assert "FastAPI" in skills
    assert "Docker" in skills
    assert "PostgreSQL" in skills
    assert "Redis" in skills
    assert "React" in skills
    assert "TypeScript" in skills
    assert "Pytest" in skills


def test_ai_cv_matching():
    cv_text = "I am skilled in Python, FastAPI, PostgreSQL, Git, and Docker."
    jd_text = "Requirements: Python, FastAPI, PostgreSQL, Kubernetes, Redis, Docker."

    result = AIService.analyze_cv_match(cv_text, jd_text)
    assert "match_score" in result
    assert result["match_score"] > 50
    assert "Python" in result["matched_skills"]
    assert "FastAPI" in result["matched_skills"]
    assert "Docker" in result["matched_skills"]
    assert "PostgreSQL" in result["matched_skills"]
    assert "Kubernetes" in result["missing_skills"]
    assert "Redis" in result["missing_skills"]
    assert len(result["recommendations"]) > 0
