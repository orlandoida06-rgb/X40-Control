#!/bin/sh
set -eu

BASE="/data/ota"
TARGET="/data/valetudo"
TMP="$BASE/valetudo.new"
TARGET_TMP="/data/valetudo.new"
MANIFEST="$BASE/manifest.json"
BACKUP_DIR="$BASE/backups"

VOICE_DIR="/data/personalized_voice/X40-Control"
VOICE_TMP="$BASE/X40-Control-voices.tar.gz.new"
VOICE_EXTRACT="$BASE/X40-Control-voices.extract"
VOICE_LIST="$BASE/X40-Control-voices.list"
VOICE_MARKER="$BASE/voices-version"
VERSION_MARKER="$BASE/installed-version"

MANIFEST_URL="https://raw.githubusercontent.com/orlandoida06-rgb/X40-Control/main/ota/manifest.json"

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

BINARY_INSTALL_STARTED=0
VOICES_INSTALL_STARTED=0
SUCCESS=0
BACKUP=""
HAD_VERSION_MARKER=0
HAD_VOICE_MARKER=0

rollback() {
    set +e
    echo "===== INTENTO DE RESTAURACION ====="

    if [ "$BINARY_INSTALL_STARTED" -eq 1 ] &&
       [ -n "$BACKUP" ] &&
       [ -f "$BACKUP/valetudo" ]; then
        RESTORE_TMP="/data/valetudo.restore.$$"
        rm -f "$RESTORE_TMP"

        if cp -p "$BACKUP/valetudo" "$RESTORE_TMP" &&
           chmod 755 "$RESTORE_TMP" &&
           cmp -s "$BACKUP/valetudo" "$RESTORE_TMP" &&
           mv -f "$RESTORE_TMP" "$TARGET"; then
            echo "Binario anterior restaurado y verificado."
        else
            rm -f "$RESTORE_TMP"
            echo "ERROR: no se pudo restaurar el binario anterior." >&2
        fi
    fi

    if [ "$VOICES_INSTALL_STARTED" -eq 1 ] &&
       [ -n "$BACKUP" ]; then
        mkdir -p "$VOICE_DIR"

        for voice in $EXPECTED_VOICES; do
            if [ -f "$BACKUP/voices/$voice" ]; then
                cp -p "$BACKUP/voices/$voice" "$VOICE_DIR/$voice"
            else
                rm -f "$VOICE_DIR/$voice"
            fi
        done

        echo "Restauracion de voces solicitada."
    fi

    if [ -n "$BACKUP" ]; then
        if [ -f "$BACKUP/installed-version" ]; then
            cp -p "$BACKUP/installed-version" "$VERSION_MARKER"
        else
            rm -f "$VERSION_MARKER"
        fi

        if [ -f "$BACKUP/voices-version" ]; then
            cp -p "$BACKUP/voices-version" "$VOICE_MARKER"
        else
            rm -f "$VOICE_MARKER"
        fi
    fi

    rm -f "$TMP" "$TARGET_TMP" "$VOICE_TMP" "$VOICE_LIST"
    rm -rf "$VOICE_EXTRACT"
    echo "ATENCION: comprueba los archivos si hubo un error durante el rollback."
}

on_exit() {
    rc=$?
    trap - 0

    if [ "$rc" -ne 0 ] && [ "$SUCCESS" -ne 1 ]; then
        echo "ERROR: OTA interrumpida."
        if [ "$BINARY_INSTALL_STARTED" -eq 1 ] ||
           [ "$VOICES_INSTALL_STARTED" -eq 1 ]; then
            rollback
        fi
    fi

    exit "$rc"
}
trap 'on_exit $?' 0

field() {
    sed -n \
        "s/^[[:space:]]*\"$1\"[[:space:]]*:[[:space:]]*\"\([^\"]*\)\".*/\1/p" \
        "$MANIFEST" | head -n 1
}

number_field() {
    sed -n \
        "s/^[[:space:]]*\"$1\"[[:space:]]*:[[:space:]]*\([0-9][0-9]*\).*/\1/p" \
        "$MANIFEST" | head -n 1
}

valid_hash() {
    case "$1" in
        *[!0123456789abcdefABCDEF]*|'') return 1 ;;
    esac
    [ "${#1}" -eq 64 ]
}

valid_number() {
    case "$1" in
        *[!0123456789]*|'') return 1 ;;
    esac
    return 0
}

download() {
    url="$1"
    destination="$2"

    if command -v curl >/dev/null 2>&1; then
        curl -fL --retry 3 --connect-timeout 10 \
            -o "$destination" "$url"
    else
        wget -O "$destination" "$url"
    fi
}

