// noinspection ES6PreferShortImport - Import cannot be shortened without ending up with a cyclic dependency in the build
import {RawMapLayer, RawMapLayerMaterial} from "../api/RawMapData";
import {FourColorTheoremSolver} from "./utils/colors/FourColorTheoremSolver";
import {PaletteMode} from "@mui/material";
import {darkPalette, lightPalette} from "../colors";

export type RGBColor = {
    r: number;
    g: number;
    b: number;
}

export type LayerColors = {
    floor: RGBColor;
    wall: RGBColor;
    segments: RGBColor[];
};

function hexToRgb(hex: string) : RGBColor {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());

    if (result === null) {
        throw new Error(`Invalid color ${hex}`);
    }

    return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } ;
}

export function adjustRGBColorBrightness(color: RGBColor, percent: number): RGBColor {
    const multiplier = (100 + percent) / 100;

    return {
        r: Math.round(Math.min(255, Math.max(0, color.r * multiplier))),
        g: Math.round(Math.min(255, Math.max(0, color.g * multiplier))),
        b: Math.round(Math.min(255, Math.max(0, color.b * multiplier)))
    };
}

/**
 * Returns true if the pixel should be rendered in the accent color. Otherwise false
 */
type PixelPatternHandler = (x: number, y: number) => boolean;

const solidFillPixelPatternHandler: PixelPatternHandler = (x, y) => {
    return false;
};

/*
 * +-----+-----+
 * |     |     |
 * |     |     |
 * +-----+-----+
 * |     |     |
 * |     |     |
 * +-----+-----+
 */
const tilePixelPatternHandler: PixelPatternHandler = (x, y) => {
    const TILE_SIZE = 6;

    return x % TILE_SIZE === 0 || y % TILE_SIZE === 0;
};

/* 
 * < PLANK_WIDTH >
 * |           |           |
 * |           |           |
 * |-----------|           | 
 * |           |           |  ^
 * |           |-----------|  <-- ( Controlled by JOINT_OFFSET)
 * |           |           |  PLANK_LENGTH
 * |           |           |  v
 * |-----------|           |
 * |           |           |
 */
const createPlankPixelPatternHandler = (isHorizontal: boolean): PixelPatternHandler => {
    const PLANK_WIDTH = 5;
    const PLANK_LENGTH = 24;
    const JOINT_OFFSET = PLANK_LENGTH / 2;

    return (x, y) => {
        const mainAxisCoord = isHorizontal ? y : x;
        const crossAxisCoord = isHorizontal ? x : y;

        if (mainAxisCoord % PLANK_WIDTH === 0) {
            return true;
        }

        const plankStripIndex = Math.floor(mainAxisCoord / PLANK_WIDTH);
        const isEvenStrip = plankStripIndex % 2 === 0;

        const currentJointPosition = isEvenStrip ? 0 : JOINT_OFFSET;

        return crossAxisCoord % PLANK_LENGTH === currentJointPosition;
    };
};

/*
 *  / / / / \ \ \ \ / / / /
 * / / / /   \ \ \ \ / / / /
 *  / / / / \ \ \ \ / / / /
 * / / / /   \ \ \ \ / / / /
 *  / / / / \ \ \ \ / / / /
 */
const chevronPixelPatternHandler: PixelPatternHandler = (x, y) => {
    const PLANK_WIDTH = 4;
    const SECTION_WIDTH = 8;

    const zig = Math.floor(x / SECTION_WIDTH) % 2 === 0; // false = zag
    const diagonalValue = zig ? (x + y) : (x - y);

    return diagonalValue % PLANK_WIDTH === 0;
};


/*
 * +-----+-----+
 * | ||| | === |
 * | ||| | === |
 * +-----+-----+
 * | === | ||| |
 * | === | ||| |
 * +-----+-----+
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const parquetPixelPatternHandler: PixelPatternHandler = (x, y) => {
    const BLOCK_SIZE = 8;
    const PLANK_GAP = 2;

    if (x % BLOCK_SIZE === 0 || y % BLOCK_SIZE === 0) {
        return true;
    }

    const gridX = Math.floor(x / BLOCK_SIZE);
    const gridY = Math.floor(y / BLOCK_SIZE);
    const isVerticalBlock = (gridX + gridY) % 2 === 0;

    if (isVerticalBlock) {
        return x % PLANK_GAP === 0;
    } else {
        return y % PLANK_GAP === 0;
    }
};

/*
 * ? ? ? ? ?
 * ? ? ? ? ?
 * ? ? ? ? ?
 * ? ? ? ? ?
 */
