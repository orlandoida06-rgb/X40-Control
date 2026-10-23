#!/bin/bash
set -Eeuo pipefail

ROBOT="${1:-192.168.1.33}"
KEY="${2:-$HOME/Documents/j69495894cbde7.id_rsa}"
ROOT="$(cd "$(dirname "$0")" && pwd)"
BIN="$ROOT/build/aarch64/valetudo"
BACKUP="/data/x40-control-backup"
SSH=(ssh -i "$KEY" -o ConnectTimeout=10)

fail() {
    echo "[ERROR] $*" >&2
    exit 1
}

echo "===== INSTALADOR SEGURO X40-CONTROL ====="

[[ -f "$BIN" ]] || fail "No existe el binario: $BIN"
[[ -x "$BIN" ]] || fail "El binario no tiene permiso de ejecución"
[[ -f "$KEY" ]] || fail "No existe la clave SSH: $KEY"
command -v sha256sum >/dev/null || fail "Falta sha256sum"
command -v file >/dev/null || fail "Falta file"

file "$BIN" | grep -q 'ARM aarch64' ||
    fail "El binario local no es AArch64"

LOCAL_SHA="$(sha256sum "$BIN" | awk '{print $1}')"
echo "SHA256 local: $LOCAL_SHA"

"${SSH[@]}" "root@$ROBOT" '
    set -eu
    test "$(uname -m)" = aarch64
    test -s /data/valetudo
    test -f /data/_root_postboot.sh
    test -f /data/valetudo_config.json
    test -s /data/x40-control-backup/valetudo.original
    test -f /data/x40-control-backup/_root_postboot.sh.original
' || fail "No se puede conectar o faltan archivos originales necesarios"

echo "[1/4] Preparando copia para rollback..."

"${SSH[@]}" "root@$ROBOT" '
    set -eu
    B=/data/x40-control-backup
    cp -p /data/valetudo "$B/valetudo.before-last-install"
    test -s "$B/valetudo.before-last-install"
    chmod 755 "$B/valetudo.before-last-install"
    sha256sum "$B/valetudo.before-last-install"
'

echo "[2/4] Copiando y verificando el binario..."

"${SSH[@]}" "root@$ROBOT" 'rm -f /data/valetudo.new'
cat "$BIN" | "${SSH[@]}" "root@$ROBOT" 'cat > /data/valetudo.new'
"${SSH[@]}" "root@$ROBOT" 'chmod 755 /data/valetudo.new'

REMOTE_SHA="$("${SSH[@]}" "root@$ROBOT" \
    "sha256sum /data/valetudo.new | cut -d ' ' -f 1")"

[[ "$LOCAL_SHA" = "$REMOTE_SHA" ]] ||
    fail "El SHA256 del binario copiado no coincide"

echo "[3/4] Instalando Valetudo..."

"${SSH[@]}" "root@$ROBOT" '
    set -eu
    mv /data/valetudo.new /data/valetudo
    chmod 755 /data/valetudo

    PID=$(ps | grep "[ /]data/valetudo" | grep -v grep |
        awk "{print \$1}" | head -n 1 || true)

    if [ -n "$PID" ]; then
        kill "$PID" 2>/dev/null || true
        sleep 2
    fi

    nohup sh -c \
        "VALETUDO_CONFIG_PATH=/data/valetudo_config.json /data/valetudo >/tmp/x40control-install.log 2>&1" \
        >/dev/null 2>&1 &
'

echo "[4/4] Comprobando servicio HTTP..."

HTTP_OK=0
for i in $(seq 1 20); do
    if "${SSH[@]}" "root@$ROBOT" '
        if command -v curl >/dev/null 2>&1; then
            curl -sS --max-time 3 -o /dev/null http://127.0.0.1
        elif command -v wget >/dev/null 2>&1; then
            wget -q -T 3 -O /dev/null http://127.0.0.1
        else
            exit 127
        fi
    ' >/dev/null 2>&1; then
        HTTP_OK=1
        break
    fi
    sleep 2
done

if [[ "$HTTP_OK" -ne 1 ]]; then
    echo "[ERROR] Valetudo no responde. Iniciando rollback..."

    "${SSH[@]}" "root@$ROBOT" '
        set -eu
        B=/data/x40-control-backup
        test -s "$B/valetudo.before-last-install"
        cp -p "$B/valetudo.before-last-install" /data/valetudo
        chmod 755 /data/valetudo

        PID=$(ps | grep "[ /]data/valetudo" | grep -v grep |
            awk "{print \$1}" | head -n 1 || true)

        if [ -n "$PID" ]; then
            kill "$PID" 2>/dev/null || true
            sleep 2
        fi

        nohup sh -c \
            "VALETUDO_CONFIG_PATH=/data/valetudo_config.json /data/valetudo >/tmp/x40control-rollback.log 2>&1" \
            >/dev/null 2>&1 &
    ' || {
        echo "[CRÍTICO] Falló el rollback automático."
        echo "[CRÍTICO] No reinicies el robot; será necesaria una recuperación manual."
        exit 2
    }

    echo "[ROLLBACK] Comprobando HTTP del binario restaurado..."
    ROLLBACK_HTTP_OK=0
    for i in $(seq 1 20); do
        if "${SSH[@]}" "root@$ROBOT" '
            if command -v curl >/dev/null 2>&1; then
                curl -sS --max-time 3 -o /dev/null http://127.0.0.1
            elif command -v wget >/dev/null 2>&1; then
                wget -q -T 3 -O /dev/null http://127.0.0.1
            else
                exit 127
            fi
        ' >/dev/null 2>&1; then
            ROLLBACK_HTTP_OK=1
            break
        fi
        sleep 2
    done

    if [[ "$ROLLBACK_HTTP_OK" -eq 1 ]]; then
        echo "[ROLLBACK OK] Binario anterior restaurado y HTTP responde."
    else
        echo "[CRÍTICO] El binario anterior se restauró, pero HTTP no responde."
        echo "[CRÍTICO] No reinicies el robot; revisa /tmp/x40control-rollback.log."
        exit 2
    fi
    exit 1
fi

echo
echo "===== INSTALACIÓN DEL BINARIO COMPLETADA ====="
echo "Robot: http://$ROBOT"
echo "SHA256: $LOCAL_SHA"
echo "Backup: $BACKUP/valetudo.before-last-install"
echo "El actualizador OTA y postboot no se han modificado."
echo "No se ha reiniciado el robot."
