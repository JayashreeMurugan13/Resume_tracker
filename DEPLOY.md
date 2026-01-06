# 🚀 Deploy Your AI Resume Analyzer

## Option 1: Netlify (Frontend Only - Easiest)

### Steps:
1. Go to https://netlify.com
2. Sign up with GitHub/Google
3. Drag & drop your project folder
4. Get instant live URL: `https://your-site.netlify.app`

**Note**: This deploys frontend only (no AI analysis, uses demo mode)

## Option 2: Railway (Full Stack with AI)

### Steps:
1. Go to https://railway.app
2. Sign up with GitHub
3. Create new project → Deploy from GitHub
4. Add environment variables:
   - `OPENAI_API_KEY`: Your OpenAI key
   - `PORT`: 5000
5. Deploy both frontend and backend

## Option 3: Render (Free Full Stack)

### Steps:
1. Go to https://render.com
2. Create account
3. New Web Service → Connect GitHub
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `python app.py`
6. Add environment variable: `OPENAI_API_KEY`

## Option 4: GitHub Pages (Frontend Only)

### Steps:
1. Create GitHub repository
2. Upload your files
3. Go to Settings → Pages
4. Select source: Deploy from branch
5. Choose main branch
6. Get URL: `https://username.github.io/repo-name`

## 🔧 Prepare for Deployment

### For Frontend-Only Deployment:
- Just upload: `index.html`, `styles.css`, `script.js`
- Users get demo experience (mock analysis)

### For Full AI Deployment:
- Upload all files including `app.py`, `requirements.txt`
- Set OpenAI API key as environment variable
- Configure backend URL in `script.js`

## 📱 Share Your Website

Once deployed, share your URL:
- **Students**: Add to portfolio/resume
- **Social Media**: Share on LinkedIn/Twitter
- **College**: Present in tech fests
- **Friends**: Help them analyze resumes

## 💡 Pro Tips

1. **Custom Domain**: Buy domain from Namecheap ($10/year)
2. **Analytics**: Add Google Analytics to track users
3. **SEO**: Add meta tags for better search ranking
4. **Mobile**: Test on different devices

## 🎯 Recommended Path

**For Beginners**: Start with Netlify (frontend only)
**For Full Experience**: Use Railway or Render (with AI)
**For Portfolio**: GitHub Pages + custom domain

Your website will be live and accessible to anyone worldwide! 🌍