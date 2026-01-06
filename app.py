from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import PyPDF2
import docx
import re
import json
from io import BytesIO

app = Flask(__name__)
CORS(app)

# Configure OpenAI API key
openai.api_key = "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"

class ResumeAnalyzer:
    def __init__(self):
        self.skill_database = {
            'programming': ['Python', 'JavaScript', 'Java', 'C++', 'React', 'Node.js', 'SQL', 'HTML', 'CSS', 'TypeScript', 'PHP', 'C#', 'Ruby', 'Go', 'Rust'],
            'frameworks': ['React', 'Angular', 'Vue.js', 'Django', 'Flask', 'Spring', 'Express', 'Laravel', 'Rails', 'ASP.NET'],
            'databases': ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'Cassandra', 'DynamoDB'],
            'cloud': ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'DevOps', 'CI/CD', 'Jenkins', 'Terraform'],
            'data': ['Machine Learning', 'Data Analysis', 'Pandas', 'NumPy', 'Tableau', 'Power BI', 'Excel', 'R', 'Matplotlib', 'Scikit-learn'],
            'design': ['Figma', 'Photoshop', 'UI/UX', 'Adobe Creative Suite', 'Sketch', 'InVision', 'Wireframing'],
            'soft_skills': ['Leadership', 'Communication', 'Project Management', 'Teamwork', 'Problem Solving', 'Agile', 'Scrum'],
            'tools': ['Git', 'GitHub', 'Jira', 'Slack', 'Trello', 'Postman', 'VS Code', 'IntelliJ']
        }
    
    def extract_text_from_pdf(self, file_stream):
        try:
            pdf_reader = PyPDF2.PdfReader(file_stream)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()
            return text
        except Exception as e:
            raise Exception(f"PDF extraction failed: {str(e)}")
    
    def extract_text_from_docx(self, file_stream):
        try:
            doc = docx.Document(file_stream)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text
        except Exception as e:
            raise Exception(f"DOCX extraction failed: {str(e)}")
    
    def extract_skills_with_ai(self, resume_text, job_description):
        prompt = f"""
        You are an expert ATS (Applicant Tracking System) analyzer. Analyze the resume and job description below.
        
        RESUME TEXT:
        {resume_text[:3000]}
        
        JOB DESCRIPTION:
        {job_description[:2000]}
        
        Provide a JSON response with exactly this structure:
        {{
            "resume_skills": ["skill1", "skill2"],
            "required_skills": ["skill1", "skill3"],
            "matched_skills": ["skill1"],
            "missing_skills": ["skill3"],
            "ats_factors": {{
                "keyword_density": 65,
                "format_score": 78,
                "experience_relevance": 72
            }},
            "specific_recommendations": [
                "Learn [specific missing skill] through [specific resource]",
                "Add [specific keyword] to your resume"
            ]
        }}
        
        IMPORTANT: 
        - keyword_density should be 30-80 (most resumes are 50-70)
        - format_score should be 70-90 
        - experience_relevance should be 45-85
        - Be realistic - perfect scores are rare
        - Be specific and actionable in recommendations.
        """
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1500,
                temperature=0.2
            )
            
            content = response.choices[0].message.content.strip()
            # Clean JSON response
            if content.startswith('```json'):
                content = content[7:-3]
            elif content.startswith('```'):
                content = content[3:-3]
            
            result = json.loads(content)
            return result
        except Exception as e:
            print(f"AI Analysis failed: {e}")
            return self.fallback_skill_analysis(resume_text, job_description)
    
    def fallback_skill_analysis(self, resume_text, job_description):
        resume_lower = resume_text.lower()
        job_lower = job_description.lower()
        
        # Extract skills from job description more accurately
        job_skills = []
        
        # Direct skill extraction from job text
        skill_patterns = [
            'html', 'css', 'javascript', 'react', 'node.js', 'nodejs', 'python', 
            'rest api', 'api', 'mysql', 'mongodb', 'git', 'github', 'flask', 
            'django', 'express', 'vue', 'angular', 'sql', 'database', 'frontend',
            'backend', 'full stack', 'responsive', 'web development'
        ]
        
        for skill in skill_patterns:
            if skill in job_lower:
                job_skills.append(skill.title())
        
        # Also check our skill database
        all_skills = []
        for category in self.skill_database.values():
            all_skills.extend(category)
        
        db_required = [skill for skill in all_skills if skill.lower() in job_lower]
        job_skills.extend(db_required)
        
        # Remove duplicates and clean
        required_skills = list(set(job_skills))
        
        # Find resume skills
        resume_skills = [skill for skill in all_skills if skill.lower() in resume_lower]
        
        # Add pattern-based resume skills
        for skill in skill_patterns:
            if skill in resume_lower and skill.title() not in resume_skills:
                resume_skills.append(skill.title())
        
        # Calculate matches
        matched_skills = []
        for req_skill in required_skills:
            for res_skill in resume_skills:
                if req_skill.lower() == res_skill.lower() or req_skill.lower() in res_skill.lower():
                    matched_skills.append(req_skill)
                    break
        
        missing_skills = [skill for skill in required_skills if skill not in matched_skills]
        
        # Improved scoring to match real ATS tools
        total_required = len(required_skills) if required_skills else 1
        match_ratio = len(matched_skills) / total_required
        
        keyword_density = max(50, min(90, int(match_ratio * 85) + 15))
        
        # Very light penalty for missing skills
        if len(missing_skills) > 5:
            keyword_density = max(55, keyword_density - 10)
        elif len(missing_skills) > 3:
            keyword_density = max(60, keyword_density - 5)
        
        format_score = min(92, 80 + (len(resume_text) // 600))
        experience_relevance = max(65, min(90, keyword_density + 10))
        
        recommendations = [
            f"Master {missing_skills[0]} through online courses and certifications",
            f"Build projects demonstrating {missing_skills[1] if len(missing_skills) > 1 else 'technical'} skills",
            "Optimize resume with more job-specific keywords and phrases",
            "Create a professional GitHub portfolio showcasing your work",
            "Network with industry professionals on LinkedIn",
            "Practice technical interviews and coding challenges"
        ]
        
        return {
            'resume_skills': resume_skills[:15],
            'required_skills': required_skills[:12],
            'matched_skills': matched_skills[:10],
            'missing_skills': missing_skills[:8],
            'ats_factors': {
                'keyword_density': keyword_density,
                'format_score': format_score,
                'experience_relevance': experience_relevance
            },
            'specific_recommendations': recommendations
        }
    
    def calculate_ats_score(self, analysis):
        factors = analysis['ats_factors']
        matched = len(analysis.get('matched_skills', []))
        required = len(analysis.get('required_skills', []))
        missing = len(analysis.get('missing_skills', []))
        
        # Calibrated scoring to match real ATS tools
        if required == 0:
            skill_match_score = 70  # Higher default
        else:
            skill_match_score = min(90, (matched / required) * 85 + 15)  # Bonus for any matches
        
        # Light penalty for missing skills
        missing_penalty = min(12, missing * 2)  # Very light penalty
        
        # Higher weighted calculation
        keyword_score = min(90, factors.get('keyword_density', 65) + 5)
        format_score = min(95, factors.get('format_score', 80))
        experience_score = min(90, factors.get('experience_relevance', 75))
        
        # Final weighted score with higher baseline
        ats_score = (
            skill_match_score * 0.35 +
            keyword_score * 0.25 +
            format_score * 0.25 +
            experience_score * 0.15
        ) - missing_penalty + 10  # Base bonus
        
        # Realistic range: 55-95 (most fall between 60-85)
        final_score = max(55, min(95, int(ats_score)))
        
        return final_score
    
    def generate_recommendations(self, analysis):
        recommendations = []
        missing = analysis.get('missing_skills', [])
        matched = analysis.get('matched_skills', [])
        ats_factors = analysis.get('ats_factors', {})
        
        # Diverse recommendation templates
        rec_templates = [
            {
                'condition': len(missing) > 0,
                'title': f'Master {missing[0]}',
                'description': f'Focus on learning {missing[0]} through online courses like Coursera or Udemy. This skill is critical for the role.'
            },
            {
                'condition': len(missing) > 1,
                'title': f'Develop {missing[1]} Skills',
                'description': f'Consider getting certified in {missing[1]}. Build practical projects to demonstrate your expertise.'
            },
            {
                'condition': len(missing) > 2,
                'title': f'Explore {missing[2]} Technology',
                'description': f'Start with {missing[2]} basics through documentation and tutorials. Join relevant communities for support.'
            },
            {
                'condition': ats_factors.get('keyword_density', 0) < 70,
                'title': 'Optimize Resume Keywords',
                'description': 'Include more job-specific terms from the description. Use exact phrases and technical terminology.'
            },
            {
                'condition': ats_factors.get('format_score', 0) < 85,
                'title': 'Improve Resume Format',
                'description': 'Use a cleaner, ATS-friendly template with clear sections, bullet points, and standard fonts.'
            },
            {
                'condition': len(matched) > 0,
                'title': 'Highlight Your Strengths',
                'description': f'Emphasize your {matched[0]} experience with specific examples and quantifiable achievements.'
            },
            {
                'condition': True,  # Always show
                'title': 'Build Portfolio Projects',
                'description': 'Create GitHub projects showcasing the required skills. Include live demos and detailed documentation.'
            },
            {
                'condition': True,  # Always show
                'title': 'Network and Apply',
                'description': 'Connect with professionals in your field on LinkedIn. Apply to similar roles to gain interview experience.'
            }
        ]
        
        # Select unique recommendations
        for template in rec_templates:
            if template['condition'] and len(recommendations) < 4:
                recommendations.append({
                    'title': template['title'],
                    'description': template['description']
                })
        
        return recommendations[:4]

analyzer = ResumeAnalyzer()

@app.route('/api/analyze', methods=['POST'])
def analyze_resume():
    try:
        if 'resume' not in request.files:
            return jsonify({'error': 'No resume file provided'}), 400
        
        resume_file = request.files['resume']
        job_description = request.form.get('jobDescription', '')
        
        print(f"Job Description: {job_description[:200]}...")  # Debug
        
        if not job_description:
            return jsonify({'error': 'Job description is required'}), 400
        
        # Extract text from resume
        file_stream = BytesIO(resume_file.read())
        
        if resume_file.filename.endswith('.pdf'):
            resume_text = analyzer.extract_text_from_pdf(file_stream)
        elif resume_file.filename.endswith('.docx'):
            resume_text = analyzer.extract_text_from_docx(file_stream)
        else:
            # Handle text files for testing
            resume_text = file_stream.read().decode('utf-8')
        
        print(f"Resume Text: {resume_text[:200]}...")  # Debug
        
        # Force fallback analysis for debugging
        analysis = analyzer.fallback_skill_analysis(resume_text, job_description)
        print(f"Analysis: {analysis}")  # Debug
        
        # Calculate ATS score
        ats_score = analyzer.calculate_ats_score(analysis)
        print(f"ATS Score: {ats_score}")  # Debug
        
        # Generate recommendations
        recommendations = analyzer.generate_recommendations(analysis)
        
        result = {
            'ats_score': int(ats_score),
            'keywords_match': int(analysis['ats_factors']['keyword_density']),
            'format_score': int(analysis['ats_factors']['format_score']),
            'experience_match': int(analysis['ats_factors']['experience_relevance']),
            'matched_skills': analysis['matched_skills'][:10],
            'missing_skills': analysis['missing_skills'][:8],
            'recommendations': recommendations
        }
        
        print(f"Final Result: {result}")  # Debug
        return jsonify(result)
        
    except Exception as e:
        print(f"Error: {e}")  # Debug
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)