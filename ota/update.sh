#!/bin/sh

set -eu

BASE="/data/ota"
TARGET="/data/valetudo.x40control_final"
TMP="$BASE/valetudo.x40control_final.new"
MANIFEST="$BASE/manifest.json"
BACKUP_DIR="$BASE/backups"

VOICE_DIR="/data/personalized_voice/X40-Control"
VOICE_TMP="$BASE/X40-Control-voices.tar.gz.new"
VOICE_EXTRACT="$BASE/X40-Control-voices.extract"

MANIFEST_URL="https://raw.githubusercontent.com/orlandoida06-rgb/X40-Control/main/ota/manifest.json"

echo "===== X40CONTROL OTA ====="
echo

mkdir -p "$BASE" "$BACKUP_DIR"

echo "===== MANIFEST ====="

if command -v curl >/dev/null 2>&1; then
    curl -fL --retry 3 --connect-timeout 10 -o "$MANIFEST" "$MANIFEST_URL"
else
    wget -O "$MANIFEST" "$MANIFEST_URL"
fi

cat "$MANIFEST"

VERSION="$(grep '"version"' "$MANIFEST" | sed -E 's/.*"version"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/')"
URL="$(grep '"url"' "$MANIFEST" | sed -E 's/.*"url"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/')"
EXPECTED_SHA256="$(grep '"sha256"' "$MANIFEST" | sed -E 's/.*"sha256"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/')"

VOICE_URL="$(grep '"voices_url"' "$MANIFEST" | sed -E 's/.*"voices_url"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/' || true)"
VOICE_SHA256="$(grep '"voices_sha256"' "$MANIFEST" | sed -E 's/.*"voices_sha256"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/' || true)"

echo
echo "Versión OTA: $VERSION"
echo "URL: $URL"
echo "SHA256 esperado: $EXPECTED_SHA256"

if [ -n "$VOICE_URL" ] && [ -n "$VOICE_SHA256" ]; then
    echo "Voces URL: $VOICE_URL"
    echo "Voces SHA256: $VOICE_SHA256"
else
    echo "Paquete de voces: no definido en este manifest"
fi

echo
echo "===== HASH ACTUAL ====="
CURRENT_SHA256="$(sha256sum "$TARGET" | awk "{print \$1}")"
echo "$CURRENT_SHA256"

BINARY_NEEDS_UPDATE=1

if [ "$CURRENT_SHA256" = "$EXPECTED_SHA256" ]; then
    BINARY_NEEDS_UPDATE=0
    echo "Binario ya actualizado."
else
    echo "Hay una actualización de binario disponible."
fi

VOICE_NEEDS_UPDATE=0

if [ -n "$VOICE_URL" ] && [ -n "$VOICE_SHA256" ]; then
    VOICE_NEEDS_UPDATE=1
fi

if [ "$BINARY_NEEDS_UPDATE" -eq 0 ] && [ "$VOICE_NEEDS_UPDATE" -eq 0 ]; then
    echo
    echo "Ya está instalada esta versión."
    exit 0
fi

if [ "$BINARY_NEEDS_UPDATE" -eq 1 ]; then
    echo
    echo "===== DESCARGA BINARIO ====="

    rm -f "$TMP"

    if command -v curl >/dev/null 2>&1; then
        curl -fL --retry 3 --connect-timeout 10 -o "$TMP" "$URL"
    else
        wget -O "$TMP" "$URL"
    fi

    echo
    echo "===== VERIFICACION BINARIO ====="

    DOWNLOADED_SHA256="$(sha256sum "$TMP" | awk "{print \$1}")"
    echo "Descargado: $DOWNLOADED_SHA256"
    echo "Esperado:   $EXPECTED_SHA256"

    if [ "$DOWNLOADED_SHA256" != "$EXPECTED_SHA256" ]; then
        echo
        echo "ERROR: SHA256 DEL BINARIO INCORRECTO"
        rm -f "$TMP"
        exit 1
    fi

    echo "SHA256 BINARIO OK"
fi

