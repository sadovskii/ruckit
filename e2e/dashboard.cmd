@echo off
rem Double-click to open the Ruckit e2e dashboard in your browser (http://localhost:9300).
rem The minimized "Ruckit e2e dashboard" window runs it; close that window to stop the dashboard.
cd /d "%~dp0.."
start "Ruckit e2e dashboard" /min node e2e\dashboard\server.mjs --open
