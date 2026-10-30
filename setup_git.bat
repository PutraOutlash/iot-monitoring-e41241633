@echo off
echo Menginisialisasi Git...
git init
git add package.json .gitignore
git commit -m "chore: setup proyek"
git add db.js
git commit -m "feat: skema database"
git add server.js
git commit -m "feat: API readings"
git add simulator.js
git commit -m "feat: simulator sensor"
git add public/
git commit -m "feat: dashboard monitoring"
git add README.md esp32_code/ setup_git.sh setup_git.bat
git commit -m "docs: README dan kelengkapan"
echo Proses commit Git selesai! Anda siap untuk push ke GitHub.
pause