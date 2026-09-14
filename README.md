# X40-Control 🇪🇸

Interfaz personalizada de Valetudo para el Dreame X40 Ultra, con interfaz en español y herramientas para compilar, instalar y actualizar el sistema.

## Características

- 🇪🇸 Interfaz en español
- 🤖 Dreame X40 Ultra
- 🗺️ Mapas
- 🏠 Habitaciones y zonas
- 🧹 Aspirado y fregado
- 📅 Programaciones
- 📊 Estadísticas
- 🔧 Consumibles
- 🎮 Control manual
- 📡 Conectividad
- 📋 Diagnóstico
- 📦 Instalador automático
- 💾 Backup automático

## Compatibilidad

- Dreame X40 Ultra
- ARM64 / aarch64
- Valetudo 2026.05.0

## Instalación

```bash
git clone https://github.com/orlandoida06-rgb/X40-Control.git
cd X40-Control
npm install
npm run ts-check_all
```

## Compilación

```bash
rm -rf /tmp/pkg-cache-x40 && mkdir -p /tmp/pkg-cache-x40 && cd backend && PKG_CACHE_PATH=/tmp/pkg-cache-x40 ../node_modules/.bin/pkg . --targets node22-linuxstatic-arm64 --compress Brotli --public --options "expose-gc,max-heap-size=64" --output ../build/aarch64/valetudo.x40control_final
```

## Instalar en el robot

```bash
./install-x40control.sh
```

Configuración predeterminada:

- Robot: `192.168.1.33`
- Usuario: `root`
- Clave: `~/Documents/j69495894cbde7.id_rsa`

También puedes indicar IP y clave:

```bash
./install-x40control.sh IP_DEL_ROBOT RUTA_DE_LA_CLAVE
```

El instalador realiza backup del binario anterior antes de actualizarlo.

## Actualizar

```bash
git pull
npm install
npm run ts-check_all
```

Después compila el binario y ejecuta:

```bash
./install-x40control.sh
```

## SSH

```bash
ssh -i ~/Documents/j69495894cbde7.id_rsa root@192.168.1.33
```

Para SCP utiliza `-O`:

```bash
scp -O -i ~/Documents/j69495894cbde7.id_rsa archivo root@192.168.1.33:/data/
```

## Archivos del robot

```text
/data/valetudo.x40control_final
/data/valetudo_config.json
/data/valetudo.x40control_final.backup
/tmp/x40control-update.log
/data/_root_postboot.sh
```

## Acceso web

`http://192.168.1.33`

## Comprobación

```bash
ps | grep valetudo.x40control_final | grep -v grep
curl -I http://127.0.0.1
```

## Desarrollo

```bash
git status
git diff
npm run ts-check_all
git add .
git commit -m "Descripción del cambio"
git push origin main
```

## Créditos

X40-Control está basado en Valetudo y adaptado para el Dreame X40 Ultra.

---

**X40-Control — Control total de tu Dreame. 🇪🇸**
