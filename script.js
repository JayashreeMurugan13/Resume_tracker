// Application State
const AppState = {
    currentUser: null,
    isAuthenticated: false,
    uploadedResume: null,
    jobDescription: '',
    analysisResults: null,
    theme: 'light'
};

// DOM Elements
const elements = {
    authPage: document.getElementById('auth-page'),
    dashboardPage: document.getElementById('dashboard-page'),
    loginForm: document.getElementById('login-form'),
    signupForm: document.getElementById('signup-form'),
    showSignup: document.getElementById('show-signup'),
    showLogin: document.getElementById('show-login'),
    themeToggle: document.getElementById('theme-toggle'),
    userBtn: document.getElementById('user-btn'),
    userDropdown: document.getElementById('user-dropdown'),
    logoutBtn: document.getElementById('logout-btn'),
    resumeUpload: document.getElementById('resume-upload'),
    resumeFile: document.getElementById('resume-file'),
    resumeInfo: document.getElementById('resume-info'),
    removeResume: document.getElementById('remove-resume'),
    jobDescriptionTextarea: document.getElementById('job-description'),
    jobFile: document.getElementById('job-file'),
    analyzeBtn: document.getElementById('analyze-btn'),
    resultsSection: document.getElementById('results-section'),
    userName: document.getElementById('user-name'),
    welcomeName: document.getElementById('welcome-name')
};

// Utility Functions
const utils = {
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.getElementById('toast-container').appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    validatePassword(password) {
        const strength = {
            score: 0,
            text: 'Very Weak'
        };
        
        if (password.length >= 8) strength.score += 25;
        if (/[a-z]/.test(password)) strength.score += 25;
        if (/[A-Z]/.test(password)) strength.score += 25;
        if (/[0-9]/.test(password)) strength.score += 25;
        
        if (strength.score >= 100) strength.text = 'Very Strong';
        else if (strength.score >= 75) strength.text = 'Strong';
        else if (strength.score >= 50) strength.text = 'Medium';
        else if (strength.score >= 25) strength.text = 'Weak';
        
        return strength;
    },

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    simulateDelay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Authentication Module
const Auth = {
    async login(email, password) {
        await utils.simulateDelay(1500);
        
        if (!utils.validateEmail(email)) {
            throw new Error('Please enter a valid email address');
        }
        
        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }
        
        // Simulate successful login
        const user = {
            id: Date.now(),
            name: email.split('@')[0].replace(/[^a-zA-Z]/g, ''),
            email: email
        };
        
        AppState.currentUser = user;
        AppState.isAuthenticated = true;
        localStorage.setItem('user', JSON.stringify(user));
        
        return user;
    },

    async signup(name, email, password) {
        await utils.simulateDelay(2000);
        
        if (name.length < 2) {
            throw new Error('Name must be at least 2 characters');
        }
        
        if (!utils.validateEmail(email)) {
            throw new Error('Please enter a valid email address');
        }
        
        const passwordStrength = utils.validatePassword(password);
        if (passwordStrength.score < 50) {
            throw new Error('Password is too weak. Please use a stronger password');
        }
        
        // Simulate successful signup
        const user = {
            id: Date.now(),
            name: name,
            email: email
        };
        
        AppState.currentUser = user;
        AppState.isAuthenticated = true;
        localStorage.setItem('user', JSON.stringify(user));
        
        return user;
    },

    logout() {
        AppState.currentUser = null;
        AppState.isAuthenticated = false;
        localStorage.removeItem('user');
        this.showAuthPage();
    },

    checkAuthState() {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            AppState.currentUser = JSON.parse(savedUser);
            AppState.isAuthenticated = true;
            this.showDashboard();
        } else {
            this.showAuthPage();
        }
    },

    showAuthPage() {
        elements.authPage.classList.remove('hidden');
        elements.dashboardPage.classList.add('hidden');
    },

    showDashboard() {
        elements.authPage.classList.add('hidden');
        elements.dashboardPage.classList.remove('hidden');
        
        if (AppState.currentUser) {
            const firstName = AppState.currentUser.name.split(' ')[0];
            elements.userName.textContent = AppState.currentUser.name;
            elements.welcomeName.textContent = firstName;
        }
    }
};

