#!/bin/bash
set -e

ROBOT="${1:-192.168.1.33}"
KEY="${2:-$HOME/Documents/j69495894cbde7.id_rsa}"

BIN="$(pwd)/build/aarch64/valetudo.x40control_final"
REMOTE="/data/valetudo.x40control_final"
NEW="/data/valetudo.x40control_final.new"
BACKUP="/data/valetudo.x40control_final.backup"

RELEASE_URL="https://github.com/orlandoida06-rgb/X40-Control/releases/download/v1.0.0/valetudo.x40control_final"

SSH="ssh -i $KEY"
SCP="scp -O -i $KEY"

echo "========================================"
echo "     INSTALADOR X40-CONTROL"
echo "========================================"
echo

echo "[1/6] Preparando binario..."

if [ ! -f "$BIN" ]; then
    echo "[INFO] Binario local no encontrado."
    echo "[INFO] Descargando X40-Control v1.0.0..."

    mkdir -p "$(dirname "$BIN")"

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
echo "[2/6] Comprobando robot..."

$SSH root@"$ROBOT" "echo '[OK] SSH'"

ARCH=$($SSH root@"$ROBOT" "uname -m")

if [ "$ARCH" != "aarch64" ]; then
    echo "[ERROR] Arquitectura incorrecta: $ARCH"
    exit 1
fi

echo "[OK] Arquitectura aarch64"
echo

echo "[3/6] Creando backup..."

$SSH root@"$ROBOT" "
if [ -f '$REMOTE' ]; then
    cp '$REMOTE' '$BACKUP'
fi
"

echo "[OK] Backup creado"
echo

echo "[4/6] Copiando binario..."

$SCP "$BIN" root@"$ROBOT":"$NEW"

echo

echo "[5/6] Instalando y reiniciando..."

$SSH root@"$ROBOT" "
chmod 755 '$NEW'
mv '$NEW' '$REMOTE'
chmod 755 '$REMOTE'

PID=\$(ps | grep '/data/valetudo.x40control_final' | grep -v grep | awk '{print \$1}' | head -n 1)

if [ -n \"\$PID\" ]; then
    kill \"\$PID\" 2>/dev/null || true
    sleep 2
fi

nohup sh -c \"VALETUDO_CONFIG_PATH=/data/valetudo_config.json /data/valetudo.x40control_final >/tmp/x40control-update.log 2>&1\" >/dev/null 2>&1 &
"

echo "[OK] Binario instalado"
echo "[OK] Proceso lanzado"
echo

echo "[6/6] Verificando..."

PROCESS_OK=0
HTTP_OK=0

for i in $(seq 1 15); do

    if $SSH root@"$ROBOT" \
        "ps | grep '/data/valetudo.x40control_final' | grep -v grep >/dev/null 2>&1"; then
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
    $SSH root@"$ROBOT" "cat /tmp/x40control-update.log 2>/dev/null || true"
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
