// ===================== Application State =====================
const AppState = {
    currentUser: null,
    isAuthenticated: false,
    uploadedResume: null,
    jobDescription: '',
    analysisResults: null,
    theme: 'light'
};

// ===================== DOM Elements =====================
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

// ===================== Utils =====================
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
    simulateDelay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
};

// ===================== Authentication =====================
const Auth = {
    async login(email, password) {
        if (!utils.validateEmail(email)) throw new Error('Please enter a valid email');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');

        const response = await fetch('https://resume-tracker-3.onrender.com/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Login failed');
        }

        const user = await response.json();
        AppState.currentUser = user;
        AppState.isAuthenticated = true;
        localStorage.setItem('user', JSON.stringify(user));
        return user;
    },

    async signup(name, email, password) {
        if (name.length < 2) throw new Error('Name must be at least 2 characters');
        if (!utils.validateEmail(email)) throw new Error('Please enter a valid email');
        const passwordStrength = utils.validatePassword(password);
        if (passwordStrength.score < 50) throw new Error('Password is too weak');

        const response = await fetch('https://resume-tracker-3.onrender.com/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Signup failed');
        }

        const user = await response.json();
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

// ===================== File Upload =====================
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
            e.preventDefault(); uploadArea.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) this.handleResumeFile(e.dataTransfer.files[0]);
        });
        fileInput.addEventListener('change', e => {
            if (e.target.files.length > 0) this.handleResumeFile(e.target.files[0]);
        });
        elements.removeResume.addEventListener('click', () => this.removeResumeFile());
    },
    setupJobFileUpload() {
        elements.jobFile.addEventListener('change', e => {
            if (e.target.files.length > 0) this.handleJobFile(e.target.files[0]);
        });
    },
    handleResumeFile(file) {
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) { utils.showToast('Please upload PDF or DOCX', 'error'); return; }
        if (file.size > 5 * 1024 * 1024) { utils.showToast('File must be <5MB', 'error'); return; }
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

// ===================== Analysis =====================
const Analysis = {
    async performAnalysis() {
        elements.analyzeBtn.classList.add('loading');
        try {
            const results = await this.analyzeWithAPI();
            AppState.analysisResults = results;
            this.displayResults(results);
            utils.showToast('Analysis completed successfully!');
        } catch (error) {
            console.error(error);
            utils.showToast('Analysis failed. Try again!', 'error');
        } finally {
            elements.analyzeBtn.classList.remove('loading');
        }
    },
    async analyzeWithAPI() {
        if (!AppState.uploadedResume) throw new Error('No resume uploaded');
        const formData = new FormData();
        formData.append('resume', AppState.uploadedResume);
        formData.append('jobDescription', AppState.jobDescription);

        const response = await fetch('https://resume-tracker-3.onrender.com/api/analyze', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(err || 'Server error');
        }

        return await response.json();
    },
    displayResults(results) {
        elements.resultsSection.style.display = 'block';
        elements.resultsSection.scrollIntoView({ behavior: 'smooth' });
        document.getElementById('ats-score').textContent = results.ats_score || 0;
        document.getElementById('keywords-match').textContent = `${results.keywords_match || 0}%`;
        document.getElementById('format-score').textContent = `${results.format_score || 0}%`;
        document.getElementById('experience-match').textContent = `${results.experience_match || 0}%`;
        // Skills and Recommendations logic here...
    }
};

// ===================== Theme =====================
const Theme = {
    init() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
        elements.themeToggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') || 'light';
            this.setTheme(current === 'light' ? 'dark' : 'light');
        });
    },
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        const icon = elements.themeToggle.querySelector('i');
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
};

// ===================== Event Listeners =====================
function initEventListeners() {
    // Auth toggles
    elements.showSignup.addEventListener('click', e => { e.preventDefault(); elements.loginForm.classList.remove('active'); elements.signupForm.classList.add('active'); });
    elements.showLogin.addEventListener('click', e => { e.preventDefault(); elements.signupForm.classList.remove('active'); elements.loginForm.classList.add('active'); });

    // Login form
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
        } catch (err) { utils.showToast(err.message, 'error'); }
        finally { btn.classList.remove('loading'); }
    });

    // Signup form
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
        } catch (err) { utils.showToast(err.message, 'error'); }
        finally { btn.classList.remove('loading'); }
    });

    // Logout
    elements.logoutBtn.addEventListener('click', e => { e.preventDefault(); Auth.logout(); utils.showToast('Logged out successfully'); });

    // Job description
    elements.jobDescriptionTextarea.addEventListener('input', () => {
        AppState.jobDescription = elements.jobDescriptionTextarea.value;
        FileUpload.checkAnalyzeButton();
    });

    // Analyze button
    elements.analyzeBtn.addEventListener('click', () => Analysis.performAnalysis());
}

// ===================== Initialize App =====================
function initApp() {
    Auth.checkAuthState();
    FileUpload.init();
    Theme.init();
    initEventListeners();
}

document.addEventListener('DOMContentLoaded', initApp);
