@echo off
echo Starting Django Backend...
cd /d "%~dp0"
call venv\Scripts\activate
python manage.py runserver
pause
