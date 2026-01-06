from flask import Flask, request, jsonify
from flask_cors import CORS
import PyPDF2
import docx
from io import BytesIO
import os

app = Flask(__name__)
CORS(app)

# ==========================
# HOME ROUTE
# ==========================
@app.route("/")
def home():
    return "Resume Tracker Backend is Running 🚀"

# ==========================
# RESUME ANALYZER
# ==========================
class ResumeAnalyzer:
    def __init__(self):
        self.skill_database = {
            'programming': ['Python', 'JavaScript', 'Java', 'C++', 'React', 'Node.js', 'SQL', 'HTML', 'CSS'],
            'frameworks': ['Flask', 'Django', 'React', 'Angular'],
            'databases': ['MySQL', 'PostgreSQL', 'MongoDB'],
            'tools': ['Git', 'GitHub', 'Docker', 'AWS']
        }

    def extract_text_from_pdf(self, file_stream):
        reader = PyPDF2.PdfReader(file_stream)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text

    def extract_text_from_docx(self, file_stream):
        document = docx.Document(file_stream)
        return "\n".join([p.text for p in document.paragraphs])

    def analyze(self, resume_text, job_description):
        resume_lower = resume_text.lower()
        job_lower = job_description.lower()

        all_skills = sum(self.skill_database.values(), [])

        resume_skills = [s for s in all_skills if s.lower() in resume_lower]
        required_skills = [s for s in all_skills if s.lower() in job_lower]

        matched = list(set(resume_skills) & set(required_skills))
        missing = list(set(required_skills) - set(matched))

        ats_score = min(95, max(50, int((len(matched) / max(len(required_skills), 1)) * 100)))

        return ats_score, matched, missing


analyzer = ResumeAnalyzer()

# ==========================
# ANALYZE API
# ==========================
@app.route("/api/analyze", methods=["POST"])
def analyze_resume():
    if "resume" not in request.files:
        return jsonify({"error": "Resume file required"}), 400

    resume_file = request.files["resume"]
    job_description = request.form.get("jobDescription")

    if not job_description:
        return jsonify({"error": "Job description required"}), 400

    file_stream = BytesIO(resume_file.read())

    if resume_file.filename.endswith(".pdf"):
        resume_text = analyzer.extract_text_from_pdf(file_stream)
    elif resume_file.filename.endswith(".docx"):
        resume_text = analyzer.extract_text_from_docx(file_stream)
    else:
        resume_text = file_stream.read().decode("utf-8")

    ats, matched, missing = analyzer.analyze(resume_text, job_description)

    return jsonify({
        "ats_score": ats,
        "matched_skills": matched,
        "missing_skills": missing
    })

# ==========================
# HEALTH CHECK
# ==========================
@app.route("/health")
def health():
    return jsonify({"status": "healthy"})

# ==========================
# RUN SERVER
# ==========================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