const fallbackPixelPatternHandler: PixelPatternHandler = (x, y) => {
    const pattern = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

    const PATTERN_HEIGHT = pattern.length;
    const PATTERN_WIDTH = pattern[0].length;

    const localY = y % PATTERN_HEIGHT;
    const localX = x % PATTERN_WIDTH;

    return pattern[localY][localX] === 1;
};


/*
 * Ajuste visual específico para la habitación de Xiana.
 * No modifica los datos del robot; solamente evita pintar
 * la prolongación exterior izquierda del segmento 2.
 */
const shouldRenderXianaPixel = (x: number, y: number): boolean => {
    if (y < 600) {
        return x >= 600 && x <= 661;
    }

    if (y < 615) {
        return x >= 595 && x <= 661;
    }

    return x >= 610 && x <= 661;
};

const materialToPixelPatternHandler: {[key in RawMapLayerMaterial]: PixelPatternHandler} = {
    [RawMapLayerMaterial.Generic]: solidFillPixelPatternHandler,
    [RawMapLayerMaterial.Tile]: tilePixelPatternHandler,
    [RawMapLayerMaterial.Wood]: chevronPixelPatternHandler,
    [RawMapLayerMaterial.WoodHorizontal]: createPlankPixelPatternHandler(true),
    [RawMapLayerMaterial.WoodVertical]: createPlankPixelPatternHandler(false),
};