file_size() {
    wc -c < "$1" | tr -d '[:space:]'
}

echo "===== X40CONTROL OTA ====="
mkdir -p "$BASE" "$BACKUP_DIR"

echo "===== DESCARGA DEL MANIFIESTO ====="
rm -f "$MANIFEST"
download "$MANIFEST_URL" "$MANIFEST"

VERSION="$(field version)"
URL="$(field url)"
EXPECTED_SHA256="$(field sha256)"
EXPECTED_SIZE="$(number_field size)"
VOICE_URL="$(field voices_url)"
VOICE_SHA256="$(field voices_sha256)"
VOICE_SIZE="$(number_field voices_size)"

[ -n "$VERSION" ] || {
    echo "ERROR: falta version en el manifiesto."
    exit 1
}

[ -n "$URL" ] || {
    echo "ERROR: falta URL del binario."
    exit 1
}

valid_hash "$EXPECTED_SHA256" || {
    echo "ERROR: SHA256 del binario invalido."
    exit 1
}

valid_number "$EXPECTED_SIZE" || {
    echo "ERROR: tamano del binario invalido."
    exit 1
}

case "$URL" in
    https://github.com/*) ;;
    *)
        echo "ERROR: URL del binario no permitida."
        exit 1
        ;;
esac

if [ -n "$VOICE_URL" ] || [ -n "$VOICE_SHA256" ] ||
   [ -n "$VOICE_SIZE" ]; then
    [ -n "$VOICE_URL" ] && [ -n "$VOICE_SHA256" ] &&
        [ -n "$VOICE_SIZE" ] || {
            echo "ERROR: campos de voces incompletos."
            exit 1
        }

    valid_hash "$VOICE_SHA256" || {
        echo "ERROR: SHA256 de voces invalido."
        exit 1
    }

    valid_number "$VOICE_SIZE" || {
        echo "ERROR: tamano del paquete de voces invalido."
        exit 1
    }

    case "$VOICE_URL" in
        https://github.com/*) ;;
        *)
            echo "ERROR: URL de voces no permitida."
            exit 1
            ;;
    esac
fi

[ -f "$TARGET" ] || {
    echo "ERROR: no existe $TARGET."
    exit 1
}

CURRENT_SHA256="$(sha256sum "$TARGET" | awk '{print $1}')"
BINARY_NEEDS_UPDATE=1

if [ "$CURRENT_SHA256" = "$EXPECTED_SHA256" ]; then
    BINARY_NEEDS_UPDATE=0
    echo "Binario: ya coincide con el manifiesto."
else
    echo "Binario: requiere actualizacion."
fi

VOICE_NEEDS_UPDATE=0

if [ -n "$VOICE_URL" ]; then
    VOICE_NEEDS_UPDATE=1

    if [ -f "$VOICE_MARKER" ] &&
       [ "$(cat "$VOICE_MARKER")" = "$VERSION" ]; then
        all_present=1
        for voice in $EXPECTED_VOICES; do
            [ -f "$VOICE_DIR/$voice" ] || all_present=0
        done

        if [ "$all_present" -eq 1 ]; then
            VOICE_NEEDS_UPDATE=0
            echo "Voces: version ya instalada."
        fi
    fi
fi

if [ "$BINARY_NEEDS_UPDATE" -eq 0 ] &&
   [ "$VOICE_NEEDS_UPDATE" -eq 0 ]; then
    echo "No hay cambios pendientes."
    exit 0
fi

# Descargar y verificar TODO antes de cambiar archivos instalados.
if [ "$BINARY_NEEDS_UPDATE" -eq 1 ]; then
    echo "===== DESCARGA DEL BINARIO ====="
    rm -f "$TMP"
    download "$URL" "$TMP"

    DOWNLOADED_SHA256="$(sha256sum "$TMP" | awk '{print $1}')"
    DOWNLOADED_SIZE="$(file_size "$TMP")"

    [ "$DOWNLOADED_SHA256" = "$EXPECTED_SHA256" ] || {
        echo "ERROR: SHA256 del binario incorrecto."
        exit 1
    }

    [ "$DOWNLOADED_SIZE" = "$EXPECTED_SIZE" ] || {
        echo "ERROR: tamano del binario incorrecto."
        exit 1
    }
fi