// File Upload Module
const FileUpload = {
    init() {
        this.setupResumeUpload();
        this.setupJobFileUpload();
    },

    setupResumeUpload() {
        const uploadArea = elements.resumeUpload;
        const fileInput = elements.resumeFile;
        
        // Click to upload
        uploadArea.addEventListener('click', () => fileInput.click());
        
        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleResumeFile(files[0]);
            }
        });
        
        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleResumeFile(e.target.files[0]);
            }
        });
        
        // Remove file
        elements.removeResume.addEventListener('click', () => {
            this.removeResumeFile();
        });
    },

    setupJobFileUpload() {
        elements.jobFile.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleJobFile(e.target.files[0]);
            }
        });
    },

    handleResumeFile(file) {
        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            utils.showToast('Please upload a PDF or DOC file', 'error');
            return;
        }
        
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            utils.showToast('File size must be less than 5MB', 'error');
            return;
        }
        
        AppState.uploadedResume = file;
        this.displayResumeInfo(file);
        this.checkAnalyzeButton();
        
        utils.showToast('Resume uploaded successfully!');
    },

    handleJobFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            elements.jobDescriptionTextarea.value = e.target.result;
            AppState.jobDescription = e.target.result;
            this.checkAnalyzeButton();
            utils.showToast('Job description loaded successfully!');
        };
        reader.readAsText(file);
    },

    displayResumeInfo(file) {
        const fileName = elements.resumeInfo.querySelector('.file-name');
        const fileSize = elements.resumeInfo.querySelector('.file-size');
        
        fileName.textContent = file.name;
        fileSize.textContent = utils.formatFileSize(file.size);
        
        elements.resumeUpload.style.display = 'none';
        elements.resumeInfo.style.display = 'flex';
    },

    removeResumeFile() {
        AppState.uploadedResume = null;
        elements.resumeFile.value = '';
        elements.resumeUpload.style.display = 'block';
        elements.resumeInfo.style.display = 'none';
        this.checkAnalyzeButton();
    },

    checkAnalyzeButton() {
        const hasResume = AppState.uploadedResume !== null;
        const hasJobDescription = elements.jobDescriptionTextarea.value.trim().length > 0;
        
        elements.analyzeBtn.disabled = !(hasResume && hasJobDescription);
    }
};

