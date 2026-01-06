# AI Resume Analyzer - Setup Instructions

## 🚀 Quick Setup

### 1. Install Python Dependencies
```bash
cd c:\project
pip install -r requirements.txt
```

### 2. Get OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key

### 3. Configure API Key
Edit `app.py` line 11:
```python
openai.api_key = "your-actual-api-key-here"
```

### 4. Start Backend Server
```bash
python app.py
```
Server runs on: http://localhost:5000

### 5. Open Frontend
Double-click `index.html` or open in browser

## 🎯 Real AI Features Now Available

### ✅ Actual Resume Parsing
- **PDF Extraction**: Real text extraction from PDF files
- **DOCX Support**: Microsoft Word document parsing
- **Error Handling**: Graceful fallbacks for parsing issues

### ✅ OpenAI Integration
- **GPT-3.5 Analysis**: Real AI-powered skill extraction
- **Smart Matching**: Intelligent skill gap detection
- **Context Awareness**: Job-specific recommendations

### ✅ Accurate ATS Scoring
- **Keyword Density**: Real keyword matching analysis
- **Format Assessment**: Document structure evaluation
- **Experience Relevance**: Job alignment scoring

### ✅ Intelligent Recommendations
- **Personalized Suggestions**: Based on actual skill gaps
- **Learning Paths**: Specific skill improvement advice
- **ATS Optimization**: Format and content recommendations

## 🔧 API Endpoints

### POST /api/analyze
- **Input**: Resume file + Job description
- **Output**: Complete analysis with real scores
- **Processing**: ~3-10 seconds depending on content

### GET /health
- **Purpose**: Check if backend is running
- **Response**: `{"status": "healthy"}`

## 🛠️ Troubleshooting

### Backend Issues:
```bash
# Check if server is running
curl http://localhost:5000/health

# Restart server
python app.py
```

### API Key Issues:
- Ensure OpenAI API key is valid
- Check billing/usage limits
- Verify key has GPT-3.5 access

### File Upload Issues:
- Max file size: 16MB (Flask default)
- Supported formats: PDF, DOCX
- Check file permissions

## 💡 Usage Tips

1. **Upload Quality**: Use clear, well-formatted resumes
2. **Job Descriptions**: Provide detailed job requirements
3. **Wait Time**: Real analysis takes 3-10 seconds
4. **Fallback**: If API fails, mock results still show

## 🔒 Security Notes

- API key should be in environment variables for production
- Add rate limiting for production use
- Implement user authentication for multi-user setup

---

**Now with REAL AI analysis powered by OpenAI GPT-3.5!** 🤖