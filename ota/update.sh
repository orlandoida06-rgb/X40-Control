#!/bin/sh

set -eu

BASE="/data/ota"
TARGET="/data/valetudo"
TMP="$BASE/valetudo.new"
MANIFEST="$BASE/manifest.json"
BACKUP_DIR="$BASE/backups"
DUST_TARGET="/data/duststreamer"
DUST_TMP="$BASE/duststreamer.new"
DUST_BACKUP_DIR="$BACKUP_DIR/duststreamer"

VOICE_DIR="/data/personalized_voice/X40-Control"
VOICE_TMP="$BASE/X40-Control-voices.tar.gz.new"
VOICE_EXTRACT="$BASE/X40-Control-voices.extract"

MANIFEST_URL="https://raw.githubusercontent.com/orlandoida06-rgb/X40-Control/integration-ota-2026.10.12/ota/manifest.json"

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
DUST_URL="$(grep '"duststreamer_url"' "$MANIFEST" | sed -E 's/.*"duststreamer_url"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/' || true)"
DUST_SHA256="$(grep '"duststreamer_sha256"' "$MANIFEST" | sed -E 's/.*"duststreamer_sha256"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/' || true)"

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

DUST_NEEDS_UPDATE=0
if [ -n "$DUST_URL" ] && [ -n "$DUST_SHA256" ]; then
    case "$DUST_SHA256" in
        *[!a-fA-F0-9]*|"") echo "ERROR: SHA256 de Duststreamer no válido"; exit 1 ;;
    esac
    if [ "${#DUST_SHA256}" -ne 64 ]; then
        echo "ERROR: longitud SHA256 de Duststreamer incorrecta"; exit 1
    fi
    echo "Duststreamer URL: $DUST_URL"
    echo "Duststreamer SHA256: $DUST_SHA256"
    if [ -f "$DUST_TARGET" ]; then
        DUST_CURRENT_SHA="$(sha256sum "$DUST_TARGET" | awk '{print $1}')"
        [ "$DUST_CURRENT_SHA" = "$DUST_SHA256" ] || DUST_NEEDS_UPDATE=1
    else
        DUST_NEEDS_UPDATE=1
    fi
else
    echo "Duststreamer: no definido en este manifest; no se modifica"
fi

echo
echo "===== HASH ACTUAL ====="

if [ ! -f "$TARGET" ]; then
    echo "ERROR: no existe $TARGET"
    exit 1
fi

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

if [ "$BINARY_NEEDS_UPDATE" -eq 0 ] && [ "$VOICE_NEEDS_UPDATE" -eq 0 ] && [ "$DUST_NEEDS_UPDATE" -eq 0 ]; then
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

if [ "$DUST_NEEDS_UPDATE" -eq 1 ]; then
    echo
    echo "===== DESCARGA DUSTSTREAMER ====="
    rm -f "$DUST_TMP"

    if command -v curl >/dev/null 2>&1; then
        curl -fL --retry 3 --connect-timeout 10 -o "$DUST_TMP" "$DUST_URL"
    else
        wget -O "$DUST_TMP" "$DUST_URL"
    fi

    DOWNLOADED_DUST_SHA="$(sha256sum "$DUST_TMP" | awk '{print $1}')"
    echo "Descargado: $DOWNLOADED_DUST_SHA"
    echo "Esperado:   $DUST_SHA256"

    if [ "$DOWNLOADED_DUST_SHA" != "$DUST_SHA256" ]; then
        echo "ERROR: SHA256 DE DUSTSTREAMER INCORRECTO"
        rm -f "$DUST_TMP"
        exit 1
    fi

    chmod 755 "$DUST_TMP"
    echo "SHA256 DUSTSTREAMER OK"
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
BACKUP="$BACKUP_DIR/valetudo.$TIMESTAMP"

if [ "$BINARY_NEEDS_UPDATE" -eq 1 ]; then
    cp -p "$TARGET" "$BACKUP"
    echo "Backup creado: $BACKUP"

    ls -1t "$BACKUP_DIR"/valetudo.* 2>/dev/null |
        tail -n +3 |
        while IFS= read -r OLD_BACKUP; do
            echo "Eliminando backup OTA antiguo: $OLD_BACKUP"
            rm -f "$OLD_BACKUP"
        done
fi

echo
if [ "$DUST_NEEDS_UPDATE" -eq 1 ]; then
    mkdir -p "$DUST_BACKUP_DIR"
    DUST_TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
    DUST_BACKUP="$DUST_BACKUP_DIR/duststreamer.$DUST_TIMESTAMP"

    if [ -e "$DUST_TARGET" ] || [ -L "$DUST_TARGET" ]; then
        if [ -d "$DUST_TARGET" ]; then
            DUST_BACKUP="$DUST_BACKUP_DIR/duststreamer-directory.$DUST_TIMESTAMP"
            mv "$DUST_TARGET" "$DUST_BACKUP"
            echo "Directorio anterior conservado en: $DUST_BACKUP"
        elif [ -f "$DUST_TARGET" ]; then
            cp -p "$DUST_TARGET" "$DUST_BACKUP"
            echo "Backup Duststreamer: $DUST_BACKUP"
        else
            echo "ERROR: destino Duststreamer es un tipo de archivo no compatible"
            exit 1
        fi
    fi
fi

echo "===== INSTALACION ====="

if [ "$BINARY_NEEDS_UPDATE" -eq 1 ]; then
    chmod 755 "$TMP"
    mv "$TMP" "$TARGET"
fi

if [ "$DUST_NEEDS_UPDATE" -eq 1 ]; then
    mv "$DUST_TMP" "$DUST_TARGET"
    chmod 755 "$DUST_TARGET"
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

if [ "$DUST_NEEDS_UPDATE" -eq 1 ]; then
    FINAL_DUST_SHA="$(sha256sum "$DUST_TARGET" | awk '{print $1}')"
    echo "Duststreamer SHA256 final: $FINAL_DUST_SHA"

    if [ "$FINAL_DUST_SHA" != "$DUST_SHA256" ]; then
        echo "ERROR: DUSTSTREAMER NO SUPERÓ LA VERIFICACIÓN FINAL"
        rm -f "$DUST_TARGET"

        if [ -n "${DUST_BACKUP:-}" ] && [ -e "$DUST_BACKUP" ]; then
            mv "$DUST_BACKUP" "$DUST_TARGET"
            echo "Se ha restaurado el destino anterior."
        fi

        rm -f "$TMP" "$DUST_TMP" "$VOICE_TMP"
        rm -rf "$VOICE_EXTRACT"
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
rm -f "$DUST_TMP"
rm -f "$VOICE_TMP"
rm -rf "$VOICE_EXTRACT"

# Guardar la versión únicamente después de completar
# correctamente todas las verificaciones de la OTA.
printf '%s\\n' "$VERSION" > "$BASE/installed-version"

echo
echo "===== OTA CORRECTO ====="
echo "Versión: $VERSION"

if [ "$BINARY_NEEDS_UPDATE" -eq 1 ]; then
    echo "SHA256: $FINAL_SHA256"
fi

if [ "$VOICE_NEEDS_UPDATE" -eq 1 ]; then
    echo "Voces X40-Control: 15"
fi

if [ "$DUST_NEEDS_UPDATE" -eq 1 ]; then
    echo "Duststreamer SHA256: $FINAL_DUST_SHA"
fi

echo
echo "Reinicio necesario para activar el binario."
