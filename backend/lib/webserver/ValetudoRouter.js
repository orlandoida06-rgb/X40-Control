const express = require("express");
const fs = require("fs");
const nestedProperty = require("nested-property");
const path = require("path");
const RateLimit = require("express-rate-limit");
const {execFile} = require("child_process");

const Logger = require("../Logger");
const Tools = require("../utils/Tools");
const {getVoicePath, isX40ControlVoice, getRoomVoicePath} = require("../voice/X40ControlVoicePack");
const {SSEHub, SSEMiddleware} = require("./middlewares/sse");

class ValetudoRouter {
    /**
     *
     * @param {object} options
     * @param {import("../Configuration")} options.config
     * @param {import("../core/ValetudoRobot")} options.robot
     * @param {*} options.validator
     */
    constructor(options) {
        this.router = express.Router({mergeParams: true});

        this.config = options.config;
        this.robot = options.robot;
        this.validator = options.validator;
        this.x40ControlOTAUpdateRunning = false;

        // ============================================================
        // X40-Control OTA bootstrap
        //
        // update.sh se empaqueta dentro del binario mediante pkg.
        // Si /data/ota/update.sh desaparece tras un reset/reinicio,
        // se restaura automáticamente antes de utilizar la OTA.
        // ============================================================
        this.ensureX40ControlOTAInstaller();

        this.limiter = RateLimit.rateLimit({
            windowMs: 30*1000,
            max: 30,
            keyGenerator: () => "global"
        });

        this.initRoutes();
        this.initSSE();
    }


    ensureX40ControlOTAInstaller() {
        const otaDir = "/data/ota";
        const target = path.join(otaDir, "update.sh");
        const packagedInstaller = path.resolve(
            __dirname,
            "../../../ota/update.sh"
        );

        try {
            fs.mkdirSync(otaDir, {recursive: true});

            if (fs.existsSync(target)) {
                fs.chmodSync(target, 0o755);
                return;
            }

            if (!fs.existsSync(packagedInstaller)) {
                Logger.warn(
                    "X40ControlOTA: no se encontró el update.sh empaquetado",
                    {packagedInstaller: packagedInstaller}
                );
                return;
            }

            fs.copyFileSync(packagedInstaller, target);
            fs.chmodSync(target, 0o755);

            Logger.info(
                "X40ControlOTA: update.sh restaurado automáticamente",
                {target: target}
            );
        } catch (err) {
            Logger.warn(
                "X40ControlOTA: no se pudo restaurar update.sh",
                {message: err.message}
            );
        }
    }

