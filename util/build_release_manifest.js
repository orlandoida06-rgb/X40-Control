"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const packageJson = require("../package.json");

const binaries = {
    "valetudo-armv7": "./build/armv7/valetudo",
    "valetudo-armv7-lowmem": "./build/armv7/valetudo-lowmem",
    "valetudo-aarch64": "./build/aarch64/valetudo",
    "valetudo-armv7.upx": "./build/armv7/valetudo.upx",
    "valetudo-armv7-lowmem.upx": "./build/armv7/valetudo-lowmem.upx",
    "valetudo-aarch64.upx": "./build/aarch64/valetudo.upx",
};

function main() {
    const sha256sums = {};

    for (const [name, file] of Object.entries(binaries)) {
        if (!fs.existsSync(file)) {
            throw new Error("Falta el binario obligatorio: " + file);
        }

        const stat = fs.statSync(file);

        if (!stat.isFile() || stat.size === 0) {
            throw new Error("Binario vacío o inválido: " + file);
        }

        sha256sums[name] = crypto
            .createHash("sha256")
            .update(fs.readFileSync(file))
            .digest("hex");

        console.log(
            name + ": SHA256=" + sha256sums[name] +
            " tamaño=" + stat.size
        );
    }

    const manifest = {
        timestamp: new Date().toISOString(),
        version: packageJson.version,
        sha256sums,
    };

    if (process.argv[2] === "nightly") {
        const result = require("child_process").spawnSync(
            "git",
            ["rev-parse", "HEAD"],
            {encoding: "utf8"}
        );

        manifest.version = result.status === 0
            ? result.stdout.trim()
            : "nightly";

        try {
            manifest.changelog = fs.readFileSync(
                "./build/changelog_nightly.md",
                "utf8"
            );
        } catch {
            // El changelog es opcional.
        }
    }

    const output = "./build/valetudo_release_manifest.json";
    const temporary = output + ".tmp";

    fs.mkdirSync(path.dirname(output), {recursive: true});
    fs.writeFileSync(
        temporary,
        JSON.stringify(manifest, null, 2) + "\n"
    );
    fs.renameSync(temporary, output);

    console.log("\nManifiesto generado y validado: " + output);
}

try {
    main();
} catch (error) {
    console.error("\nERROR DEL MANIFIESTO:", error.message);
    process.exitCode = 1;
}
