@echo off
echo ========================================
echo Preparing for Deployment
echo ========================================
echo.

echo Creating deployment folder...
mkdir deploy 2>nul

echo Copying frontend files...
copy index.html deploy\
copy styles.css deploy\
copy script.js deploy\

echo.
echo ========================================
echo Ready for Deployment!
echo ========================================
echo.
echo Frontend files copied to 'deploy' folder
echo.
echo Next steps:
echo 1. Go to https://netlify.com
echo 2. Drag and drop the 'deploy' folder
echo 3. Get your live website URL!
echo.
echo For full AI features, see DEPLOY.md
echo.
pause