// Analysis Module
const Analysis = {
    async performAnalysis() {
        elements.analyzeBtn.classList.add('loading');
        
        try {
            // Always try API first
            const results = await this.analyzeWithAPI();
            AppState.analysisResults = results;
            
            this.displayResults(results);
            utils.showToast('Analysis completed successfully!');
            
        } catch (error) {
            console.error('API Analysis failed:', error);
            utils.showToast('Using offline analysis mode', 'warning');
            
            // Only use mock as last resort
            const results = this.generateMockResults();
            this.displayResults(results);
        } finally {
            elements.analyzeBtn.classList.remove('loading');
        }
    },

    async analyzeWithAPI() {
        console.log('Starting API analysis...');
        
        const formData = new FormData();
        formData.append('resume', AppState.uploadedResume);
        formData.append('jobDescription', elements.jobDescriptionTextarea.value.trim());
        
        console.log('Sending request to API...');
        
        const response = await fetch('http://localhost:5000/api/analyze', {
            method: 'POST',
            body: formData
        });
        
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', errorText);
            throw new Error(`Server error: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('API Result:', result);
        
        // Validate result has required fields
        if (typeof result.ats_score === 'undefined') {
            throw new Error('Invalid API response format');
        }
        
        return result;
    },

    generateMockResults() {
        const jobText = elements.jobDescriptionTextarea.value.toLowerCase();
        
        // Mock skill extraction
        const allSkills = [
            'JavaScript', 'Python', 'React', 'Node.js', 'HTML', 'CSS', 'SQL', 'Git',
            'AWS', 'Docker', 'MongoDB', 'Express', 'Vue.js', 'Angular', 'TypeScript',
            'Java', 'C++', 'Machine Learning', 'Data Analysis', 'Project Management',
            'Agile', 'Scrum', 'REST APIs', 'GraphQL', 'Redis', 'PostgreSQL'
        ];
        
        const requiredSkills = allSkills.filter(skill => 
            jobText.includes(skill.toLowerCase())
        ).slice(0, 8);
        
        const resumeSkills = allSkills.slice(0, 12);
        const matchedSkills = requiredSkills.filter(skill => resumeSkills.includes(skill));
        const missingSkills = requiredSkills.filter(skill => !resumeSkills.includes(skill));
        
        const atsScore = Math.floor(60 + (matchedSkills.length / requiredSkills.length) * 40);
        
        return {
            atsScore,
            keywordsMatch: Math.floor(atsScore * 0.8),
            formatScore: Math.floor(85 + Math.random() * 10),
            experienceMatch: Math.floor(atsScore * 0.9),
            matchedSkills,
            missingSkills,
            recommendations: this.generateRecommendations(missingSkills)
        };
    },

    generateRecommendations(missingSkills) {
        const recommendations = [
            {
                title: 'Improve Keyword Optimization',
                description: 'Include more relevant keywords from the job description in your resume to improve ATS compatibility.'
            },
            {
                title: 'Quantify Achievements',
                description: 'Add specific numbers and metrics to demonstrate the impact of your work and accomplishments.'
            }
        ];
        
        if (missingSkills.length > 0) {
            recommendations.unshift({
                title: `Learn ${missingSkills[0]}`,
                description: `Consider taking courses in ${missingSkills[0]} to match the job requirements better.`
            });
        }
        
        return recommendations;
    },

    displayResults(results) {
        console.log('Displaying results:', results);
        
        // Show results section
        elements.resultsSection.style.display = 'block';
        elements.resultsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Update ATS Score with validation
        const atsScore = results.ats_score || 0;
        console.log('ATS Score to display:', atsScore);
        this.animateATSScore(atsScore);
        
        // Update other scores
        document.getElementById('keywords-match').textContent = `${results.keywords_match || 0}%`;
        document.getElementById('format-score').textContent = `${results.format_score || 0}%`;
        document.getElementById('experience-match').textContent = `${results.experience_match || 0}%`;
        
        // Update Skills
        this.displaySkills('matched-skills', results.matched_skills || [], 'matched');
        this.displaySkills('missing-skills', results.missing_skills || [], 'missing');
        document.getElementById('matched-count').textContent = (results.matched_skills || []).length;
        document.getElementById('missing-count').textContent = (results.missing_skills || []).length;
        
        // Update Recommendations
        this.displayRecommendations(results.recommendations || []);
    },

    animateATSScore(score) {
        const scoreElement = document.getElementById('ats-score');
        const circle = document.querySelector('.progress-ring-circle');
        const circumference = 2 * Math.PI * 54;
        
        // Ensure score is a valid number
        const validScore = isNaN(score) ? 0 : Math.max(0, Math.min(100, score));
        const offset = circumference - (validScore / 100) * circumference;
        
        // Animate number
        let currentScore = 0;
        const increment = validScore / 50;
        const timer = setInterval(() => {
            currentScore += increment;
            if (currentScore >= validScore) {
                currentScore = validScore;
                clearInterval(timer);
            }
            scoreElement.textContent = Math.floor(currentScore);
        }, 30);
        
        // Animate circle
        circle.style.strokeDashoffset = offset;
        
        // Color based on score
        if (validScore >= 80) {
            circle.style.stroke = '#10b981';
        } else if (validScore >= 60) {
            circle.style.stroke = '#f59e0b';
        } else {
            circle.style.stroke = '#ef4444';
        }
    },

    displaySkills(containerId, skills, type) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        skills.forEach(skill => {
            const tag = document.createElement('span');
            tag.className = `skill-tag ${type}`;
            tag.textContent = skill;
            container.appendChild(tag);
        });
    },

    displayRecommendations(recommendations) {
        console.log('Displaying recommendations:', recommendations);
        const container = document.getElementById('recommendations-content');
        container.innerHTML = '';
        
        if (!recommendations || recommendations.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary);">No specific recommendations available.</p>';
            return;
        }
        
        recommendations.forEach(rec => {
            const item = document.createElement('div');
            item.className = 'recommendation-item';
            
            // Handle both object and string formats
            const title = rec.title || rec.split(' - ')[0] || 'Recommendation';
            const description = rec.description || rec;
            
            item.innerHTML = `
                <h4>${title}</h4>
                <p>${description}</p>
            `;
            container.appendChild(item);
        });
    }
};

// Theme Module
const Theme = {
    init() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
        
        elements.themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            this.setTheme(newTheme);
        });
    },

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        const icon = elements.themeToggle.querySelector('i');
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
};

// Event Listeners
function initEventListeners() {
    // Auth form toggles
    elements.showSignup.addEventListener('click', (e) => {
        e.preventDefault();
        elements.loginForm.classList.remove('active');
        elements.signupForm.classList.add('active');
    });
    
    elements.showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        elements.signupForm.classList.remove('active');
        elements.loginForm.classList.add('active');
    });
    
    // Password toggles
    document.querySelectorAll('.password-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const input = toggle.previousElementSibling;
            const icon = toggle.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });
    });
    
    // Password strength indicator
    const signupPassword = document.getElementById('signup-password');
    signupPassword.addEventListener('input', (e) => {
        const strength = utils.validatePassword(e.target.value);
        const strengthFill = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');
        
        strengthFill.style.width = `${strength.score}%`;
        strengthText.textContent = strength.text;
        
        if (strength.score >= 75) {
            strengthFill.style.background = '#10b981';
        } else if (strength.score >= 50) {
            strengthFill.style.background = '#f59e0b';
        } else {
            strengthFill.style.background = '#ef4444';
        }
    });
    
    // Auth form submissions
    elements.loginForm.querySelector('form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('.auth-btn');
        btn.classList.add('loading');
        
        try {
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            await Auth.login(email, password);
            Auth.showDashboard();
            utils.showToast('Welcome back!');
        } catch (error) {
            utils.showToast(error.message, 'error');
        } finally {
            btn.classList.remove('loading');
        }
    });
    
    elements.signupForm.querySelector('form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('.auth-btn');
        btn.classList.add('loading');
        
        try {
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            
            await Auth.signup(name, email, password);
            Auth.showDashboard();
            utils.showToast('Account created successfully!');
        } catch (error) {
            utils.showToast(error.message, 'error');
        } finally {
            btn.classList.remove('loading');
        }
    });
    
    // User menu toggle
    elements.userBtn.addEventListener('click', () => {
        elements.userDropdown.classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!elements.userBtn.contains(e.target)) {
            elements.userDropdown.classList.remove('show');
        }
    });
    
    // Logout
    elements.logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.logout();
        utils.showToast('Logged out successfully');
    });
    
    // Job description input
    elements.jobDescriptionTextarea.addEventListener('input', () => {
        AppState.jobDescription = elements.jobDescriptionTextarea.value;
        FileUpload.checkAnalyzeButton();
    });
    
    // Analyze button
    elements.analyzeBtn.addEventListener('click', () => {
        Analysis.performAnalysis();
    });
    
    // Download report
    document.getElementById('download-report').addEventListener('click', () => {
        if (AppState.analysisResults) {
            ReportGenerator.downloadReport(AppState.analysisResults);
        } else {
            utils.showToast('No analysis results to download', 'warning');
        }
    });
}

// Report Generator Module
const ReportGenerator = {
    downloadReport(results) {
        this.generatePDFReport(results);
    },

    generatePDFReport(results) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const userName = AppState.currentUser?.name || 'User';
        const currentDate = new Date().toLocaleDateString();
        
        let yPos = 30;
        
        // Header
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(99, 102, 241);
        doc.text('AI Resume Analysis Report', 20, yPos);
        
        yPos += 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated for: ${userName} | Date: ${currentDate}`, 20, yPos);
        
        // Line separator
        yPos += 10;
        doc.setDrawColor(99, 102, 241);
        doc.line(20, yPos, 190, yPos);
        
        yPos += 20;
        
        // ATS Score Section
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text('ATS Score Analysis', 20, yPos);
        
        yPos += 15;
        
        // Score display
        const atsScore = results.ats_score || 0;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text(`Overall ATS Score: ${atsScore}%`, 20, yPos);
        
        yPos += 10;
        doc.text(`Keywords Match: ${results.keywords_match || 0}%`, 20, yPos);
        yPos += 8;
        doc.text(`Format Score: ${results.format_score || 0}%`, 20, yPos);
        yPos += 8;
        doc.text(`Experience Match: ${results.experience_match || 0}%`, 20, yPos);
        
        yPos += 20;
        
        // Matched Skills
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(16, 185, 129);
        doc.text(`Matched Skills (${(results.matched_skills || []).length})`, 20, yPos);
        
        yPos += 10;
        if (results.matched_skills && results.matched_skills.length > 0) {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60, 60, 60);
            
            const skillsText = results.matched_skills.slice(0, 20).join(', ');
            const lines = doc.splitTextToSize(skillsText, 170);
            
            lines.forEach((line, index) => {
                doc.text(line, 20, yPos + (index * 6));
            });
            
            yPos += lines.length * 6 + 10;
        }
        
        // Missing Skills
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(245, 158, 11);
        doc.text(`Missing Skills (${(results.missing_skills || []).length})`, 20, yPos);
        
        yPos += 10;
        if (results.missing_skills && results.missing_skills.length > 0) {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60, 60, 60);
            
            const missingText = results.missing_skills.slice(0, 20).join(', ');
            const lines = doc.splitTextToSize(missingText, 170);
            
            lines.forEach((line, index) => {
                doc.text(line, 20, yPos + (index * 6));
            });
            
            yPos += lines.length * 6 + 15;
        }
        
        // Recommendations
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(99, 102, 241);
        doc.text('Recommendations', 20, yPos);
        
        yPos += 10;
        if (results.recommendations && results.recommendations.length > 0) {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60, 60, 60);
            
            results.recommendations.forEach((rec, index) => {
                if (yPos > 260) {
                    doc.addPage();
                    yPos = 30;
                }
                
                const title = rec.title || `Recommendation ${index + 1}`;
                const description = rec.description || rec;
                
                doc.setFont('helvetica', 'bold');
                doc.text(`${index + 1}. ${title}`, 20, yPos);
                yPos += 8;
                
                doc.setFont('helvetica', 'normal');
                const descLines = doc.splitTextToSize(description, 170);
                descLines.forEach((line, lineIndex) => {
                    doc.text(line, 25, yPos + (lineIndex * 6));
                });
                
                yPos += descLines.length * 6 + 10;
            });
        }
        
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Generated by AI Resume Analyzer - For guidance purposes only', 20, 280);
        
        // Download
        const fileName = `Resume_Analysis_${currentDate.replace(/\//g, '-')}.pdf`;
        doc.save(fileName);
        
        utils.showToast('PDF report downloaded successfully!');
    }
};

