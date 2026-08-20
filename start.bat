@echo off
cd /d "%~dp0"
set FINSIGHT_ROOT=%CD%
set PORT=8000
echo FinSightApplication (unified) on http://127.0.0.1:%PORT%/
python -m pip install -r requirements.txt
cd part2_global_equity
python -m uvicorn backend.main:app --host 0.0.0.0 --port %PORT%
pause
