@echo off
title QuantVibe MT5 Bridge Launcher
color 0A
cls
echo ====================================================================
echo        QUANTVIBE INSTITUTIONAL ENGINE - MT5 1-CLICK DESKTOP BRIDGE
echo                    https://quantvibeapp.com/
echo ====================================================================
echo.
echo [1/3] Verificando entorno Python...
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] No se encontro Python en tu sistema.
    echo Por favor instala Python 3.9 o superior desde https://www.python.org/
    echo Asegurate de marcar "Add Python to PATH" durante la instalacion.
    pause
    exit /b 1
)

echo [2/3] Verificando paquete MetaTrader5...
python -c "import MetaTrader5" >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Instalando el paquete oficial MetaTrader5 de Python...
    pip install MetaTrader5
)

echo [3/3] Iniciando puente de conexion con MetaTrader 5...
echo Asegurate de que tu terminal MetaTrader 5 este ABIERTO en tu PC.
echo.
python "%~dp0quantvibe_mt5_bridge.py" --server https://quantvibeapp.com

pause
