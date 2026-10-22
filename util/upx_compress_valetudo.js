"use strict";

const fs = require("fs");
const path = require("path");
const {spawnSync} = require("child_process");

const binaries = [
    {
        name: "armv7",
        built: "./build/armv7/valetudo",
        out: "./build/armv7/valetudo.upx",
    },
    {
        name: "armv7_lowmem",
        built: "./build/armv7/valetudo-lowmem",
        out: "./build/armv7/valetudo-lowmem.upx",
    },
    {
        name: "aarch64",
        built: "./build/aarch64/valetudo",
        out: "./build/aarch64/valetudo.upx",
    },
];

function runUPX(upxBinary, args) {
    const result = spawnSync(upxBinary, args, {
        stdio: "inherit",
        timeout: 300000,
    });

    if (result.error) {
        throw result.error;
    }

    if (result.status !== 0) {
        throw new Error("UPX ha fallado con código " + result.status);
    }
}

function main() {
    if (process.platform !== "linux" || process.arch !== "x64") {
        throw new Error(
            "La compresión UPX debe ejecutarse en Linux x86-64."
        );
    }

    const upxBinary = path.resolve(
        "node_modules/upx/bin/upx-linux-amd64"
    );

    if (!fs.existsSync(upxBinary)) {
        throw new Error("No se encuentra UPX: " + upxBinary);
    }

    for (const binary of binaries) {
        const input = path.resolve(binary.built);
        const output = path.resolve(binary.out);
        const temporary = output + ".tmp";

        try {
            if (!fs.existsSync(input)) {
                throw new Error("No existe el binario: " + input);
            }

            const originalSize = fs.statSync(input).size;

            if (originalSize === 0) {
                throw new Error("Binario de entrada vacío: " + input);
            }

            console.log("\nComprimiendo ejecutable completo: " + input);

            fs.copyFileSync(input, temporary);
            fs.chmodSync(temporary, 0o755);

            // Conserva los datos añadidos al ejecutable por pkg.
            runUPX(upxBinary, [
                "--best",
                "--lzma",
                "--overlay=copy",
                temporary,
            ]);

            // Verifica la integridad del ejecutable comprimido.
            runUPX(upxBinary, ["-t", temporary]);

            const compressedSize = fs.statSync(temporary).size;

            if (compressedSize === 0 || compressedSize >= originalSize) {
                throw new Error(
                    "UPX no redujo el tamaño de " + binary.name +
                    ": " + originalSize + " -> " + compressedSize
                );
            }

            fs.renameSync(temporary, output);

            console.log(
                "Correcto: " + binary.out + " (" +
                originalSize + " -> " + compressedSize + " bytes)"
            );
        } finally {
            if (fs.existsSync(temporary)) {
                fs.unlinkSync(temporary);
            }
        }
    }
}

try {
    main();
} catch (error) {
    console.error("ERROR UPX:", error.message);
    process.exitCode = 1;
}
