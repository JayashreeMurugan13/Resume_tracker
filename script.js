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
        const strength = { score: 0, text: 'Very Weak' };
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
        if (!utils.validateEmail(email)) throw new Error('Please enter a valid email address');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');

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
        if (name.length < 2) throw new Error('Name must be at least 2 characters');
        if (!utils.validateEmail(email)) throw new Error('Please enter a valid email address');
        const passwordStrength = utils.validatePassword(password);
        if (passwordStrength.score < 50) throw new Error('Password is too weak. Please use a stronger password');

        const user = { id: Date.now(), name, email };
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
        } else this.showAuthPage();
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
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.classList.add('dragover'); });
        uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
        uploadArea.addEventListener('drop', e => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) this.handleResumeFile(e.dataTransfer.files[0]);
        });
        fileInput.addEventListener('change', e => { if (e.target.files.length > 0) this.handleResumeFile(e.target.files[0]); });
        elements.removeResume.addEventListener('click', () => this.removeResumeFile());
    },

    setupJobFileUpload() {
        elements.jobFile.addEventListener('change', e => {
            if (e.target.files.length > 0) this.handleJobFile(e.target.files[0]);
        });
    },

    handleResumeFile(file) {
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) { utils.showToast('Please upload a PDF or DOC file', 'error'); return; }
        if (file.size > 5 * 1024 * 1024) { utils.showToast('File size must be less than 5MB', 'error'); return; }
        AppState.uploadedResume = file;
        this.displayResumeInfo(file);
        this.checkAnalyzeButton();
        utils.showToast('Resume uploaded successfully!');
    },

    handleJobFile(file) {
        const reader = new FileReader();
        reader.onload = e => {
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
            const results = await this.analyzeWithAPI();
            AppState.analysisResults = results;
            this.displayResults(results);
            utils.showToast('Analysis completed successfully!');
        } catch (error) {
            console.error('API Analysis failed:', error);
            utils.showToast('Using offline analysis mode', 'warning');
            const results = this.generateMockResults();
            this.displayResults(results);
        } finally {
            elements.analyzeBtn.classList.remove('loading');
        }
    },

    async analyzeWithAPI() {
        const formData = new FormData();
        formData.append('resume', AppState.uploadedResume);
        formData.append('jobDescription', elements.jobDescriptionTextarea.value.trim());

        const response = await fetch('https://resume-tracker-3.onrender.com/api/analyze', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', errorText);
            throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();
        if (typeof result.ats_score === 'undefined') throw new Error('Invalid API response format');
        return result;
    },

    generateMockResults() {
        const jobText = elements.jobDescriptionTextarea.value.toLowerCase();
        const allSkills = ['JavaScript', 'Python', 'React', 'Node.js', 'HTML', 'CSS', 'SQL', 'Git', 'AWS', 'Docker', 'MongoDB', 'Express', 'Vue.js', 'Angular', 'TypeScript', 'Java', 'C++', 'Machine Learning', 'Data Analysis', 'Project Management', 'Agile', 'Scrum', 'REST APIs', 'GraphQL', 'Redis', 'PostgreSQL'];
        const requiredSkills = allSkills.filter(skill => jobText.includes(skill.toLowerCase())).slice(0, 8);
        const resumeSkills = allSkills.slice(0, 12);
        const matchedSkills = requiredSkills.filter(skill => resumeSkills.includes(skill));
        const missingSkills = requiredSkills.filter(skill => !resumeSkills.includes(skill));
        const atsScore = Math.floor(60 + (matchedSkills.length / requiredSkills.length) * 40);

        return {
            ats_score: atsScore,
            keywords_match: Math.floor(atsScore * 0.8),
            format_score: Math.floor(85 + Math.random() * 10),
            experience_match: Math.floor(atsScore * 0.9),
            matched_skills: matchedSkills,
            missing_skills: missingSkills,
            recommendations: this.generateRecommendations(missingSkills)
        };
    },

    generateRecommendations(missingSkills) {
        const recommendations = [
            { title: 'Improve Keyword Optimization', description: 'Include more relevant keywords from the job description in your resume to improve ATS compatibility.' },
            { title: 'Quantify Achievements', description: 'Add specific numbers and metrics to demonstrate the impact of your work and accomplishments.' }
        ];
        if (missingSkills.length > 0) {
            recommendations.unshift({ title: `Learn ${missingSkills[0]}`, description: `Consider taking courses in ${missingSkills[0]} to match the job requirements better.` });
        }
        return recommendations;
    },

    displayResults(results) {
        elements.resultsSection.style.display = 'block';
        elements.resultsSection.scrollIntoView({ behavior: 'smooth' });
        this.animateATSScore(results.ats_score || 0);
        document.getElementById('keywords-match').textContent = `${results.keywords_match || 0}%`;
        document.getElementById('format-score').textContent = `${results.format_score || 0}%`;
        document.getElementById('experience-match').textContent = `${results.experience_match || 0}%`;
        this.displaySkills('matched-skills', results.matched_skills || [], 'matched');
        this.displaySkills('missing-skills', results.missing_skills || [], 'missing');
        document.getElementById('matched-count').textContent = (results.matched_skills || []).length;
        document.getElementById('missing-count').textContent = (results.missing_skills || []).length;
        this.displayRecommendations(results.recommendations || []);
    },

    animateATSScore(score) {
        const scoreElement = document.getElementById('ats-score');
        const circle = document.querySelector('.progress-ring-circle');
        const circumference = 2 * Math.PI * 54;
        const validScore = isNaN(score) ? 0 : Math.max(0, Math.min(100, score));
        const offset = circumference - (validScore / 100) * circumference;
        let currentScore = 0;
        const increment = validScore / 50;
        const timer = setInterval(() => {
            currentScore += increment;
            if (currentScore >= validScore) { currentScore = validScore; clearInterval(timer); }
            scoreElement.textContent = Math.floor(currentScore);
        }, 30);
        circle.style.strokeDashoffset = offset;
        circle.style.stroke = validScore >= 80 ? '#10b981' : validScore >= 60 ? '#f59e0b' : '#ef4444';
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
        const container = document.getElementById('recommendations-content');
        container.innerHTML = '';
        if (!recommendations || recommendations.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary);">No specific recommendations available.</p>';
            return;
        }
        recommendations.forEach((rec, index) => {
            const item = document.createElement('div');
            item.className = 'recommendation-item';
            const title = rec.title || rec.split(' - ')[0] || 'Recommendation';
            const description = rec.description || rec;
            item.innerHTML = `<h4>${title}</h4><p>${description}</p>`;
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
            this.setTheme(currentTheme === 'light' ? 'dark' : 'light');
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
    elements.showSignup.addEventListener('click', e => { e.preventDefault(); elements.loginForm.classList.remove('active'); elements.signupForm.classList.add('active'); });
    elements.showLogin.addEventListener('click', e => { e.preventDefault(); elements.signupForm.classList.remove('active'); elements.loginForm.classList.add('active'); });

    document.querySelectorAll('.password-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const input = toggle.previousElementSibling;
            const icon = toggle.querySelector('i');
            if (input.type === 'password') { input.type = 'text'; icon.className = 'fas fa-eye-slash'; }
            else { input.type = 'password'; icon.className = 'fas fa-eye'; }
        });
    });

    const signupPassword = document.getElementById('signup-password');
    signupPassword.addEventListener('input', e => {
        const strength = utils.validatePassword(e.target.value);
        const strengthFill = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');
        strengthFill.style.width = `${strength.score}%`;
        strengthText.textContent = strength.text;
        strengthFill.style.background = strength.score >= 75 ? '#10b981' : strength.score >= 50 ? '#f59e0b' : '#ef4444';
    });

    elements.loginForm.querySelector('form').addEventListener('submit', async e => {
        e.preventDefault();
        const btn = e.target.querySelector('.auth-btn');
        btn.classList.add('loading');
        try {
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            await Auth.login(email, password);
            Auth.showDashboard();
            utils.showToast('Welcome back!');
        } catch (error) { utils.showToast(error.message, 'error'); } finally { btn.classList.remove('loading'); }
    });

    elements.signupForm.querySelector('form').addEventListener('submit', async e => {
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
        } catch (error) { utils.showToast(error.message, 'error'); } finally { btn.classList.remove('loading'); }
    });

    elements.userBtn.addEventListener('click', () => elements.userDropdown.classList.toggle('show'));
   