    initRoutes() {
        this.router.get("/", (req, res) => {
            res.json({
                embedded: this.config.get("embedded"),
                systemId: Tools.GET_HUMAN_READABLE_SYSTEM_ID(),
                welcomeDialogDismissed: this.config.get("oobe").welcomeDialogDismissed
            });
        });

        this.router.put("/action", this.validator, (req, res) => {
            try {
                switch (req.body.action) {
                    case "dismissWelcomeDialog": {
                        const currentConf = this.config.get("oobe");

                        if (currentConf.welcomeDialogDismissed !== true) {
                            this.config.set("oobe", {...currentConf, welcomeDialogDismissed: true});
                        }
                        break;
                    }
                    case "restoreDefaultConfiguration": {
                        if (this.config.get("embedded") === true) {
                            this.config.reset();
                        } else {
                            // noinspection ExceptionCaughtLocallyJS
                            throw new Error("Refusing to restore config to defaults as we're not embedded.");
                        }

                        break;
                    }
                    default:
                        // noinspection ExceptionCaughtLocallyJS
                        throw new Error("Invalid action");
                }

                res.sendStatus(200);
            } catch (err) {
                Logger.warn(`${this.constructor.name}: Error while handling route "${req.path}"`, {
                    body: req.body,
                    message: err.message
                });

                res.status(500).json(err.message);
            }
        });

        // ============================================================
        // ============================================================
        // X40-Control: estado de Tailscale (solo lectura)
        // ============================================================
        this.router.get("/x40-control/tailscale", (req, res) => {
            execFile(
                "/bin/sh",
                ["-c", "for f in /data/tailscale/*/tailscale; do [ -x \"$f\" ] && { printf \"%s\\n\" \"$f\"; exit 0; }; done; command -v tailscale"],
                {timeout: 3000},
                (findError, findStdout) => {
                    const tailscalePath = (findStdout || "").trim();

                    if (findError || !tailscalePath) {
                        return res.json({
                            installed: false,
                            running: false,
                            authenticated: false,
                            version: null,
                            backendState: "No instalado",
                            ips: [],
                            hostname: null,
                            dnsName: null,
                            serveUrl: null,
                            authUrl: null,
                            health: []
                        });
                    }

                    execFile(
                        tailscalePath,
                        ["--socket=/data/tailscale/tailscaled.sock", "version"],
                        {timeout: 3000, maxBuffer: 64 * 1024},
                        (versionError, versionStdout) => {
                            const version = !versionError && versionStdout ?
                                versionStdout.trim().split(/\r?\n/)[0] : null;

                            execFile(
                                tailscalePath,
                                ["--socket=/data/tailscale/tailscaled.sock", "status", "--json"],
                                {timeout: 5000, maxBuffer: 512 * 1024},
                                (statusError, statusStdout, statusStderr) => {
                                    if (statusError) {
                                        const detail = (statusStderr || statusError.message || "").trim();

                                        Logger.warn(
                                            "X40ControlTailscale: el demonio no respondió al consultar el estado",
                                            {
                                                message: statusError.message,
                                                stderr: detail
                                            }
                                        );

                                        return res.json({
                                            installed: true,
                                            running: false,
                                            authenticated: false,
                                            version: version,
                                            backendState: "No disponible",
                                            ips: [],
                                            hostname: null,
                                            dnsName: null,
                                            serveUrl: null,
                                            authUrl: null,
                                            health: [
                                                "No se pudo consultar el estado de Tailscale.",
                                                detail
                                            ].filter(Boolean)
                                        });
                                    }

                                    let status;

                                    try {
                                        status = JSON.parse(statusStdout || "");
                                    } catch (err) {
                                        Logger.warn(
                                            "X40ControlTailscale: no se pudo leer el estado",
                                            {
                                                message: err.message,
                                                commandError: statusError ? statusError.message : null,
                                                stderr: statusStderr || ""
                                            }
                                        );

                                        return res.json({
                                            installed: true,
                                            running: false,
                                            authenticated: false,
                                            version: version,
                                            backendState: "No disponible",
                                            ips: [],
                                            hostname: null,
                                            dnsName: null,
                                            serveUrl: null,
                                            authUrl: null,
                                            health: [
                                                "No se pudo consultar el estado de Tailscale."
                                            ]
                                        });
                                    }

                                    const self = status.Self || {};
                                    const backendState =
                                        status.BackendState || "Desconocido";
                                    const running = backendState === "Running";

                                    execFile(
                                        tailscalePath,
                                        [
                                            "--socket=/data/tailscale/tailscaled.sock",
                                            "serve",
                                            "status"
                                        ],
                                        {timeout: 5000, maxBuffer: 64 * 1024},
                                        (serveError, serveStdout) => {
                                            const serveOutput = !serveError ?
                                                (serveStdout || "").trim() : "";
                                            const serveMatch = serveOutput.match(
                                                /https:\/\/[^\s(]+/
                                            );
                                            const servesValetudo =
                                                /proxy\s+http:\/\/127\.0\.0\.1:80/i
                                                    .test(serveOutput);
                                            const serveUrl =
                                                serveMatch && servesValetudo ?
                                                    serveMatch[0].replace(/\/$/, "") :
                                                    null;

                                            return res.json({
                                                installed: true,
                                                running: running,
                                                authenticated: running && Boolean(self.ID),
                                                version: version,
                                                backendState: backendState,
                                                ips: Array.isArray(status.TailscaleIPs) ?
                                                    status.TailscaleIPs : [],
                                                hostname: self.HostName || null,
                                                dnsName: self.DNSName || null,
                                                serveUrl: serveUrl,
                                                authUrl: status.AuthURL || null,
                                                health: Array.isArray(status.Health) ?
                                                    status.Health : []
                                            });
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        });

        // X40-Control: acciones de Tailscale
        this.router.post("/x40-control/tailscale/action", (req, res) => {
            const action = req.body?.action;

            if (!["install", "up", "down", "serve", "uninstall"].includes(action)) {
                return res.status(400).json({
                    error: "Acción no válida. Usa install, up o down."
                });
            }

            const lookupCommand =
                'if [ -x /data/tailscale/current/tailscale ]; then printf "%s\\n" /data/tailscale/current/tailscale; exit 0; fi; for f in /data/tailscale/*/tailscale; do [ -x "$f" ] && { printf "%s\\n" "$f"; exit 0; }; done; command -v tailscale';

            execFile(
                "/bin/sh",
                ["-c", lookupCommand],
                {timeout: 3000},
                (findError, findStdout) => {
                    const tailscalePath = (findStdout || "").trim();

                    if (action === "install") {
                        if (tailscalePath && !findError) {
                            const startupScript = [
                                "set -eu",
                                "CLI=\"$1\"",
                                "POSTBOOT=/data/_root_postboot.sh",
                                "MARKER=\"# X40-Control Tailscale managed startup\"",
                                "BIN_DIR=\"${CLI%/*}\"",
                                "if [ \"$BIN_DIR\" != /data/tailscale/current ] && [ \"$BIN_DIR\" != /usr/bin ] && [ \"$BIN_DIR\" != /bin ]; then ln -sfn \"$BIN_DIR\" /data/tailscale/current; fi",
                                "if [ -f \"$POSTBOOT\" ]; then",
                                "  if ! grep -Fq \"$MARKER\" \"$POSTBOOT\"; then",
                                "    BACKUP=\"${POSTBOOT}.before-tailscale-$(date +%Y%m%d-%H%M%S)\"",
                                "    cp -p \"$POSTBOOT\" \"$BACKUP\"",
                                "    printf \"\\n\" >> \"$POSTBOOT\"",
                                "    cat >> \"$POSTBOOT\" <<\u0027TAILSCALE_POSTBOOT\u0027",
                                "# X40-Control Tailscale managed startup",
                                "if [ -x /data/tailscale/current/tailscaled ]; then",
                                "    mkdir -p /data/tailscale/state",
                                "    if ! pgrep -f 'tailscaled.*--state=/data/tailscale/state/tailscaled.state' >/dev/null 2>&1; then",
                                "        /data/tailscale/current/tailscaled --state=/data/tailscale/state/tailscaled.state --statedir=/data/tailscale/state --socket=/data/tailscale/tailscaled.sock > /data/tailscale/tailscaled.log 2>&1 &",
                                "    fi",
                                "fi",
                                "TAILSCALE_POSTBOOT",
                                "  fi",
                                "else",
                                "  cat > \"$POSTBOOT\" <<\u0027TAILSCALE_POSTBOOT\u0027",
                                "# X40-Control Tailscale managed startup",
                                "if [ -x /data/tailscale/current/tailscaled ]; then",
                                "    mkdir -p /data/tailscale/state",
                                "    if ! pgrep -f 'tailscaled.*--state=/data/tailscale/state/tailscaled.state' >/dev/null 2>&1; then",
                                "        /data/tailscale/current/tailscaled --state=/data/tailscale/state/tailscaled.state --statedir=/data/tailscale/state --socket=/data/tailscale/tailscaled.sock > /data/tailscale/tailscaled.log 2>&1 &",
                                "    fi",
                                "fi",
                                "TAILSCALE_POSTBOOT",
                                "fi",
                                "SERVE_MARKER=\"# X40-Control Tailscale Serve HTTPS startup\"",
                                "if [ -f \"$POSTBOOT\" ] && ! grep -Fq \"$SERVE_MARKER\" \"$POSTBOOT\"; then",
                                "  SERVE_BACKUP=\"${POSTBOOT}.before-serve-$(date +%Y%m%d-%H%M%S)\"",
                                "  cp -p \"$POSTBOOT\" \"$SERVE_BACKUP\"",
                                "  cat >> \"$POSTBOOT\" <<'TAILSCALE_SERVE_POSTBOOT'",
                                "# X40-Control Tailscale Serve HTTPS startup",
                                "if [ -x /data/tailscale/current/tailscale ]; then",
                                "    i=0",
                                "    while [ \"$i\" -lt 20 ]; do",
                                "        if /data/tailscale/current/tailscale --socket=/data/tailscale/tailscaled.sock status >/dev/null 2>&1; then break; fi",
                                "        sleep 1",
                                "        i=$((i + 1))",
                                "    done",
                                "    if /data/tailscale/current/tailscale --socket=/data/tailscale/tailscaled.sock status >/dev/null 2>&1; then",
                                "        /data/tailscale/current/tailscale --socket=/data/tailscale/tailscaled.sock serve --bg --yes 80 >> /data/tailscale/tailscaled.log 2>&1 || true",
                                "    fi",
                                "fi",
                                "TAILSCALE_SERVE_POSTBOOT",
                                "fi",
                                "chmod 755 \"$POSTBOOT\"",
                                "mkdir -p /data/tailscale/state",
                                "if ! pgrep -f 'tailscaled.*--state=/data/tailscale/state/tailscaled.state' >/dev/null 2>&1; then",
                                "  /data/tailscale/current/tailscaled --state=/data/tailscale/state/tailscaled.state --statedir=/data/tailscale/state --socket=/data/tailscale/tailscaled.sock > /data/tailscale/tailscaled.log 2>&1 &",
                                "fi",
                                "i=0",
                                "while [ \"$i\" -lt 10 ]; do",
                                "  [ -S /data/tailscale/tailscaled.sock ] && break",
                                "  sleep 1",
                                "  i=$((i + 1))",
                                "done",
                                "if [ ! -S /data/tailscale/tailscaled.sock ]; then echo \"Binarios presentes, pero tailscaled no creó el socket.\" >&2; tail -40 /data/tailscale/tailscaled.log >&2 2>/dev/null || true; exit 1; fi",
                                "/data/tailscale/current/tailscale --socket=/data/tailscale/tailscaled.sock status >/dev/null 2>&1 || { echo \"tailscaled no responde a status.\" >&2; tail -40 /data/tailscale/tailscaled.log >&2 2>/dev/null || true; exit 1; }",
                                "/data/tailscale/current/tailscale --socket=/data/tailscale/tailscaled.sock serve --bg --yes 80 >> /data/tailscale/tailscaled.log 2>&1 || true",
                                "echo \"Servicio iniciado. HTTPS se intenta activar si el robot ya está autorizado.\""
                            ].join("\n");

                            execFile(
                                "/bin/sh",
                                ["-c", startupScript, "tailscale-startup", tailscalePath],
                                {timeout: 10000, maxBuffer: 64 * 1024},
                                (startupError, startupStdout, startupStderr) => {
                                    if (startupError) {
                                        return res.status(500).json({
                                            error: (startupStderr || "").trim() || startupError.message
                                        });
                                    }
                                    return res.json({
                                        message: "Tailscale ya estaba instalado. " + (startupStdout || "").trim(),
                                        installed: true
                                    });
                                }
                            );
                            return;
                        }

                        const installScript = String.raw`
set -eu
BASE="https://pkgs.tailscale.com/stable"
WORK="/data/tailscale/.install.$$"
ARCHIVE=""
STAGE="$WORK/extract"
trap 'rm -rf "$WORK"' 0
trap 'exit 1' HUP INT TERM

ARCH="$(uname -m)"
case "$ARCH" in
    aarch64|arm64) ;;
    *) echo "Arquitectura no compatible: $ARCH" >&2; exit 1 ;;
esac

for tool in wget tar sha256sum awk grep sed find head cp chmod ln date pgrep mv cat mkdir rm; do
    command -v "$tool" >/dev/null 2>&1 || {
        echo "Falta la herramienta necesaria: $tool" >&2
        exit 1
    }
done

mkdir -p /data/tailscale
mkdir -p "$STAGE"

wget -q -O "$WORK/index.html" "$BASE/" || {
    echo "No se pudo consultar el catálogo oficial de Tailscale." >&2
    exit 1
}

ARCHIVE="$(grep -Eo 'tailscale_[0-9]+\.[0-9]+\.[0-9]+_arm64\.tgz' "$WORK/index.html" | head -n 1)"
[ -n "$ARCHIVE" ] || {
    echo "No se encontró un paquete estable ARM64 en el catálogo oficial." >&2
    exit 1
}

VERSION="$(printf '%s' "$ARCHIVE" | sed 's/^tailscale_//; s/_arm64\.tgz$//')"
TARGET="/data/tailscale/tailscale_"$VERSION"_arm64"

[ ! -e "$TARGET" ] || {
    echo "Ya existe el directorio de destino $TARGET; no se sobrescribirá." >&2
    exit 1
}

wget -q -O "$WORK/$ARCHIVE" "$BASE/$ARCHIVE" || {
    echo "No se pudo descargar el paquete oficial." >&2
    exit 1
}
wget -q -O "$WORK/checksum" "$BASE/$ARCHIVE.sha256" || {
    echo "No se pudo descargar la suma SHA-256 oficial." >&2
    exit 1
}

EXPECTED="$(awk 'NR==1 {print $1}' "$WORK/checksum")"
ACTUAL="$(sha256sum "$WORK/$ARCHIVE" | awk '{print $1}')"
[ -n "$EXPECTED" ] && [ "$EXPECTED" = "$ACTUAL" ] || {
    echo "La validación SHA-256 ha fallado; se cancela la instalación." >&2
    exit 1
}

tar -xzf "$WORK/$ARCHIVE" -C "$STAGE" || {
    echo "No se pudo extraer el paquete." >&2
    exit 1
}

CLI="$(find "$STAGE" -type f -name tailscale | head -n 1)"
[ -n "$CLI" ] || {
    echo "El paquete no contiene el ejecutable tailscale." >&2
    exit 1
}
DIR="$(printf '%s\n' "$CLI" | sed 's#/[^/]*$##')"
DAEMON="$DIR/tailscaled"
[ -f "$DAEMON" ] || {
    echo "El paquete no contiene tailscaled junto a tailscale." >&2
    exit 1
}

mkdir "$TARGET"
cp "$CLI" "$TARGET/tailscale"
cp "$DAEMON" "$TARGET/tailscaled"
chmod 755 "$TARGET/tailscale" "$TARGET/tailscaled"

"$TARGET/tailscale" version >/dev/null 2>&1 || {
    rm -rf "$TARGET"
    echo "El ejecutable instalado no ha superado la comprobación inicial." >&2
    exit 1
}

POSTBOOT="/data/_root_postboot.sh"
MARKER="# X40-Control Tailscale managed startup"
POSTBOOT_TMP="$WORK/root_postboot.new"

if [ -L "$POSTBOOT" ]; then
    echo "$POSTBOOT es un enlace simbólico; se cancela por seguridad." >&2
    exit 1
fi

if [ -f "$POSTBOOT" ]; then
    cp -p "$POSTBOOT" "$POSTBOOT_TMP" || {
        echo "No se pudo preparar una copia de $POSTBOOT." >&2
        exit 1
    }
else
    : > "$POSTBOOT_TMP"
fi

if ! grep -Fq "$MARKER" "$POSTBOOT_TMP"; then
    cat >> "$POSTBOOT_TMP" <<'TAILSCALE_POSTBOOT'

# X40-Control Tailscale managed startup
if [ -x /data/tailscale/current/tailscaled ]; then
    mkdir -p /data/tailscale/state
    if ! pgrep -f 'tailscaled.*--state=/data/tailscale/state/tailscaled.state' >/dev/null 2>&1; then
        /data/tailscale/current/tailscaled \
            --state=/data/tailscale/state/tailscaled.state \
            --statedir=/data/tailscale/state \
            --socket=/data/tailscale/tailscaled.sock \
            > /data/tailscale/tailscaled.log 2>&1 &
    fi
fi
TAILSCALE_POSTBOOT
fi

SERVE_MARKER="# X40-Control Tailscale Serve HTTPS startup"
if ! grep -Fq "$SERVE_MARKER" "$POSTBOOT_TMP"; then
    cat >> "$POSTBOOT_TMP" <<'TAILSCALE_SERVE_POSTBOOT'

# X40-Control Tailscale Serve HTTPS startup
if [ -x /data/tailscale/current/tailscale ]; then
    i=0
    while [ "$i" -lt 20 ]; do
        if /data/tailscale/current/tailscale --socket=/data/tailscale/tailscaled.sock status >/dev/null 2>&1; then break; fi
        sleep 1
        i=$((i + 1))
    done
    if /data/tailscale/current/tailscale --socket=/data/tailscale/tailscaled.sock status >/dev/null 2>&1; then
        /data/tailscale/current/tailscale --socket=/data/tailscale/tailscaled.sock serve --bg --yes 80 >> /data/tailscale/tailscaled.log 2>&1 || true
    fi
fi
TAILSCALE_SERVE_POSTBOOT
fi

sh -n "$POSTBOOT_TMP" || {
    echo "El script de arranque temporal no supera sh -n." >&2
    exit 1
}

if [ -f "$POSTBOOT" ] && { ! grep -Fq "$MARKER" "$POSTBOOT" || ! grep -Fq "$SERVE_MARKER" "$POSTBOOT"; }; then
    BACKUP="$POSTBOOT.before-tailscale-$(date +%Y%m%d-%H%M%S)"
    cp -p "$POSTBOOT" "$BACKUP" || {
        echo "No se pudo respaldar $POSTBOOT." >&2
        exit 1
    }
    echo "Copia de seguridad: $BACKUP"
fi

chmod 755 "$POSTBOOT_TMP" || exit 1
mv "$POSTBOOT_TMP" "$POSTBOOT" || {
    echo "No se pudo instalar el script de arranque preparado." >&2
    exit 1
}

ln -sfn "$TARGET" /data/tailscale/current || {
    echo "No se pudo crear el enlace current." >&2
    exit 1
}

mkdir -p /data/tailscale/state || {
    echo "No se pudo crear el directorio de estado." >&2
    exit 1
}

if ! pgrep -f 'tailscaled.*--state=/data/tailscale/state/tailscaled.state' >/dev/null 2>&1; then
    /data/tailscale/current/tailscaled \
        --state=/data/tailscale/state/tailscaled.state \
        --statedir=/data/tailscale/state \
        --socket=/data/tailscale/tailscaled.sock \
        > /data/tailscale/tailscaled.log 2>&1 &
fi

SOCKET_OK=0
i=0
while [ "$i" -lt 10 ]; do
    if [ -S /data/tailscale/tailscaled.sock ]; then
        SOCKET_OK=1
        break
    fi
    sleep 1
    i=$((i + 1))
done

if [ "$SOCKET_OK" -ne 1 ]; then
    echo "Los binarios se instalaron, pero tailscaled no creó el socket." >&2
    tail -40 /data/tailscale/tailscaled.log >&2 2>/dev/null || true
    exit 1
fi

if ! /data/tailscale/current/tailscale \
    --socket=/data/tailscale/tailscaled.sock status >/dev/null 2>&1; then
    echo "tailscaled creó el socket, pero no respondió a status." >&2
    tail -40 /data/tailscale/tailscaled.log >&2 2>/dev/null || true
    exit 1
fi

echo "Tailscale $VERSION instalado en $TARGET."
echo "Servicio iniciado y socket verificado."
/data/tailscale/current/tailscale --socket=/data/tailscale/tailscaled.sock serve --bg --yes 80 >> /data/tailscale/tailscaled.log 2>&1 || true
echo "Instalación terminada. HTTPS se activa cuando Tailscale está autorizado."
`;

                        execFile(
                            "/bin/sh",
                            ["-c", installScript],
                            {timeout: 180000, maxBuffer: 128 * 1024},
                            (installError, installStdout, installStderr) => {
                                if (installError) {
                                    Logger.warn(
                                        "X40ControlTailscale: instalación fallida",
                                        {
                                            message: installError.message,
                                            stderr: (installStderr || "").slice(0, 2000)
                                        }
                                    );

                                    return res.status(500).json({
                                        error: (installStderr || "").trim() ||
                                            installError.message ||
                                            "No se pudo instalar Tailscale."
                                    });
                                }

                                return res.json({
                                    message: (installStdout || "").trim() ||
                                        "Binarios instalados y arranque persistente configurado. La VPN no se conecta automáticamente.",
                                    installed: true
                                });
                            }
                        );
                        return;
                    }

                    if (action === "uninstall") {
                        const uninstallScript = String.raw`
set -eu
POSTBOOT="/data/_root_postboot.sh"
BACKUP=""

if [ -f "$POSTBOOT" ]; then
    BACKUP="$POSTBOOT.before-tailscale-uninstall-$(date +%Y%m%d-%H%M%S)"
    cp -p "$POSTBOOT" "$BACKUP"
    TMP="$POSTBOOT.uninstall.$$"

    if ! awk '
        BEGIN {
            inblock=0
            depth=0
            waiting=0
            managed=0
            serve=0
            bad=0
        }

        /^# X40-Control Tailscale managed startup$/ {
            if (inblock || managed++) {
                bad=1
                exit 2
            }
            inblock=1
            waiting=1
            depth=0
            next
        }

        /^# X40-Control Tailscale Serve HTTPS startup$/ {
            if (inblock || serve++) {
                bad=1
                exit 2
            }
            inblock=1
            waiting=1
            depth=0
            next
        }

        inblock {
            if (waiting) {
                if ($0 !~ /^[[:space:]]*if([[:space:]]|$)/) {
                    bad=1
                    exit 2
                }
                waiting=0
                depth=1
                next
            }

            line = $0
            opens = gsub(/(^|[[:space:];])if([[:space:]]|$)/, "&", line)
            closes = gsub(/(^|[[:space:];])fi([[:space:]]|$)/, "&", line)
            depth += opens - closes

            if (depth < 0) {
                bad=1
                exit 2
            }
            if (depth == 0) inblock=0
            next
        }

        { print }

        END {
            if (bad || inblock || managed != 1 || serve != 1) {
                print "No se pudieron validar ambos bloques completos." > "/dev/stderr"
                exit 2
            }
        }
    ' "$POSTBOOT" > "$TMP"; then
        rm -f "$TMP"
        echo "No se pudieron retirar los bloques de forma segura; arranque intacto." >&2
        exit 1
    fi

    if grep -q "X40-Control Tailscale" "$TMP"; then
        rm -f "$TMP"
        echo "Quedan marcadores de Tailscale; arranque intacto." >&2
        exit 1
    fi

    if ! sh -n "$TMP"; then
        rm -f "$TMP"
        echo "La validación del arranque ha fallado; no se ha modificado." >&2
        exit 1
    fi

    cat "$TMP" > "$POSTBOOT"
    chmod 755 "$POSTBOOT"
    rm -f "$TMP"
fi

CLI="/data/tailscale/current/tailscale"
if [ -x "$CLI" ]; then
    "$CLI" --socket=/data/tailscale/tailscaled.sock serve reset >/dev/null 2>&1 || true
    "$CLI" --socket=/data/tailscale/tailscaled.sock down >/dev/null 2>&1 || true
fi

# Terminar únicamente el daemon de Tailscale, sin usar pkill -f.
TAILSCALED_PATTERN='^/data/tailscale/current/tailscaled([[:space:]]|$)'

for pid in $(pgrep -f "$TAILSCALED_PATTERN" 2>/dev/null || true); do
    kill "$pid" 2>/dev/null || true
done

# Esperar a que el daemon termine antes de retirar sus binarios.
attempt=0
while pgrep -f "$TAILSCALED_PATTERN" >/dev/null 2>&1; do
    if [ "$attempt" -ge 5 ]; then
        echo "Tailscale sigue ejecutándose; no se han retirado los binarios." >&2
        exit 1
    fi
    sleep 1
    attempt=$((attempt + 1))
done

rm -f /data/tailscale/tailscaled.sock /data/tailscale/current
for d in /data/tailscale/tailscale_*_arm64; do
    [ -d "$d" ] && rm -rf "$d"
done

echo "Binarios de Tailscale retirados; claves y estado conservados."
[ -n "$BACKUP" ] && echo "Copia de arranque: $BACKUP"
`;
                        return execFile(
                            "/bin/sh",
                            ["-c", uninstallScript],
                            {timeout: 20000, maxBuffer: 64 * 1024},
                            (uninstallError, uninstallStdout, uninstallStderr) => {
                                if (uninstallError) {
                                    return res.status(500).json({
                                        error: (uninstallStderr || "").trim() || uninstallError.message
                                    });
                                }
                                return res.json({message: (uninstallStdout || "").trim()});
                            }
                        );
                    }

                    if (findError || !tailscalePath) {
                        return res.status(409).json({
                            error: "No se encuentra el ejecutable de Tailscale."
                        });
                    }

                    if (action === "serve") {
                        return execFile(
                            tailscalePath,
                            ["--socket=/data/tailscale/tailscaled.sock", "serve", "--bg", "--yes", "80"],
                            {timeout: 20000, maxBuffer: 64 * 1024},
                            (serveError, serveStdout, serveStderr) => {
                                if (serveError) {
                                    return res.status(500).json({
                                        error: (serveStderr || "").trim() || serveError.message
                                    });
                                }
                                return res.json({
                                    message: "Tailscale Serve HTTPS configurado.",
                                    output: (serveStdout || "").trim()
                                });
                            }
                        );
                    }

                    execFile(
                        tailscalePath,
                        [
                            "--socket=/data/tailscale/tailscaled.sock",
                            action
                        ],
                        {timeout: 20000, maxBuffer: 64 * 1024},
                        (commandError, stdout, stderr) => {
                            if (commandError) {
                                Logger.warn(
                                    "X40ControlTailscale: error al ejecutar una acción",
                                    {
                                        action: action,
                                        message: commandError.message,
                                        stderr: (stderr || "").slice(0, 2000)
                                    }
                                );

                                return res.status(500).json({
                                    error: (stderr || "").trim() ||
                                        commandError.message ||
                                        "No se pudo ejecutar la acción de Tailscale."
                                });
                            }

                            if (action === "up" || action === "down") {
                                const webserverConfig = this.config.get("webserver");
                                webserverConfig.blockExternalAccess = action === "down";
                                this.config.set("webserver", webserverConfig);
                            }

                            if (action === "up") {
                                execFile(
                                    tailscalePath,
                                    [
                                        "--socket=/data/tailscale/tailscaled.sock",
                                        "serve",
                                        "--bg",
                                        "--yes",
                                        "80"
                                    ],
                                    {timeout: 20000, maxBuffer: 64 * 1024},
                                    (serveError, serveStdout, serveStderr) => {
                                        const output = [
                                            (stdout || "").trim(),
                                            (serveStdout || "").trim(),
                                            (serveStderr || "").trim()
                                        ].filter(Boolean).join("\n");

                                        return res.json({
                                            message: serveError ?
                                                "Conexión solicitada. Autoriza el dispositivo y vuelve a pulsar «Conectar / autorizar» para activar HTTPS." :
                                                "Conexión ejecutada y HTTPS Serve configurado.",
                                            output: output
                                        });
                                    }
                                );
                                return;
                            }

                            return res.json({
                                message: action === "up" ?
                                    "Comando de conexión ejecutado. El estado puede tardar en actualizarse." :
                                    "Comando de desconexión ejecutado. El estado puede tardar en actualizarse.",
                                output: (stdout || "").trim()
                            });
                        }
                    );
                }
            );
        });

        // X40-Control: voces por habitación
        // ============================================================

        this.router.get("/x40-control/room-voices", (req, res) => {
            try {
                const x40Control = this.config.get("x40Control") ?? {};
                const roomVoices = x40Control.roomVoices ?? {};

                res.json(roomVoices);
            } catch (err) {
                Logger.warn(
                    `${this.constructor.name}: Error while reading room voices`,
                    {message: err.message}
                );

                res.status(500).json(err.message);
            }
        });

        this.router.put("/x40-control/room-voices", (req, res) => {
            try {
                const segmentId = String(req.body?.segmentId ?? "").trim();
                const voiceId = req.body?.voiceId;

                if (!segmentId) {
                    return res.status(400).json("segmentId is required");
                }

                const currentConfig = this.config.get("x40Control") ?? {};
                const roomVoices = {
                    ...(currentConfig.roomVoices ?? {})
                };

                // null elimina la asignación de voz
                if (voiceId === null || voiceId === undefined) {
                    delete roomVoices[segmentId];
                } else {
                    const voiceSegmentId = String(voiceId).trim();
                    const voiceSegmentNumber = Number(voiceSegmentId);

                    if (
                        !Number.isInteger(voiceSegmentNumber) ||
                        voiceSegmentNumber < 1 ||
                        voiceSegmentNumber > 20
                    ) {
                        return res.status(400).json(
                            "voiceId must be a valid room voice ID (1-20)"
                        );
                    }

                    roomVoices[segmentId] = voiceSegmentId;
                }

                this.config.set("x40Control", {
                    ...currentConfig,
                    roomVoices: roomVoices
                });

                res.json(roomVoices);
            } catch (err) {
                Logger.warn(
                    `${this.constructor.name}: Error while updating room voices`,
                    {message: err.message}
                );

                res.status(500).json(err.message);
            }
        });

        // ============================================================
        // X40-Control: voz automática por habitación
        // ============================================================

        this.router.post("/x40-control/room-voice", (req, res) => {
            const segmentId = String(req.body?.segmentId ?? "").trim();
            const roomName = String(req.body?.roomName ?? "").trim();

            if (!segmentId || !roomName) {
                return res.status(400).json({
                    error: "segmentId y roomName son obligatorios"
                });
            }

            const voicePath = getRoomVoicePath(roomName);

            if (!voicePath) {
                return res.status(400).json({
                    error: "No existe una voz para esta habitación o no hay idioma activo",
                    segmentId: segmentId,
                    roomName: roomName
                });
            }

            if (!fs.existsSync(voicePath)) {
                Logger.warn(
                    `${this.constructor.name}: No existe voz para habitación ${segmentId}`,
                    {roomName: roomName, voicePath: voicePath}
                );

                return res.status(404).json({
                    error: "No existe voz para esta habitación",
                    segmentId: segmentId,
                    roomName: roomName,
                    voicePath: voicePath
                });
            }

            execFile(
                "/usr/bin/dmr_client",
                ["-f", voicePath],
                {timeout: 10000},
                (error, stdout, stderr) => {
                    if (error) {
                        Logger.warn(
                            `${this.constructor.name}: Error reproduciendo voz de habitación`,
                            {
                                segmentId: segmentId,
                                roomName: roomName,
                                voicePath: voicePath,
                                message: error.message,
                                stdout: stdout,
                                stderr: stderr
                            }
                        );

                        return res.status(500).json({
                            error: "No se pudo reproducir la voz de habitación",
                            segmentId: segmentId,
                            roomName: roomName
                        });
                    }

                    res.json({
                        ok: true,
                        segmentId: segmentId,
                        roomName: roomName,
                        voicePath: voicePath
                    });
                }
            );
        });

        this.router.get("/version", (req, res) => {
            res.json({
                release: Tools.GET_VALETUDO_VERSION(),
                commit: Tools.GET_COMMIT_ID()
            });
        });

        this.router.post("/x40-control/voice", (req, res) => {
            const id = Number(req.body?.id);

            const validIds = new Set([
                // X40-Control: presets
                1001, 1002, 1003, 1004, 1005,

                // X40-Control: suction
                1101, 1102, 1103, 1104, 1105, 1106, 1107,

                // X40-Control: water
                1201, 1202, 1203, 1204, 1205, 1206,

                // X40-Control: Dreame/GLADOS error voices
                34, 35, 36, 42, 49, 50, 51, 53, 70,
                91, 92, 93, 96, 98, 99
            ]);

            if (!Number.isInteger(id) || !validIds.has(id)) {
                return res.status(400).json({
                    error: "ID de voz no válido"
                });
            }

            let voicePath;

            if (isX40ControlVoice(id)) {
                voicePath = getVoicePath(id);

                if (!voicePath) {
                    return res.status(404).json({
                        error: "No se encontró el audio X40-Control en la voz activa"
                    });
                }
            } else {
                // Voces de errores Dreame/GLADOS existentes.
                voicePath = `/data/personalized_voice/X40-Control/${id}.ogg`;
            }

            execFile(
                "/usr/bin/dmr_client",
                ["-f", voicePath],
                {
                    timeout: 10000
                },
                (error, stdout, stderr) => {
                    if (error) {
                        Logger.warn(
                            `X40ControlVoice: error reproduciendo voz ${id}`,
                            {
                                message: error.message,
                                stdout: stdout,
                                stderr: stderr
                            }
                        );

                        return res.status(500).json({
                            error: "No se pudo reproducir la voz"
                        });
                    }

                    res.sendStatus(200);
                }
            );
        });

        this.router.get("/log/content", this.limiter, (req, res) => {
            if (fs.existsSync(Logger.getLogFilePath())) {
                res.sendFile(Logger.getLogFilePath());
            } else {
                res.send("\n");
            }
        });


        const LogLevels = Object.keys(Logger.getProperties().LogLevels);
        this.router.get("/log/level", (req, res) => {
            res.json({
                current: Logger.getLogLevel(),
                presets: LogLevels
            });
        });

        this.router.put("/log/level", this.validator, (req, res) => {
            if (typeof req.body.level === "string") {
                Logger.setLogLevel(req.body.level);

                res.sendStatus(200);
            } else {
                res.sendStatus(400);
            }

        });

        this.router.get("/config/interfaces/mqtt", (req, res) => {
            let mqttConfig = structuredClone(this.config.get("mqtt"));

            MQTT_CONFIG_PRIVATE_PATHS.forEach(path => {
                if (nestedProperty.get(mqttConfig, path)) {
                    nestedProperty.set(mqttConfig, path, MAGIC_PRIVACY_STRING);
                }
            });

            res.json(mqttConfig);
        });

        this.router.put("/config/interfaces/mqtt", this.validator, (req, res) => {
            let mqttConfig = ValetudoRouter.MAP_MQTT_CONFIG(req.body);
            let oldConfig = this.config.get("mqtt");


            MQTT_CONFIG_PRIVATE_PATHS.forEach(path => {
                if (nestedProperty.get(mqttConfig, path) === MAGIC_PRIVACY_STRING) {
                    nestedProperty.set(mqttConfig, path, nestedProperty.get(oldConfig, path));
                }
            });

            this.config.set("mqtt", mqttConfig);

            res.sendStatus(200);
        });

        this.router.get("/config/interfaces/http/auth/basic", (req, res) => {
            res.json({...this.config.get("webserver").basicAuth, password: ""});
        });

        this.router.put("/config/interfaces/http/auth/basic", this.validator, (req, res) => {
            if (
                typeof req.body.enabled === "boolean" &&
                typeof req.body.username === "string" &&
                typeof req.body.password === "string"
            ) {
                const webserverConfig = this.config.get("webserver");

                const options = {
                    enabled: req.body.enabled,
                    username: req.body.username,
                    password: req.body.password
                };


                if (!options.password && (webserverConfig.basicAuth.enabled === false && options.enabled === true)) {
                    res.sendStatus(400);
                } else {
                    webserverConfig.basicAuth = options;

                    this.config.set("webserver", webserverConfig);
                    res.sendStatus(200);
                }
            } else {
                res.sendStatus(400);
            }
        });

        this.router.get("/config/duststreaming", (req, res) => {
            res.json(this.config.get("duststreaming") || {enabled: false});
        });

        this.router.put("/config/duststreaming", this.validator, (req, res) => {
            if (typeof req.body.enabled !== "boolean") {
                return res.sendStatus(400);
            }

            const config = Object.assign(
                {},
                this.config.get("duststreaming") || {},
                {enabled: req.body.enabled}
            );

            this.config.set("duststreaming", config);

            if (req.body.enabled === false) {
                const capability = this.robot.capabilities.DuststreamingCapability;

                if (capability && typeof capability.stop === "function") {
                    capability.stop();
                }
            }

            res.sendStatus(200);
        });

        this.router.get("/config/customizations", (req, res) => {
            const valetudoConfig = this.config.get("valetudo");

            res.json(valetudoConfig.customizations);
        });

        this.router.put("/config/customizations", this.validator, (req, res) => {
            if (typeof req.body.friendlyName === "string") {
                const valetudoConfig = this.config.get("valetudo");
                valetudoConfig.customizations.friendlyName = req.body.friendlyName;
                this.config.set("valetudo", valetudoConfig);

                res.sendStatus(200);
            } else {
                res.sendStatus(400);
            }
        });

        this.router.get("/x40-control/ota", (req, res) => {
            const manifestPath = "/data/ota/manifest.json";
            const targetPath = "/data/valetudo";
            const manifestUrl =
                "https://raw.githubusercontent.com/orlandoida06-rgb/X40-Control/main/ota/manifest.json";

            try {
                if (!fs.existsSync(targetPath)) {
                    return res.status(404).json({
                        error: "No existe el binario X40Control"
                    });
                }

                execFile(
                    "/usr/bin/curl",
                    ["-fsSL", "--max-time", "15", manifestUrl],
                    {
                        timeout: 20000,
                        maxBuffer: 1024 * 1024
                    },
                    (manifestError, manifestStdout, manifestStderr) => {
                        let manifest;

                        if (!manifestError) {
                            try {
                                manifest = JSON.parse(manifestStdout);
                                fs.writeFileSync(manifestPath, manifestStdout);
                            } catch (err) {
                                Logger.warn(
                                    "X40ControlOTA: manifest remoto inválido",
                                    {
                                        message: err.message
                                    }
                                );
                            }
                        }

                        if (!manifest) {
                            try {
                                if (!fs.existsSync(manifestPath)) {
                                    return res.status(404).json({
                                        error: "No se pudo obtener el manifest OTA"
                                    });
                                }

                                manifest = JSON.parse(
                                    fs.readFileSync(manifestPath, "utf8")
                                );
                            } catch (err) {
                                return res.status(500).json({
                                    error: "No se pudo leer el manifest OTA"
                                });
                            }
                        }

                        execFile(
                            "/usr/bin/sha256sum",
                            [targetPath],
                            {
                                timeout: 10000
                            },
                            (error, stdout, stderr) => {
                                if (error) {
                                    Logger.warn(
                                        "X40ControlOTA: error obteniendo SHA256",
                                        {
                                            message: error.message,
                                            stdout: stdout,
                                            stderr: stderr
                                        }
                                    );

                                    return res.status(500).json({
                                        error: "No se pudo obtener el SHA256 del binario"
                                    });
                                }

                                const installedSha256 = stdout.trim().split(/\s+/)[0];
                                const installed =
                                    installedSha256 === manifest.sha256;

                                const installedVersionPath =
                                    "/data/ota/installed-version";
                                let installedVersion = null;

                                try {
                                    if (fs.existsSync(installedVersionPath)) {
                                        installedVersion =
                                            fs.readFileSync(
                                                installedVersionPath,
                                                "utf8"
                                            ).trim() || null;
                                    }

                                    // El binario puede haberse instalado con un instalador OTA antiguo
                                    // que no escribía installed-version. Si el SHA coincide con el manifest,
                                    // el binario es inequívocamente la versión publicada y podemos reparar
                                    // automáticamente el registro de versión.
                                    if (installed && installedVersion !== manifest.version) {
                                        fs.writeFileSync(
                                            installedVersionPath,
                                            `${manifest.version}\n`
                                        );
                                        installedVersion = manifest.version;
                                    }
                                } catch (err) {
                                    Logger.warn(
                                        "X40ControlOTA: no se pudo leer la versión instalada",
                                        {
                                            message: err.message
                                        }
                                    );
                                }

                                res.json({
                                    product: manifest.product,
                                    installed: installed,
                                    installedVersion: installedVersion,
                                    availableVersion: manifest.version,
                                    installedSha256: installedSha256,
                                    expectedSha256: manifest.sha256,
                                    requiresReboot: manifest.requires_reboot === true,
                                    changelog: Array.isArray(manifest.changelog) ?
                                        manifest.changelog :
                                        []
                                });
                            }
                        );
                    }
                );
            } catch (err) {
                Logger.warn(
                    "X40ControlOTA: error leyendo estado OTA",
                    {
                        message: err.message
                    }
                );

                res.status(500).json({
                    error: "No se pudo obtener el estado OTA"
                });
            }
        });

        this.router.post("/x40-control/reboot", (req, res) => {
            Logger.info("X40ControlOTA: reinicio solicitado por el usuario");

            res.status(200).json({
                success: true,
                message: "El robot se reiniciará ahora"
            });

            setTimeout(() => {
                execFile(
                    "/sbin/reboot",
                    [],
                    {
                        timeout: 10000,
                    },
                    (error) => {
                        if (error) {
                            Logger.warn(
                                "X40ControlOTA: error ejecutando reboot",
                                {
                                    message: error.message
                                }
                            );
                        }
                    }
                );
            }, 1000);
        });

        this.router.post("/x40-control/ota/update", (req, res) => {
            if (this.x40ControlOTAUpdateRunning) {
                return res.status(409).json({
                    success: false,
                    error: "Ya hay una actualización OTA en curso."
                });
            }

            this.ensureX40ControlOTAInstaller();

            const updateScript = "/data/ota/update.sh";

            if (!fs.existsSync(updateScript)) {
                return res.status(500).json({
                    success: false,
                    error: "No se pudo preparar /data/ota/update.sh"
                });
            }

            this.x40ControlOTAUpdateRunning = true;

            execFile(
                "/bin/sh",
                [updateScript],
                {
                    timeout: 10 * 60 * 1000,
                    maxBuffer: 1024 * 1024
                },
                (error, stdout, stderr) => {
                    this.x40ControlOTAUpdateRunning = false;

                    if (error) {
                        Logger.warn(
                            "X40ControlOTA: error durante la actualización",
                            {
                                message: error.message,
                                stdout: stdout,
                                stderr: stderr
                            }
                        );

                        return res.status(500).json({
                            success: false,
                            error: error.message,
                            output: stdout || "",
                            stderr: stderr || ""
                        });
                    }

                    res.status(200).json({
                        success: true,
                        output: stdout || "",
                        stderr: stderr || ""
                    });
                }
            );
        });
    }

    initSSE() {
        this.sseHubs = {
            log: new SSEHub({name: "Log"}),
        };
        const LogMessageEventType = Logger.getProperties().EVENTS.LogMessage;

        Logger.onLogMessage((line) => {
            /**
             * To be parsed correctly, one line needs to be one sse event.
             *
             * While the sseHub could handle this, it only is an issue when sending logs.
             * Everything else using SSE in valetudo is a single-line string
             *
             * To not waste CPU cycles for nothing, we therefore do the splitting here
             */
            line.split("\n").forEach(actualLine => {
                this.sseHubs.log.event(
                    LogMessageEventType,
                    actualLine
                );
            });
        });

        this.router.get(
            "/log/content/sse",
            SSEMiddleware({
                hub: this.sseHubs.log,
                keepAliveInterval: 5000,
                maxClients: 5
            }),
            (req, res) => {
                //Intentional, as the response will be handled by the SSEMiddleware
            }
        );
    }

    getRouter() {
        return this.router;
    }

    shutdown() {
        Object.values(this.sseHubs).forEach(hub => {
            hub.shutdown();
        });
    }

    static MAP_MQTT_CONFIG(obj) {
        return {
            enabled: obj.enabled,
            connection: {
                host: obj.connection.host,
                port: obj.connection.port,
                tls: {
                    enabled: obj.connection.tls.enabled,
                    ca: obj.connection.tls.ca,
                    ignoreCertificateErrors: obj.connection.tls.ignoreCertificateErrors
                },
                authentication: {
                    credentials: {
                        enabled: obj.connection.authentication.credentials.enabled,
                        username: obj.connection.authentication.credentials.username,
                        password: obj.connection.authentication.credentials.password
                    },
                    clientCertificate: {
                        enabled: obj.connection.authentication.clientCertificate.enabled,
                        certificate: obj.connection.authentication.clientCertificate.certificate,
                        key: obj.connection.authentication.clientCertificate.key
                    }
                }
            },
            identity: {
                identifier: obj.identity.identifier
            },
            customizations: {
                topicPrefix: obj.customizations.topicPrefix,
                provideMapData: obj.customizations.provideMapData
            },
            interfaces: {
                homie: {
                    enabled: obj.interfaces.homie.enabled,
                    cleanAttributesOnShutdown: obj.interfaces.homie.cleanAttributesOnShutdown
                },
                homeassistant: {
                    enabled: obj.interfaces.homeassistant.enabled,
                    cleanAutoconfOnShutdown: obj.interfaces.homeassistant.cleanAutoconfOnShutdown
                }
            },
            optionalExposedCapabilities: Array.isArray(obj.optionalExposedCapabilities) ? [...new Set(obj.optionalExposedCapabilities)] : []
        };
    }
}

const MAGIC_PRIVACY_STRING = "<redacted>";
const MQTT_CONFIG_PRIVATE_PATHS = [
    "connection.authentication.credentials.username",
    "connection.authentication.credentials.password",
    "connection.authentication.clientCertificate.certificate",
    "connection.authentication.clientCertificate.key"
];

module.exports = ValetudoRouter;
