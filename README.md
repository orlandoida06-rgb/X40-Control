cd ~/tuasistente-miio/valetudo-ui

cat > README.md <<'EOF'
# X40-Control 🇪🇸

Interfaz personalizada de Valetudo para el **Dreame X40 Ultra**, con una interfaz moderna y traducida al español.

![X40-Control](screenshot.png)

## ✨ Características

- 🇪🇸 Interfaz completamente en español
- 🤖 Control del Dreame X40 Ultra
- 🗺️ Mapas
- 🏠 Habitaciones y zonas
- 🧹 Aspirado y fregado
- 🎮 Control manual
- 📅 Programaciones
- 📊 Estadísticas
- 🔧 Gestión de consumibles
- 📡 Conectividad
- 📋 Diagnóstico
- 💾 Copias de seguridad
- 📦 Instalador automático

## 🤖 Compatibilidad

Actualmente desarrollado y probado para:

- **Dreame X40 Ultra**
- Arquitectura **ARM64 / aarch64**
- Valetudo **2026.05.0**

## 🚀 Instalación

X40-Control puede instalarse desde cualquier ordenador que tenga acceso SSH al robot.

Necesitas acceso SSH como **root** al robot mediante una clave SSH válida. La clave no tiene que llamarse `id_rsa`; puedes utilizar cualquier clave autorizada para acceder al robot.

### 1. Descargar X40-Control

Clona el repositorio:

```bash
git clone https://github.com/orlandoida06-rgb/X40-Control.git
cd X40-Control

Da permisos de ejecución:
chmod +x install-x40control.sh

Instalar X40-Control

Ejecuta el instalador indicando:

IP_DEL_ROBOT
RUTA_DE_LA_CLAVE_SSH

Comando:

./install-x40control.sh IP_DEL_ROBOT RUTA_DE_LA_CLAVE_SSH

Ejemplo:

./install-x40control.sh 192.168.1.50 ~/.ssh/id_rsa

La IP y la ruta utilizadas en el ejemplo son únicamente orientativas.

Cada usuario debe utilizar la IP de su propio robot y la ruta de su propia clave SSH.

El instalador utiliza el usuario root.

Cuando no encuentra una copia local del ejecutable, el instalador descarga automáticamente el binario de X40-Control desde la Release v1.0.0.

📦 Instalación rápida
git clone https://github.com/orlandoida06-rgb/X40-Control.git
cd X40-Control
chmod +x install-x40control.sh
./install-x40control.sh IP_DEL_ROBOT RUTA_DE_LA_CLAVE_SSH
