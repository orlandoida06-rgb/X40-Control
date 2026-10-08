#!/bin/bash
set -e

ROBOT="${1:-192.168.1.33}"
KEY="${2:-$HOME/Documents/j69495894cbde7.id_rsa}"

BIN="$(pwd)/build/aarch64/valetudo"
OTA_SCRIPT="$(pwd)/ota/update.sh"
REMOTE="/data/valetudo"
NEW="/data/valetudo.new"

BACKUP_DIR="/data/x40-control-backup"
BACKUP_VALETUDO="$BACKUP_DIR/valetudo.original"
BACKUP_POSTBOOT="$BACKUP_DIR/_root_postboot.sh.original"

SSH="ssh -i $KEY"
RELEASE_API="https://api.github.com/repos/orlandoida06-rgb/X40-Control/releases/latest"

echo "========================================"
echo "     INSTALADOR X40-CONTROL"
echo "========================================"
echo

echo "[1/6] Comprobando arquitectura del robot..."

$SSH root@"$ROBOT" "echo '[OK] SSH'"

ARCH=$($SSH root@"$ROBOT" "uname -m")

case "$ARCH" in
    aarch64)
        ASSET="valetudo-aarch64"
        ;;
    armv7l|armv7)
        ASSET="valetudo-armv7"
        ;;
    *)
        echo "[ERROR] Arquitectura no soportada: $ARCH"
        exit 1
        ;;
esac

echo "[OK] Arquitectura: $ARCH"
echo "[OK] Asset: $ASSET"
echo

echo "[2/6] Preparando binario..."

if [ ! -f "$BIN" ]; then
    echo "[INFO] Binario local no encontrado."
    echo "[INFO] Consultando el último Release de X40-Control..."

    mkdir -p "$(dirname "$BIN")"

    RELEASE_JSON=$(curl -fsSL "$RELEASE_API")

    RELEASE_TAG=$(
        printf '%s\n' "$RELEASE_JSON" |
        sed -n 's#.*"tag_name": *"\([^"]*\)".*#\1#p' |
        head -n 1
    )

    RELEASE_URL=$(
        printf '%s\n' "$RELEASE_JSON" |
        sed -n "s#.*\"browser_download_url\": *\"\([^\"]*/$ASSET\)\"[,]*#\1#p" |
        head -n 1
    )

    if [ -z "$RELEASE_TAG" ] || [ -z "$RELEASE_URL" ]; then
        echo "[ERROR] No se encontró $ASSET en el último Release"
        echo "[ERROR] Release detectado: ${RELEASE_TAG:-desconocido}"
        exit 1
    fi

    echo "[OK] Último Release: $RELEASE_TAG"
    echo "[INFO] Descargando:"
    echo "       $RELEASE_URL"

    curl -fL \
        --progress-bar \
        "$RELEASE_URL" \
        -o "$BIN"

    chmod 755 "$BIN"

    echo "[OK] Binario descargado"
else
    echo "[OK] Binario local encontrado"
fi

echo
echo "[3/6] Guardando instalación original..."

$SSH root@"$ROBOT" "
set -e

if [ ! -f /data/valetudo ]; then
    echo '[ERROR] No existe /data/valetudo'
    exit 1
fi

if [ ! -f /data/_root_postboot.sh ]; then
    echo '[ERROR] No existe /data/_root_postboot.sh'
    exit 1
fi

mkdir -p '$BACKUP_DIR'

if [ ! -f '$BACKUP_VALETUDO' ]; then
    cp /data/valetudo '$BACKUP_VALETUDO'
    chmod 755 '$BACKUP_VALETUDO'
    echo '[OK] Valetudo original guardado'
else
    echo '[OK] Backup de Valetudo ya existe; no se sobrescribe'
fi

if [ ! -f '$BACKUP_POSTBOOT' ]; then
    cp /data/_root_postboot.sh '$BACKUP_POSTBOOT'
    chmod 755 '$BACKUP_POSTBOOT'
    echo '[OK] Postboot original guardado'