export function PROCESS_LAYERS(layers: Array<RawMapLayer>, pixelSize: number, paletteMode: PaletteMode, selectedSegmentIds: string[]) {
    const dimensions = CALCULATE_REQUIRED_DIMENSIONS(layers);
    const width = dimensions.x.sum;
    const height = dimensions.y.sum;

    const pixelData = new Uint8ClampedArray( width * height * 4 ); // RGBA
    const segmentLookupData = new Uint8ClampedArray( width * height);
    const segmentLookupIdMapping = new Map(); //Because segment IDs are arbitrary strings, we need this mapping to an int for the lookup data

    const colorFinder = new FourColorTheoremSolver(layers, pixelSize);


    const hasSelectedSegments = selectedSegmentIds.length === 0;

    let colors: LayerColors = COLORS;
    let backgroundColors: LayerColors = BACKGROUND_COLORS;
    let accentColors: LayerColors = ACCENT_COLORS;
    let backgroundAccentColors: LayerColors = BACKGROUND_ACCENT_COLORS;
    if (paletteMode === "dark") {
        colors = DARK_COLORS;
        backgroundColors = DARK_BACKGROUND_COLORS;

        accentColors = DARK_ACCENT_COLORS;
        backgroundAccentColors = DARK_BACKGROUND_ACCENT_COLORS;
    }

    [...layers].sort((a,b) => {
        return (TYPE_SORT_MAPPING[a.type] ?? 0) - (TYPE_SORT_MAPPING[b.type] ?? 0);
    }).forEach(layer => {
        let color: RGBColor = {r: 128, g: 128, b: 128};
        let accentColor: RGBColor = {r: 64, g: 192, b: 128};

        switch (layer.type) {
            case "floor":
                if (hasSelectedSegments) {
                    color = colors.floor;
                    accentColor = accentColors.floor;
                } else {
                    color = backgroundColors.floor;
                    accentColor = backgroundAccentColors.floor;
                }
                break;
            case "wall":
                if (hasSelectedSegments) {
                    color = colors.wall;
                    accentColor = accentColors.wall;
                } else {
                    color = backgroundColors.wall;
                    accentColor = backgroundAccentColors.wall;
                }
                break;
            case "segment": {
                const colorId = colorFinder.getColor((layer.metaData.segmentId ?? ""));

                if (hasSelectedSegments || selectedSegmentIds.includes(layer.metaData.segmentId ?? "")) {
                    color = colors.segments[colorId];
                    accentColor = accentColors.segments[colorId];
                } else {
                    color = backgroundColors.segments[colorId];
                    accentColor = backgroundAccentColors.segments[colorId];
                }
                break;
            }
        }

        let segmentLookupId = 0;
        if (layer.metaData.segmentId) {
            segmentLookupId = segmentLookupIdMapping.size + 1;
            segmentLookupIdMapping.set(segmentLookupId, layer.metaData.segmentId);
        }

        let pixelPatternHandler = solidFillPixelPatternHandler;
        if (layer.metaData.material) {
            pixelPatternHandler = materialToPixelPatternHandler[layer.metaData.material] ?? fallbackPixelPatternHandler;
        }

        for (let i = 0; i < layer.pixels.length; i = i + 2) {
            const offset = (
                (layer.pixels[i] - dimensions.x.min) +
                ((layer.pixels[i+1] - dimensions.y.min) * width)
            );
            const imgDataOffset = offset * 4;

            const pixelX = layer.pixels[i];
            const pixelY = layer.pixels[i+1];

            if (
                layer.type === "segment" &&
                layer.metaData.segmentId === "2" &&
                !shouldRenderXianaPixel(pixelX, pixelY)
            ) {
                continue;
            }

            let pixelColor = color;

if (layer.type === "wall") {
    let nearbySegmentId = 0;
    let nearbyCount = 0;

    for (let dy = -4; dy <= 4; dy++) {
        for (let dx = -4; dx <= 4; dx++) {
            if (dx === 0 && dy === 0) {
                continue;
            }

            const nx = pixelX + dx;
            const ny = pixelY + dy;

            if (
                nx < dimensions.x.min ||
                nx > dimensions.x.max ||
                ny < dimensions.y.min ||
                ny > dimensions.y.max
            ) {
                continue;
            }

            const neighborOffset =
                (nx - dimensions.x.min) +
                ((ny - dimensions.y.min) * width);

            const neighborSegmentId = segmentLookupData[neighborOffset];

            if (neighborSegmentId > 0) {
                if (nearbySegmentId === 0) {
                    nearbySegmentId = neighborSegmentId;
                }

                if (nearbySegmentId === neighborSegmentId) {
                    nearbyCount++;
                }
            }
        }
    }

    if (nearbySegmentId > 0 && nearbyCount >= 12) {
        const segmentId = segmentLookupIdMapping.get(nearbySegmentId);

        if (segmentId) {
            const colorId = colorFinder.getColor(segmentId);

            pixelColor = colors.segments[colorId];
        }
    }
} else if (layer.type === "segment" && layer.metaData.segmentId === "2") {
    pixelColor = color;
} else {
    pixelColor = pixelPatternHandler(pixelX, pixelY) ? accentColor : color;
}

pixelData[imgDataOffset] = pixelColor.r;
            pixelData[imgDataOffset + 1] = pixelColor.g;
            pixelData[imgDataOffset + 2] = pixelColor.b;
            pixelData[imgDataOffset + 3] = 255;

            segmentLookupData[offset] = segmentLookupId;
        }
    });

    // Rellenar pequeños huecos interiores de Habitación matrimonio (segmento 8)
    for (let y = dimensions.y.min + 1; y < dimensions.y.max; y++) {
        for (let x = dimensions.x.min + 1; x < dimensions.x.max; x++) {
            const offset =
                (x - dimensions.x.min) +
                ((y - dimensions.y.min) * width);

            // Solo rellenar píxeles actualmente transparentes.
            if (pixelData[offset * 4 + 3] !== 0) {
                continue;
            }

            let segment8Count = 0;

            for (let dy = -3; dy <= 3; dy++) {
                for (let dx = -3; dx <= 3; dx++) {
                    if (dx === 0 && dy === 0) {
                        continue;
                    }

                    const nx = x + dx;
                    const ny = y + dy;

                    if (
                        nx < dimensions.x.min ||
                        nx > dimensions.x.max ||
                        ny < dimensions.y.min ||
                        ny > dimensions.y.max
                    ) {
                        continue;
                    }

                    const neighborOffset =
                        (nx - dimensions.x.min) +
                        ((ny - dimensions.y.min) * width);

                    const neighborSegmentId =
                        segmentLookupIdMapping.get(
                            segmentLookupData[neighborOffset]
                        );

                    if (neighborSegmentId === "8") {
                        segment8Count++;
                    }
                }
            }

            if (segment8Count >= 10) {
                const colorId = colorFinder.getColor("8");
                const fillColor = colors.segments[colorId];

                pixelData[offset * 4] = fillColor.r;
                pixelData[offset * 4 + 1] = fillColor.g;
                pixelData[offset * 4 + 2] = fillColor.b;
                pixelData[offset * 4 + 3] = 255;

                segmentLookupData[offset] =
                    [...segmentLookupIdMapping.entries()]
                        .find(([, id]) => id === "8")?.[0] ?? 0;
            }
        }
    }

    return {
        pixelData: pixelData,
        width: dimensions.x.sum,
        height: dimensions.y.sum,
        left: dimensions.x.min,
        top: dimensions.y.min,

        segmentLookupData: segmentLookupData,
        segmentLookupIdMapping: Object.fromEntries(segmentLookupIdMapping)
    };
}

