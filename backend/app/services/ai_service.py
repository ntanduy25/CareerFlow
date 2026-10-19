import re
from io import BytesIO
from typing import Dict, List, Set, Any
from pypdf import PdfReader


TECH_SKILLS = [
    # Languages
    "Python", "JavaScript", "TypeScript", "Go", "Golang", "Java", "C++", "C#", "PHP",
    "Rust", "Ruby", "SQL", "HTML", "CSS", "Bash", "Shell",
    # Frameworks & Libraries
    "FastAPI", "Django", "Flask", "React", "Vue", "Next.js", "Angular", "Node.js",
    "Express", "Tailwind", "Bootstrap", "Spring Boot", "SQLAlchemy", "Pydantic",
    "Pytest", "Jest", "Pandas", "NumPy", "PyTorch", "TensorFlow", "Scikit-Learn",
    # Databases
    "PostgreSQL", "MySQL", "SQLite", "MongoDB", "Redis", "Elasticsearch", "Cassandra",
    # DevOps, Cloud & Infrastructure
    "Docker", "Docker Compose", "Kubernetes", "Git", "GitHub Actions", "GitLab CI",
    "CI/CD", "AWS", "Azure", "GCP", "Linux", "Nginx", "Terraform",
    # Concepts & Methodologies
    "RESTful API", "REST API", "GraphQL", "Microservices", "Agile", "Scrum",
    "Unit Testing", "OOP", "MVC", "JWT", "OAuth2", "System Design",
]


class AIService:
    @staticmethod
    def extract_text_from_pdf(pdf_bytes: bytes) -> str:
        """Extract all raw text content from uploaded PDF file."""
        text = ""
        try:
            reader = PdfReader(BytesIO(pdf_bytes))
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        except Exception as e:
            raise ValueError(f"Failed to read PDF document: {str(e)}")
        return text

    @staticmethod
    def extract_skills(text: str) -> List[str]:
        """Extract matching tech skills from arbitrary text using regex."""
        found_skills: Set[str] = set()
        lowered_text = text.lower()

        for skill in TECH_SKILLS:
            # Handle special characters like C++, C#, .NET
            escaped = re.escape(skill)
            pattern = rf"(?:^|[\s,.;:!?/()\[\]\n\r]){escaped}(?:[\s,.;:!?/()\[\]\n\r]|$)"
            if re.search(pattern, text, re.IGNORECASE):
                found_skills.add(skill)

        return sorted(list(found_skills))

    @staticmethod
    def analyze_cv_match(cv_text: str, jd_text: str) -> Dict[str, Any]:
        """
        Analyze fit between Candidate CV and Job Description.
        Returns match score, matched skills, missing skills, and recommendations.
        """
        cv_skills = set(AIService.extract_skills(cv_text))
        jd_skills = set(AIService.extract_skills(jd_text))

        if not jd_skills:
            # If JD does not contain explicitly mapped tech skills, calculate based on CV
            match_score = 70.0
            matched = sorted(list(cv_skills))
            missing: List[str] = []
        else:
            matched_set = cv_skills.intersection(jd_skills)
            missing_set = jd_skills.difference(cv_skills)
            matched = sorted(list(matched_set))
            missing = sorted(list(missing_set))

            score = (len(matched_set) / len(jd_skills)) * 100
            match_score = round(min(100.0, max(20.0, score)), 1)

        recommendations = []
        if missing:
            top_missing = missing[:4]
            recommendations.append(
                f"Bổ sung các từ khóa kỹ năng còn thiếu: {', '.join(top_missing)} vào phần Dự án hoặc Kỹ năng trong CV."
            )

        if match_score >= 80:
            recommendations.append(
                "CV của bạn có độ tương thích cao với vị trí này! Hãy nhấn mạnh các dự án thực tế liên quan trong vòng phỏng vấn."
            )
        elif match_score >= 50:
            recommendations.append(
                "Hồ sơ đáp ứng phần lớn yêu cầu cơ bản. Hãy tùy chỉnh thêm mô tả dự án để thể hiện rõ kinh nghiệm với các công nghệ trong JD."
            )
        else:
            recommendations.append(
                "Mức độ tương thích hiện tại còn thấp. Cần bổ sung các đồ án thực hành hoặc chứng chỉ liên quan đến yêu cầu công việc."
            )

        recommendations.append(
            "Đảm bảo các con số định lượng kết quả (ví dụ: tối ưu hiệu năng 25%, phục vụ 500+ requests/s) được đưa vào mô tả kinh nghiệm."
        )

        return {
            "match_score": match_score,
            "matched_skills": matched,
            "missing_skills": missing,
            "cv_skills": sorted(list(cv_skills)),
            "jd_skills": sorted(list(jd_skills)),
            "recommendations": recommendations,
        }