else
    echo '[OK] Backup de postboot ya existe; no se sobrescribe'
fi
"

echo "[OK] Backup protegido en $BACKUP_DIR"
echo

echo "[3/6] Configurando arranque X40-Control..."

$SSH root@"$ROBOT" "
set -e

sed -i 's#^if \[\[ -f /data/.*#if [[ -f /data/valetudo ]]; then#' /data/_root_postboot.sh
sed -i 's#^        VALETUDO_CONFIG_PATH=.*#        VALETUDO_CONFIG_PATH=/data/valetudo_config.json /data/valetudo > /dev/null 2>\&1 \&#' /data/_root_postboot.sh
"

echo "[OK] Postboot configurado para X40-Control"
echo

echo "[4/6] Copiando binario..."

cat "$BIN" | $SSH root@"$ROBOT" "cat > '$NEW'"
$SSH root@"$ROBOT" "chmod 755 '$NEW'"

echo "[OK] Binario copiado"
echo

echo "[4b/6] Instalando instalador OTA..."

if [ ! -f "$OTA_SCRIPT" ]; then
    echo "[ERROR] No existe $OTA_SCRIPT"
    exit 1
fi

cat "$OTA_SCRIPT" | $SSH root@"$ROBOT" "cat > /data/ota/update.sh"
$SSH root@"$ROBOT" "chmod 755 /data/ota/update.sh"

echo "[OK] /data/ota/update.sh instalado"
echo

echo "[5/6] Instalando y lanzando..."

$SSH root@"$ROBOT" "
set -e

mv '$NEW' '$REMOTE'
chmod 755 '$REMOTE'

PID=\$(ps | grep '/data/valetudo' | grep -v grep | grep -v x40control-install | awk '{print \$1}' | head -n 1)

if [ -n \"\$PID\" ]; then
    kill \"\$PID\" 2>/dev/null || true
    sleep 2
fi

nohup sh -c \"VALETUDO_CONFIG_PATH=/data/valetudo_config.json /data/valetudo >/tmp/x40control-install.log 2>&1\" >/dev/null 2>&1 &
"

echo "[OK] Binario instalado"
echo "[OK] Proceso lanzado"
echo

echo "[6/6] Verificando..."

PROCESS_OK=0
HTTP_OK=0

for i in $(seq 1 15); do

    if $SSH root@"$ROBOT" \
        "ps | grep '/data/valetudo' | grep -v grep >/dev/null 2>&1"; then
        PROCESS_OK=1
    fi

    if $SSH root@"$ROBOT" \
        "curl -fsS --max-time 2 -I http://127.0.0.1 >/dev/null 2>&1"; then
        HTTP_OK=1
        break
    fi

    echo "  Esperando web... $i/15"
    sleep 2
done

if [ "$PROCESS_OK" -eq 1 ]; then
    echo "[OK] Proceso funcionando"
else
    echo "[ERROR] El proceso no está funcionando"
    exit 1
fi

if [ "$HTTP_OK" -eq 1 ]; then
    echo "[OK] Web respondiendo"
else
    echo "[ERROR] La web no responde después de 30 segundos"
    echo
    echo "===== LOG DEL ROBOT ====="
    $SSH root@"$ROBOT" "cat /tmp/x40control-install.log 2>/dev/null || true"
    exit 1
fi

echo
echo "========================================"
echo "     INSTALACIÓN COMPLETADA"
echo "========================================"
echo
echo "Robot: $ROBOT"
echo "Web:   http://$ROBOT"
echo
echo "Backup original:"
echo "  $BACKUP_DIR"
echo
echo "Para restaurar:"
echo "  ./uninstall-x40control.sh $ROBOT \"$KEY\""
echo

echo "[INFO] Reiniciando el robot..."
echo

$SSH root@"$ROBOT" "reboot" || true

echo "[OK] Reinicio solicitado"
