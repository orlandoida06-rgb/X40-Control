"use strict";

const fs = require("fs");
const path = require("path");
const UPX = require("upx");

const binaries = [
    {
        name: "armv7",
        base: "./build_dependencies/pkg/v3.5/built-v22.17.1-linuxstatic-armv7",
        built: "./build/armv7/valetudo",
        out: "./build/armv7/valetudo.upx",
    },
    {
        name: "armv7_lowmem",
        base: "./build_dependencies/pkg/v3.5/built-v22.17.1-linuxstatic-armv7",
        built: "./build/armv7/valetudo-lowmem",
        out: "./build/armv7/valetudo-lowmem.upx",
    },
    {
        name: "aarch64",
        base: "./build_dependencies/pkg/v3.5/built-v22.17.1-linuxstatic-arm64",
        built: "./build/aarch64/valetudo",
        out: "./build/aarch64/valetudo.upx",
    },
];

const compress = UPX({lzma: true, best: true});

async function main() {
    if (process.platform !== "linux" || process.arch !== "x64") {
        throw new Error(
            "UPX empaquetado requiere Linux x86-64. " +
            "Ejecuta este paso en GitHub Actions ubuntu-latest."
        );
    }

    const upxBinary = path.resolve("node_modules/upx/bin/upx-linux-amd64");

    if (!fs.existsSync(upxBinary)) {
        throw new Error("No se encuentra el ejecutable UPX: " + upxBinary);
    }

    console.log("Host de compresión: linux x64");

    for (const binary of binaries) {
        const runtimeTmp = binary.out + ".runtime.tmp";
        const outputTmp = binary.out + ".tmp";

        try {
            console.log("\nComprimiendo " + binary.built);

            const baseStat = fs.statSync(binary.base);
            const builtStat = fs.statSync(binary.built);

            if (baseStat.size <= 0 || builtStat.size <= baseStat.size) {
                throw new Error("Tamaños inesperados en " + binary.name);
            }

            const built = fs.readFileSync(binary.built);
            const runtime = built.subarray(0, baseStat.size);
            const payload = built.subarray(baseStat.size);

            fs.writeFileSync(runtimeTmp, runtime, {mode: 0o755});

            const result = await compress(runtimeTmp).start();
            const compressedRuntime = fs.readFileSync(runtimeTmp);

            if (
                compressedRuntime.length === 0 ||
                compressedRuntime.length >= runtime.length
            ) {
                throw new Error(
                    "UPX no produjo una compresión válida para " + binary.name
                );
            }

            const output = Buffer.concat([compressedRuntime, payload]);

            fs.writeFileSync(outputTmp, output, {mode: 0o755});

            if (fs.statSync(outputTmp).size <= 0) {
                throw new Error("El resultado está vacío: " + binary.name);
            }

            // Sustituye el resultado anterior solo después de validar el nuevo.
            fs.renameSync(outputTmp, binary.out);

            console.log(
                "Correcto: " + binary.out +
                " (" + runtime.length + " -> " +
                compressedRuntime.length + " bytes de runtime)"
            );

            if (result && result.ratio !== undefined) {
                console.log("Ratio UPX: " + result.ratio);
            }
        } finally {
            // Solo elimina temporales creados por esta ejecución.
            for (const tmp of [runtimeTmp, outputTmp]) {
                if (fs.existsSync(tmp)) {
                    fs.unlinkSync(tmp);
                }
            }
        }
    }

    console.log("\nLas tres compresiones han terminado correctamente.");
}

main().catch((error) => {
    console.error("\nERROR DE COMPRESIÓN:", error.message);
    process.exitCode = 1;
});
