#!/bin/bash
set -e

ROBOT="${1:-192.168.1.33}"
KEY="${2:-$HOME/Documents/j69495894cbde7.id_rsa}"

BACKUP_DIR="/data/x40-control-backup"
BACKUP_VALETUDO="$BACKUP_DIR/valetudo.original"
BACKUP_POSTBOOT="$BACKUP_DIR/_root_postboot.sh.original"

SSH="ssh -i $KEY"

echo "========================================"
echo "   DESINSTALADOR X40-CONTROL"
echo "========================================"
echo

echo "[1/5] Comprobando backup..."

$SSH root@"$ROBOT" "
set -e

if [ ! -f '$BACKUP_VALETUDO' ]; then
    echo '[ERROR] No existe el Valetudo original'
    exit 1
fi

if [ ! -f '$BACKUP_POSTBOOT' ]; then
    echo '[ERROR] No existe el postboot original'
    exit 1
fi

echo '[OK] Backup encontrado'
"

echo
echo "[2/5] Deteniendo X40-Control..."

$SSH root@"$ROBOT" "
PID=\$(ps | grep '/data/valetudo' | grep -v grep | grep -v uninstall-x40control | awk '{print \$1}' | head -n 1)

if [ -n \"\$PID\" ]; then
    kill \"\$PID\" 2>/dev/null || true
    sleep 3
fi

echo '[OK] Proceso detenido'
"

echo
echo "[3/5] Restaurando Valetudo original..."

$SSH root@"$ROBOT" "
set -e

cp '$BACKUP_VALETUDO' /data/valetudo
chmod 755 /data/valetudo

cp '$BACKUP_POSTBOOT' /data/_root_postboot.sh
chmod 755 /data/_root_postboot.sh

echo '[OK] Valetudo original restaurado'
echo '[OK] Postboot original restaurado'
"

echo
echo "[4/5] Limpiando archivos temporales..."

$SSH root@"$ROBOT" "
rm -f /data/valetudo.new

echo '[OK] Archivos X40-Control antiguos eliminados'
echo '[INFO] Backup conservado en $BACKUP_DIR'
"

echo
echo "[5/5] Restauración completada"
echo
echo "========================================"
echo "     X40-CONTROL DESINSTALADO"
echo "========================================"
echo
echo "El Valetudo original será arrancado"
echo "después del reinicio."
echo
echo "[INFO] Reiniciando el robot..."
echo

$SSH root@"$ROBOT" "reboot" || true

echo "[OK] Reinicio solicitado"
