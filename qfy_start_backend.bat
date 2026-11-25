@echo off
REM 姓名：齐方圆　学号：24001011031
REM 时间：2026-11-19　大模型：DeepSeek-V4.1-Flash

title 网页设计课程作业 - 后端服务

cd /d "%~dp0backend"

if not exist "node_modules" (
  echo [提示] 未检测到依赖，正在安装，请稍候...
  call npm install
)

echo.
echo ==========================================
echo   正在启动后端服务：http://localhost:8031
echo   健康检查接口：http://localhost:8031/api/health
echo   按 Ctrl + C 可停止服务
echo ==========================================
echo.

node app.js

echo.
echo 服务已停止。
pause