// AI Assistant Module
const AIAssistant = {
    qaDatabase: {
        "what does this website do?": "This website analyzes your resume and compares it with a job description. It shows your matched skills, missing skills, and gives suggestions to improve your resume. 📊",
        "how do i upload my resume?": "After logging in, go to the dashboard and upload your resume in PDF format using the upload button or drag-and-drop option. 📁",
        "is my resume data safe?": "Yes! Your resume is securely stored and used only for analysis. Your data is not shared with anyone. 🔒",
        "what is a skill gap?": "A skill gap means the skills required for a job that are missing in your resume. The system helps you identify and improve them. 🎯",
        "what is ats score?": "ATS score shows how well your resume matches the job description based on skills, keywords, and experience. Higher scores mean better job match! 📈",
        "can freshers use this website?": "Yes! This website is designed for freshers, students, and job seekers to improve their resumes. Perfect for beginners! 🎓",
        "what file formats are supported?": "Currently, PDF and DOCX resumes are supported for best accuracy. Make sure your resume is in one of these formats! 📄",
        "how accurate is the analysis?": "The analysis is based on AI and keyword matching. It gives great guidance but doesn't replace human review. Use it as a helpful tool! 🤖",
        "can i analyze multiple resumes?": "Yes! You can upload and analyze multiple resumes from your account. Great for testing different versions! 📚",
        "what should i do after seeing missing skills?": "You can update your resume by adding relevant skills, learning new technologies, or taking recommended courses. Keep improving! 💪",
        "do i need to create an account?": "Yes. Login or signup is required to securely access the resume analysis features. It's quick and easy! 👤",
        "can i download the report?": "Yes! You can download the resume analysis report after processing. Save it for future reference! 💾",
        "does this website help with job preparation?": "Absolutely! It helps you understand job requirements and improve your resume accordingly. Your job search companion! 🚀",
        "what happens if my resume score is low?": "Don't worry! The system will suggest improvements to help you increase your score. Every expert was once a beginner! 📈",
        "is this website free?": "Yes! This project is free and created for learning and resume improvement purposes. Enjoy! 🎉"
    },

    init() {
        this.bindEvents();
    },

    bindEvents() {
        const toggle = document.getElementById('assistant-toggle');
        const chat = document.getElementById('assistant-chat');
        const close = document.getElementById('chat-close');
        const sendBtn = document.getElementById('chat-send');
        const input = document.getElementById('chat-input-field');

        toggle.addEventListener('click', () => {
            chat.classList.toggle('show');
        });

        close.addEventListener('click', () => {
            chat.classList.remove('show');
        });

        sendBtn.addEventListener('click', () => {
            this.sendMessage();
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Quick question buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-btn')) {
                const question = e.target.getAttribute('data-question');
                this.handleUserMessage(question);
            }
        });
    },

    sendMessage() {
        const input = document.getElementById('chat-input-field');
        const message = input.value.trim();
        
        if (message) {
            this.handleUserMessage(message);
            input.value = '';
        }
    },

    handleUserMessage(message) {
        this.addMessage(message, 'user');
        this.showTyping();
        
        setTimeout(() => {
            this.hideTyping();
            const response = this.getResponse(message);
            this.addMessage(response, 'bot');
        }, 1000);
    },

    addMessage(content, type) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${content}</p>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },

    showTyping() {
        const messagesContainer = document.getElementById('chat-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message';
        typingDiv.id = 'typing-indicator';
        
        typingDiv.innerHTML = `
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },

    hideTyping() {
        const typing = document.getElementById('typing-indicator');
        if (typing) {
            typing.remove();
        }
    },

    getResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Direct match
        if (this.qaDatabase[lowerMessage]) {
            return this.qaDatabase[lowerMessage];
        }
        
        // Keyword matching
        for (const [question, answer] of Object.entries(this.qaDatabase)) {
            if (this.matchesKeywords(lowerMessage, question)) {
                return answer;
            }
        }
        
        // Default response
        return "I'm here to help with resume analysis questions! Try asking about ATS scores, uploading resumes, skill gaps, or how this website works. 😊";
    },

    matchesKeywords(userMessage, question) {
        const userWords = userMessage.split(' ');
        const questionWords = question.split(' ');
        
        let matches = 0;
        for (const word of userWords) {
            if (questionWords.includes(word) && word.length > 2) {
                matches++;
            }
        }
        
        return matches >= 2;
    }
};

// Initialize Application
function initApp() {
    Auth.checkAuthState();
    FileUpload.init();
    Theme.init();
    AIAssistant.init();
    initEventListeners();
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);