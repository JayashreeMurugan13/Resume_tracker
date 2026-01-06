import requests
import json

# Test the API directly
job_desc = """Job Title: Full Stack Developer (Fresher)
Required Skills: HTML, CSS, JavaScript, React, Node.js, Python, REST API, MySQL, MongoDB, Git, GitHub, Flask, Django"""

# Create a simple test
data = {
    'jobDescription': job_desc
}

# Test file (create a dummy file)
files = {
    'resume': ('test.txt', 'I know HTML CSS JavaScript Python Git', 'text/plain')
}

try:
    response = requests.post('http://localhost:5000/api/analyze', data=data, files=files)
    print("Status:", response.status_code)
    print("Response:", json.dumps(response.json(), indent=2))
except Exception as e:
    print("Error:", e)