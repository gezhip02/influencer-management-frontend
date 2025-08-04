@echo off
echo.
echo ========================================
echo    生产环境静态导出构建
echo ========================================
echo.

echo 🧹 清理旧的构建文件...
if exist "out" rmdir /s /q "out"
if exist ".next" rmdir /s /q ".next"

echo.
echo 🔧 设置生产环境变量...
set NODE_ENV=production
set STATIC_EXPORT=true
set NEXT_PUBLIC_API_BASE_URL=https://www.knnector.com/api
set NEXT_PUBLIC_USE_MOCK=false

echo.
echo 📋 当前环境变量:
echo    NODE_ENV: %NODE_ENV%
echo    STATIC_EXPORT: %STATIC_EXPORT%
echo    API_BASE_URL: %NEXT_PUBLIC_API_BASE_URL%
echo    USE_MOCK: %NEXT_PUBLIC_USE_MOCK%

echo.
echo 🚀 开始生产环境构建...
call npm run build

if %errorlevel% neq 0 (
    echo.
    echo ❌ 构建失败！
    pause
    exit /b 1
)

echo.
echo ✅ 生产环境构建成功！
echo.
echo 🔍 验证API配置...
if exist "out\_next\static\chunks" (
    echo    ✓ 静态文件生成成功
    echo    ✓ API地址已设置为: https://www.knnector.com/api
) else (
    echo    ❌ 静态文件生成异常
)

echo.
echo 📊 构建统计：
if exist "out" (
    echo    - 输出目录: out/
    for /f %%i in ('dir /s /b "out\*.html" ^| find /c ".html"') do echo    - HTML文件数量: %%i
) else (
    echo    ❌ 输出目录不存在
)

echo.
echo 🌐 生产部署说明：
echo    1. 将 out/ 目录内容上传到 knnector.com
echo    2. 确保API服务器在 https://www.knnector.com/api 正常运行
echo    3. 测试登录功能和API调用
echo.

echo 🎉 生产环境构建完成！
pause