if [ "$VOICE_NEEDS_UPDATE" -eq 1 ]; then
    echo
    echo "===== DESCARGA VOCES ====="

    rm -f "$VOICE_TMP"
    rm -rf "$VOICE_EXTRACT"

    if command -v curl >/dev/null 2>&1; then
        curl -fL --retry 3 --connect-timeout 10 -o "$VOICE_TMP" "$VOICE_URL"
    else
        wget -O "$VOICE_TMP" "$VOICE_URL"
    fi

    echo
    echo "===== VERIFICACION VOCES ====="

    DOWNLOADED_VOICE_SHA256="$(sha256sum "$VOICE_TMP" | awk "{print \$1}")"

    echo "Descargado: $DOWNLOADED_VOICE_SHA256"
    echo "Esperado:   $VOICE_SHA256"

    if [ "$DOWNLOADED_VOICE_SHA256" != "$VOICE_SHA256" ]; then
        echo
        echo "ERROR: SHA256 DE VOCES INCORRECTO"
        rm -f "$VOICE_TMP"
        exit 1
    fi

    echo "SHA256 VOCES OK"

    echo
    echo "===== EXTRACCION VOCES ====="

    mkdir -p "$VOICE_EXTRACT"

    tar -xzf "$VOICE_TMP" -C "$VOICE_EXTRACT"

    EXPECTED_VOICES="
34.ogg
35.ogg
36.ogg
42.ogg
49.ogg
50.ogg
51.ogg
53.ogg
70.ogg
91.ogg
92.ogg
93.ogg
96.ogg
98.ogg
99.ogg
"

    for voice in $EXPECTED_VOICES; do
        if [ ! -f "$VOICE_EXTRACT/$voice" ]; then
            echo "ERROR: falta la voz $voice en el paquete"
            rm -f "$VOICE_TMP"
            rm -rf "$VOICE_EXTRACT"
            exit 1
        fi
    done

    VOICE_COUNT="$(find "$VOICE_EXTRACT" -maxdepth 1 -type f -name '*.ogg' | wc -l)"

    if [ "$VOICE_COUNT" -ne 15 ]; then
        echo "ERROR: cantidad de voces incorrecta: $VOICE_COUNT"
        rm -f "$VOICE_TMP"
        rm -rf "$VOICE_EXTRACT"
        exit 1
    fi

    echo "15 voces verificadas."
fi

echo
echo "===== BACKUP ====="

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$BACKUP_DIR/valetudo.x40control_final.$TIMESTAMP"

if [ "$BINARY_NEEDS_UPDATE" -eq 1 ]; then
    cp -p "$TARGET" "$BACKUP"
    echo "Backup creado: $BACKUP"
fi

echo
echo "===== INSTALACION ====="

if [ "$BINARY_NEEDS_UPDATE" -eq 1 ]; then
    chmod 755 "$TMP"
    mv "$TMP" "$TARGET"
fi

if [ "$VOICE_NEEDS_UPDATE" -eq 1 ]; then
    mkdir -p "$VOICE_DIR"

    for voice in $EXPECTED_VOICES; do
        install -m 644 "$VOICE_EXTRACT/$voice" "$VOICE_DIR/$voice"
    done

    echo "15 voces instaladas en:"
    echo "$VOICE_DIR"
fi

echo
echo "===== VERIFICACION FINAL ====="

if [ "$BINARY_NEEDS_UPDATE" -eq 1 ]; then
    FINAL_SHA256="$(sha256sum "$TARGET" | awk "{print \$1}")"
    echo "Binario:"
    echo "$FINAL_SHA256"

    if [ "$FINAL_SHA256" != "$EXPECTED_SHA256" ]; then
        echo
        echo "ERROR: INSTALACION DEL BINARIO CORRUPTA"
        echo "Restaurando backup..."

        cp -p "$BACKUP" "$TARGET"
        rm -f "$TMP"
        rm -f "$VOICE_TMP"
        rm -rf "$VOICE_EXTRACT"

        echo "Rollback del binario completado."
        exit 1
    fi
fi

if [ "$VOICE_NEEDS_UPDATE" -eq 1 ]; then
    FINAL_VOICE_COUNT="$(find "$VOICE_DIR" -maxdepth 1 -type f -name '*.ogg' | wc -l)"

    echo "Voces instaladas: $FINAL_VOICE_COUNT"

    if [ "$FINAL_VOICE_COUNT" -lt 15 ]; then
        echo
        echo "ERROR: INSTALACION DE VOCES INCOMPLETA"
        exit 1
    fi
fi

rm -f "$TMP"
rm -f "$VOICE_TMP"
rm -rf "$VOICE_EXTRACT"

echo
echo "===== OTA CORRECTO ====="
echo "Versión: $VERSION"

if [ "$BINARY_NEEDS_UPDATE" -eq 1 ]; then
    echo "SHA256: $FINAL_SHA256"
fi

if [ "$VOICE_NEEDS_UPDATE" -eq 1 ]; then
    echo "Voces X40-Control: 15"
fi

echo
echo "Reinicio necesario para activar el binario."
