#!/bin/bash
set -Eeuo pipefail

ROBOT="${1:-192.168.1.33}"
KEY="${2:-$HOME/Documents/j69495894cbde7.id_rsa}"
BACKUP="/data/x40-control-backup"
SSH=(ssh -i "$KEY" -o ConnectTimeout=10)

[[ -f "$KEY" ]] || {
    echo "[ERROR] No existe la clave SSH: $KEY" >&2
    exit 1
}

echo "===== DESINSTALADOR X40-CONTROL ====="
echo "[AVISO] Se conservará /data/ota/update.sh porque no hay copia original verificada."

"${SSH[@]}" "root@$ROBOT" "
    set -eu
    B='$BACKUP'

    echo '[PREVALIDACIÓN] Comprobando copias originales...'
    test -s \"\$B/valetudo.original\" || {
        echo '[ERROR] Falta valetudo.original'
        exit 1
    }
    test -f \"\$B/_root_postboot.sh.original\" || {
        echo '[ERROR] Falta _root_postboot.sh.original'
        exit 1
    }

    echo '[1/3] Restaurando Valetudo original...'
    cp -p \"\$B/valetudo.original\" /data/valetudo
    chmod 755 /data/valetudo

    echo '[2/3] Restaurando postboot original...'
    cp -p \"\$B/_root_postboot.sh.original\" /data/_root_postboot.sh
    chmod 755 /data/_root_postboot.sh

    echo '[3/3] Reiniciando proceso Valetudo...'
    rm -f /data/valetudo.new

    PID=\$(ps | grep '[ /]data/valetudo' | grep -v grep |
        awk '{print \$1}' | head -n 1 || true)

    if [ -n \"\$PID\" ]; then
        kill \"\$PID\" 2>/dev/null || true
        sleep 2
    fi

    nohup sh -c \
        'VALETUDO_CONFIG_PATH=/data/valetudo_config.json /data/valetudo >/tmp/x40control-uninstall.log 2>&1' \
        >/dev/null 2>&1 &

    echo '[OK] Valetudo y postboot restaurados.'
    echo '[OK] OTA conservado sin modificaciones.'
"

echo "Desinstalación completada. No se ha reiniciado el robot."