function CALCULATE_REQUIRED_DIMENSIONS(layers: Array<RawMapLayer>) {
    const dimensions = {
        x: {
            min: Infinity,
            max: -Infinity,
            sum: 0,
        },
        y: {
            min: Infinity,
            max: -Infinity,
            sum: 0,
        },
    };

    layers.forEach(layer => {
        dimensions.x.min = layer.dimensions.x.min < dimensions.x.min ? layer.dimensions.x.min : dimensions.x.min;
        dimensions.x.max = layer.dimensions.x.max > dimensions.x.max ? layer.dimensions.x.max : dimensions.x.max;

        dimensions.y.min = layer.dimensions.y.min < dimensions.y.min ? layer.dimensions.y.min : dimensions.y.min;
        dimensions.y.max = layer.dimensions.y.max > dimensions.y.max ? layer.dimensions.y.max : dimensions.y.max;
    });

    dimensions.x.sum = (dimensions.x.max - dimensions.x.min) + 1;
    dimensions.y.sum = (dimensions.y.max - dimensions.y.min) + 1;
    dimensions.x.sum = isFinite(dimensions.x.sum) ? dimensions.x.sum : 0;
    dimensions.y.sum = isFinite(dimensions.y.sum) ? dimensions.y.sum : 0;

    return dimensions;
}

// This is important because it determines the draw order
const TYPE_SORT_MAPPING = {
    "floor": 14,
    "segment": 15,
    "wall": 16
};

const wallColor = hexToRgb("#333333");

export const COLORS: LayerColors = {
    floor: hexToRgb("#edf1f4"),
    wall: hexToRgb("#c9d1d9"),
    segments: [
        hexToRgb("#6f9ed8"),
        hexToRgb("#62b6bf"),
        hexToRgb("#86a9dc"),
        hexToRgb("#70c4d2"),
        hexToRgb("#9a9fda") // "fallback" color
    ]
};

export const ACCENT_COLORS: LayerColors = {
    floor: adjustRGBColorBrightness(COLORS.floor, -7.5),
    wall: adjustRGBColorBrightness(COLORS.wall, -5),
    segments: COLORS.segments.map(c => adjustRGBColorBrightness(c, -7.5))
};

export const BACKGROUND_COLORS: LayerColors = {
    floor: adjustRGBColorBrightness(COLORS.floor, -40),
    wall: adjustRGBColorBrightness(COLORS.wall, -15),
    segments: COLORS.segments.map(c => adjustRGBColorBrightness(c, -40))
};

export const BACKGROUND_ACCENT_COLORS: LayerColors = {
    floor: adjustRGBColorBrightness(BACKGROUND_COLORS.floor, -7.5),
    wall: adjustRGBColorBrightness(BACKGROUND_COLORS.wall, -5),
    segments: BACKGROUND_COLORS.segments.map(c => adjustRGBColorBrightness(c, -7.5))
};

export const DARK_COLORS: LayerColors = {
    floor: hexToRgb("#0e151d"),
    wall: hexToRgb("#273440"),
    segments: [
        hexToRgb("#3474c7"),
        hexToRgb("#2095a5"),
        hexToRgb("#4c76bd"),
        hexToRgb("#258da9"),
        hexToRgb("#646dc0") // "fallback" color
    ]
};



export const DARK_ACCENT_COLORS: LayerColors = {
    floor: adjustRGBColorBrightness(DARK_COLORS.floor, -25),
    wall: adjustRGBColorBrightness(DARK_COLORS.wall, -15),
    segments: COLORS.segments.map(c => adjustRGBColorBrightness(c, -25))
};


export const DARK_BACKGROUND_COLORS: LayerColors = {
    floor: adjustRGBColorBrightness(COLORS.floor, -50),
    wall: adjustRGBColorBrightness(COLORS.wall, -20),
    segments: COLORS.segments.map(c => adjustRGBColorBrightness(c, -50))
};

export const DARK_BACKGROUND_ACCENT_COLORS: LayerColors = {
    floor: adjustRGBColorBrightness(DARK_BACKGROUND_COLORS.floor, -10),
    wall: adjustRGBColorBrightness(DARK_BACKGROUND_COLORS.wall, -5),
    segments: DARK_BACKGROUND_COLORS.segments.map(c => adjustRGBColorBrightness(c, -10))
};