if [ "$VOICE_NEEDS_UPDATE" -eq 1 ]; then
    echo "===== DESCARGA DEL PAQUETE DE VOCES ====="
    rm -f "$VOICE_TMP" "$VOICE_LIST"
    rm -rf "$VOICE_EXTRACT"
    download "$VOICE_URL" "$VOICE_TMP"

    DOWNLOADED_VOICE_SHA256="$(
        sha256sum "$VOICE_TMP" | awk '{print $1}'
    )"
    DOWNLOADED_VOICE_SIZE="$(file_size "$VOICE_TMP")"

    [ "$DOWNLOADED_VOICE_SHA256" = "$VOICE_SHA256" ] || {
        echo "ERROR: SHA256 del paquete de voces incorrecto."
        exit 1
    }

    [ "$DOWNLOADED_VOICE_SIZE" = "$VOICE_SIZE" ] || {
        echo "ERROR: tamano del paquete de voces incorrecto."
        exit 1
    }

    tar -tzf "$VOICE_TMP" > "$VOICE_LIST"

    [ "$(wc -l < "$VOICE_LIST" | tr -d '[:space:]')" = "15" ] || {
        echo "ERROR: el paquete no contiene exactamente 15 entradas."
        exit 1
    }

    for voice in $EXPECTED_VOICES; do
        grep -Fx "$voice" "$VOICE_LIST" >/dev/null || {
            echo "ERROR: falta $voice en el paquete."
            exit 1
        }
    done

    # Las 15 entradas ya están limitadas a nombres esperados sin rutas.
    mkdir -p "$VOICE_EXTRACT"
    tar -xzf "$VOICE_TMP" -C "$VOICE_EXTRACT"

    for voice in $EXPECTED_VOICES; do
        [ -f "$VOICE_EXTRACT/$voice" ] || {
            echo "ERROR: no se extrajo $voice."
            exit 1
        }
    done
fi

# Crear respaldo antes de la primera modificación.
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$BACKUP_DIR/$TIMESTAMP"
mkdir -p "$BACKUP/voices"

if [ "$BINARY_NEEDS_UPDATE" -eq 1 ]; then
    cp -p "$TARGET" "$BACKUP/valetudo"
fi

if [ -f "$VERSION_MARKER" ]; then
    cp -p "$VERSION_MARKER" "$BACKUP/installed-version"
    HAD_VERSION_MARKER=1
fi

if [ -f "$VOICE_MARKER" ]; then
    cp -p "$VOICE_MARKER" "$BACKUP/voices-version"
    HAD_VOICE_MARKER=1
fi

if [ "$VOICE_NEEDS_UPDATE" -eq 1 ]; then
    for voice in $EXPECTED_VOICES; do
        if [ -f "$VOICE_DIR/$voice" ]; then
            cp -p "$VOICE_DIR/$voice" "$BACKUP/voices/$voice"
        fi
    done
fi

# Instalar las voces primero. Si algo falla, el trap intenta restaurarlas.
if [ "$VOICE_NEEDS_UPDATE" -eq 1 ]; then
    VOICES_INSTALL_STARTED=1
    mkdir -p "$VOICE_DIR"

    for voice in $EXPECTED_VOICES; do
        install -m 644 "$VOICE_EXTRACT/$voice" "$VOICE_DIR/$voice"
    done

    for voice in $EXPECTED_VOICES; do
        [ -f "$VOICE_DIR/$voice" ] || {
            echo "ERROR: no se instalo $voice."
            exit 1
        }
    done
fi

# Sustituir el binario al final mediante un archivo temporal en /data.
if [ "$BINARY_NEEDS_UPDATE" -eq 1 ]; then
    cp "$TMP" "$TARGET_TMP"
    chmod 755 "$TARGET_TMP"

    BINARY_INSTALL_STARTED=1
    mv -f "$TARGET_TMP" "$TARGET"

    FINAL_SHA256="$(sha256sum "$TARGET" | awk '{print $1}')"
    [ "$FINAL_SHA256" = "$EXPECTED_SHA256" ] || {
        echo "ERROR: verificacion final del binario fallida."
        exit 1
    }
fi

# Marcas de version solo después de verificar los archivos.
if [ "$VOICE_NEEDS_UPDATE" -eq 1 ]; then
    printf '%s\n' "$VERSION" > "$VOICE_MARKER"
fi

printf '%s\n' "$VERSION" > "$VERSION_MARKER"

rm -f "$TMP" "$TARGET_TMP" "$VOICE_TMP" "$VOICE_LIST"
rm -rf "$VOICE_EXTRACT"

SUCCESS=1

echo "===== OTA COMPLETADA ====="
echo "Version: $VERSION"
echo "Reinicio necesario para activar el binario."
echo "El robot NO se reinicia automaticamente."
echo "Respaldo: $BACKUP"
