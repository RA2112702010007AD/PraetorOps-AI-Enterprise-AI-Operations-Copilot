@echo off
set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;%PATH%"

echo ========================================================
echo PraetorOps AI - Git Commit and Push to GitHub
echo ========================================================
echo.

git --version
if errorlevel 1 (
    echo [ERROR] Git could not be located in %LOCALAPPDATA%\Programs\Git\cmd
    exit /b 1
)

echo.
echo [1/4] Ensuring files are staged...
git add -A

echo.
echo [2/4] Committing staged files...
git commit -m "feat: Complete PraetorOps AI Enterprise Operations Copilot with Welcome and Login Gateway"

echo.
echo [3/4] Ensuring main branch and remote...
git branch -M main
git remote set-url origin https://github.com/RA2112702010007AD/PraetorOps-AI-Enterprise-AI-Operations-Copilot.git 2>nul || git remote add origin https://github.com/RA2112702010007AD/PraetorOps-AI-Enterprise-AI-Operations-Copilot.git
git remote -v

echo.
echo [4/4] Pushing to origin main...
git push -u origin main

echo.
echo ========================================================
echo Finished git operation. Exit code: %errorlevel%
echo ========================================================
