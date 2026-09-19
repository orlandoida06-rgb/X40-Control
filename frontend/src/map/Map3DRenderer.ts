import {RawMapData, RawMapEntityType, RawMapLayerType} from "../api";

interface Point {
    x: number;
    y: number;
}

interface Map3DRendererOptions {
    width: number;
    height: number;
}

interface FurnitureItem {
    type: string;
    x: number;
    y: number;
    w: number;
    h: number;
    rotation?: number;
}

interface LayoutRoom {
    x: {
        min: number;
        max: number;
    };
    y: {
        min: number;
        max: number;
    };
    furniture: FurnitureItem[];
}

interface X40Layout {
    rooms: Record<string, LayoutRoom>;
}

interface WallRun {
    y: number;
    xStart: number;
    xEnd: number;
}

const COLORS = {
    background: "#f4f6f8",
    room: "rgba(190, 145, 98, 0.94)",
    roomEdge: "rgba(115, 82, 52, 0.24)",
    wallFront: "rgba(224, 229, 234, 0.98)",
    wallSide: "rgba(198, 205, 212, 0.98)",
    wallTop: "rgba(244, 247, 249, 0.99)",
    route: "#20a8d8",
    robot: "#32aaff",
    charger: "#19b879",
    obstacle: "#e7aa32",
    text: "rgba(45, 55, 65, 0.94)",
};

export default class Map3DRenderer {
    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
    }

    public draw(
        rawMap: RawMapData,
        options: Map3DRendererOptions
    ): void {
        const dpr = window.devicePixelRatio || 1;

        this.canvas.width = Math.max(
            1,
            Math.round(options.width * dpr)
        );

        this.canvas.height = Math.max(
            1,
            Math.round(options.height * dpr)
        );

        const ctx = this.ctx;

        ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );

        ctx.clearRect(
            0,
            0,
            options.width,
            options.height
        );

        const bounds = this.getBounds(rawMap);

        const mapWidth =
            bounds.maxX - bounds.minX;

        const mapHeight =
            bounds.maxY - bounds.minY;

        const scale = Math.min(
            options.width /
                (mapWidth * 1.45),
            options.height /
                (mapHeight * 1.55)
        );

        const centerX =
            options.width / 2;

        const centerY =
            options.height / 2 +
            mapHeight * scale * 0.06;

        const project = (
            point: Point,
            z = 0
        ): Point => {
            const x =
                (point.x - bounds.minX) *
                scale;

            const y =
                (point.y - bounds.minY) *
                scale;

            return {
                x:
                    centerX +
                    x * 0.97 -
                    y * 0.26,

                y:
                    centerY +
                    x * 0.26 +
                    y * 0.97 -
                    z,
            };
        };

        ctx.fillStyle =
            COLORS.background;

        ctx.fillRect(
            0,
            0,
            options.width,
            options.height
        );

        const segments =
            rawMap.layers.filter(
                layer =>
                    layer.type ===
                    RawMapLayerType.Segment
            );

        this.drawRooms(
            ctx,
            segments,
            project,
            scale
        );

        const wallLayer =
            rawMap.layers.find(
                layer =>
                    layer.type ===
                    RawMapLayerType.Wall
            );

        if (wallLayer) {
            const wallRuns =
                this.getWallRuns(
                    wallLayer
                );

            this.drawWallRuns(
                ctx,
                wallRuns,
                project,
                scale
            );
        }

        this.drawPath(
            rawMap,
            project
        );

        this.drawEntities(
            ctx,
            rawMap,
            project
        );

        this.drawRoomLabels(
            ctx,
            segments,
            project
        );

        // Muebles desactivados temporalmente:
        // primero ajustamos el plano de la vivienda.

        this.drawVignette(
            ctx,
            options
        );
    }

    private drawRooms(
        ctx: CanvasRenderingContext2D,
        layers: RawMapData["layers"],
        project: (
            point: Point,
            z?: number
        ) => Point,
        scale: number
    ): void {
        const floorHeight =
            Math.max(
                1.5,
                scale * 2
            );

        const roomColors = [
            "rgba(190, 145, 98, 0.94)",
            "rgba(196, 151, 103, 0.94)",
            "rgba(184, 137, 91, 0.94)",
            "rgba(202, 158, 108, 0.94)",
            "rgba(188, 143, 96, 0.94)",
            "rgba(198, 151, 101, 0.94)",
            "rgba(181, 134, 88, 0.94)",
            "rgba(194, 147, 99, 0.94)",
        ];

        layers.forEach((layer, index) => {
            const runs =
                this.mergeFloorRuns(
                    this.getLayerRuns(layer)
                );

            const floorColor =
                roomColors[
                    index % roomColors.length
                ];

            for (const run of runs) {
                const bottomA =
                    project({
                        x: run.xStart,
                        y: run.y,
                    });

                const bottomB =
                    project({
                        x: run.xEnd + 1,
                        y: run.y,
                    });

                const bottomC =
                    project({
                        x: run.xEnd + 1,
                        y: run.yEnd + 1,
                    });

                const bottomD =
                    project({
                        x: run.xStart,
                        y: run.yEnd + 1,
                    });

                const topA =
                    project(
                        {
                            x: run.xStart,
                            y: run.y,
                        },
                        floorHeight
                    );

                const topB =
                    project(
                        {
                            x: run.xEnd + 1,
                            y: run.y,
                        },
                        floorHeight
                    );

                const topC =
                    project(
                        {
                            x: run.xEnd + 1,
                            y: run.yEnd + 1,
                        },
                        floorHeight
                    );

                const topD =
                    project(
                        {
                            x: run.xStart,
                            y: run.yEnd + 1,
                        },
                        floorHeight
                    );

                this.quad(
                    ctx,
                    [
                        bottomA,
                        bottomB,
                        topB,
                        topA,
                    ],
                    "rgba(13, 34, 55, 0.90)"
                );

                this.quad(
                    ctx,
                    [
                        bottomB,
                        bottomC,
                        topC,
                        topB,
                    ],
                    "rgba(20, 47, 74, 0.94)"
                );

                this.quad(
                    ctx,
                    [
                        bottomD,
                        bottomC,
                        topC,
                        topD,
                    ],
                    "rgba(16, 40, 64, 0.92)"
                );

                const gradient =
                    ctx.createLinearGradient(
                        topA.x,
                        topA.y,
                        topC.x,
                        topC.y
                    );

                gradient.addColorStop(
                    0,
                    "rgba(216, 171, 122, 0.96)"
                );

                gradient.addColorStop(
                    0.45,
                    floorColor
                );

                gradient.addColorStop(
                    1,
                    "rgba(151, 108, 70, 0.96)"
                );

                this.quad(
                    ctx,
                    [
                        topA,
                        topB,
                        topC,
                        topD,
                    ],
                    gradient
                );

                ctx.strokeStyle =
                    "rgba(111, 78, 49, 0.22)";

                ctx.lineWidth =
                    Math.max(
                        0.5,
                        scale * 0.45
                    );

                this.line(
                    ctx,
                    [
                        topA,
                        topB,
                        topC,
                        topD,
                        topA,
                    ]
                );
            }
        });
    }

    private mergeFloorRuns(
        runs: WallRun[]
    ): Array<WallRun & {yEnd: number}> {
        const sorted = [...runs].sort(
            (a, b) => {
                if (a.xStart !== b.xStart) {
                    return a.xStart - b.xStart;
                }

                if (a.xEnd !== b.xEnd) {
                    return a.xEnd - b.xEnd;
                }

                return a.y - b.y;
            }
        );

        const merged: Array<
            WallRun & {yEnd: number}
        > = [];

        for (const run of sorted) {
            const previous =
                merged[merged.length - 1];

            if (
                previous &&
                run.xStart === previous.xStart &&
                run.xEnd === previous.xEnd &&
                run.y <= previous.yEnd + 1
            ) {
                previous.yEnd =
                    Math.max(
                        previous.yEnd,
                        run.y
                    );

                continue;
            }

            merged.push({
                y: run.y,
                yEnd: run.y,
                xStart: run.xStart,
                xEnd: run.xEnd,
            });
        }

        return merged;
    }

    private getLayerRuns(
        layer: RawMapData["layers"][number]
    ): WallRun[] {
        const runs: WallRun[] = [];

        if (
            layer.compressedPixels &&
            layer.compressedPixels.length > 0
        ) {
            for (
                let i = 0;
                i < layer.compressedPixels.length;
                i += 3
            ) {
                const xStart =
                    layer.compressedPixels[i];

                const y =
                    layer.compressedPixels[i + 1];

                const count =
                    layer.compressedPixels[i + 2];

                runs.push({
                    y: y,
                    xStart: xStart,
                    xEnd:
                        xStart +
                        count -
                        1,
                });
            }

            return runs;
        }

        return this.getWallRuns(layer);
    }

    private getWallRuns(
        layer: RawMapData["layers"][number]
    ): WallRun[] {
        const runs: WallRun[] = [];

        if (
            layer.pixels.length === 0 &&
            layer.compressedPixels &&
            layer.compressedPixels.length > 0
        ) {
            for (
                let i = 0;
                i < layer.compressedPixels.length;
                i += 3
            ) {
                const xStart =
                    layer.compressedPixels[i];

                const y =
                    layer.compressedPixels[i + 1];

                const count =
                    layer.compressedPixels[i + 2];

                runs.push({
                    y: y,
                    xStart: xStart,
                    xEnd:
                        xStart +
                        count -
                        1,
                });
            }

            return runs;
        }

        const rows =
            new Map<number, number[]>();

        for (
            let i = 0;
            i < layer.pixels.length;
            i += 2
        ) {
            const x =
                layer.pixels[i];

            const y =
                layer.pixels[i + 1];

            const row =
                rows.get(y) ?? [];

            row.push(x);

            rows.set(y, row);
        }

        for (const [y, xs] of rows) {
            xs.sort(
                (a, b) => a - b
            );

            let start = xs[0];
            let previous = xs[0];

            for (
                let i = 1;
                i < xs.length;
                i++
            ) {
                const current =
                    xs[i];

                if (
                    current >
                    previous + 1
                ) {
                    runs.push({
                        y: y,
                        xStart: start,
                        xEnd: previous,
                    });

                    start = current;
                }

                previous = current;
            }

            if (
                xs.length > 0
            ) {
                runs.push({
                    y: y,
                    xStart: start,
                    xEnd: previous,
                });
            }
        }

        return runs;
    }

    private drawWallRuns(
        ctx: CanvasRenderingContext2D,
        runs: WallRun[],
        project: (
            point: Point,
            z?: number
        ) => Point,
        scale: number
    ): void {
        const wallHeight =
            Math.max(
                7,
                scale * 11
            );

        const merged = this.mergeWallRuns(runs);

        for (const run of merged) {
            const bottomA =
                project({
                    x: run.xStart,
                    y: run.y,
                });

            const bottomB =
                project({
                    x: run.xEnd + 1,
                    y: run.y,
                });

            const topA =
                project(
                    {
                        x: run.xStart,
                        y: run.y,
                    },
                    wallHeight
                );

            const topB =
                project(
                    {
                        x: run.xEnd + 1,
                        y: run.y,
                    },
                    wallHeight
                );

            this.quad(
                ctx,
                [
                    bottomA,
                    bottomB,
                    topB,
                    topA,
                ],
                COLORS.wallFront
            );

            ctx.strokeStyle =
                "rgba(150, 160, 170, 0.85)";

            ctx.lineWidth =
                Math.max(
                    1,
                    scale * 1.2
                );

            this.line(
                ctx,
                [
                    topA,
                    topB,
                ]
            );
        }
    }

    private mergeWallRuns(
        runs: WallRun[]
    ): WallRun[] {
        const sorted = [...runs].sort(
            (a, b) => {
                if (a.y !== b.y) {
                    return a.y - b.y;
                }

                return a.xStart - b.xStart;
            }
        );

        const merged: WallRun[] = [];

        for (const run of sorted) {
            const previous =
                merged[merged.length - 1];

            if (
                previous &&
                run.y <= previous.y + 2 &&
                run.xStart <= previous.xEnd + 3 &&
                run.xEnd >= previous.xStart - 3
            ) {
                previous.xStart =
                    Math.min(
                        previous.xStart,
                        run.xStart
                    );

                previous.xEnd =
                    Math.max(
                        previous.xEnd,
                        run.xEnd
                    );

                previous.y =
                    Math.round(
                        (previous.y + run.y) / 2
                    );

                continue;
            }

            merged.push({
                y: run.y,
                xStart: run.xStart,
                xEnd: run.xEnd,
            });
        }

        return merged;
    }

    private drawPath(
        rawMap: RawMapData,
        project: (
            point: Point,
            z?: number
        ) => Point
    ): void {
        const paths =
            rawMap.entities.filter(
                entity =>
                    entity.type ===
                        RawMapEntityType.Path ||
                    entity.type ===
                        RawMapEntityType.PredictedPath
            );

        const ctx =
            this.ctx;

        ctx.save();

        ctx.strokeStyle =
            COLORS.route;

        ctx.shadowColor =
            "rgba(53, 167, 255, 0.9)";

        ctx.shadowBlur = 9;

        ctx.lineWidth = 2.6;

        ctx.lineCap =
            "round";

        for (const entity of paths) {
            ctx.beginPath();

            for (
                let i = 0;
                i < entity.points.length;
                i += 2
            ) {
                const point =
                    project(
                        {
                            x:
                                entity.points[i],
                            y:
                                entity.points[i + 1],
                        },
                        8
                    );

                if (i === 0) {
                    ctx.moveTo(
                        point.x,
                        point.y
                    );
                } else {
                    ctx.lineTo(
                        point.x,
                        point.y
                    );
                }
            }

            ctx.stroke();
        }

        ctx.restore();
    }

    private drawEntities(
        ctx: CanvasRenderingContext2D,
        rawMap: RawMapData,
        project: (
            point: Point,
            z?: number
        ) => Point
    ): void {
        for (
            const entity of rawMap.entities
        ) {
            if (
                entity.type ===
                RawMapEntityType.RobotPosition
            ) {
                this.drawRobot(
                    ctx,
                    entity.points[0],
                    entity.points[1],
                    project
                );
            }

            if (
                entity.type ===
                RawMapEntityType.ChargerLocation
            ) {
                this.drawMarker(
                    ctx,
                    entity.points[0],
                    entity.points[1],
                    COLORS.charger,
                    project,
                    "ESTACIÓN"
                );
            }

            if (
                entity.type ===
                RawMapEntityType.Obstacle
            ) {
                this.drawObstacle(
                    ctx,
                    entity.points[0],
                    entity.points[1],
                    entity.metaData.label,
                    project
                );
            }
        }
    }

    private drawRobot(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        project: (
            point: Point,
            z?: number
        ) => Point
    ): void {
        const point =
            project(
                {
                    x: x,
                    y: y,
                },
                18
            );

        ctx.save();

        const halo =
            ctx.createRadialGradient(
                point.x,
                point.y,
                4,
                point.x,
                point.y,
                34
            );

        halo.addColorStop(
            0,
            "rgba(50, 135, 255, 0.42)"
        );

        halo.addColorStop(
            0.45,
            "rgba(50, 135, 255, 0.20)"
        );

        halo.addColorStop(
            1,
            "rgba(50, 135, 255, 0)"
        );

        ctx.fillStyle =
            halo;

        ctx.beginPath();

        ctx.arc(
            point.x,
            point.y,
            34,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle =
            COLORS.robot;

        ctx.shadowColor =
            "rgba(80, 170, 255, 0.95)";

        ctx.shadowBlur = 14;

        ctx.beginPath();

        ctx.arc(
            point.x,
            point.y,
            8,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();
    }

    private drawMarker(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        color: string,
        project: (
            point: Point,
            z?: number
        ) => Point,
        label: string
    ): void {
        const point =
            project(
                {
                    x: x,
                    y: y,
                },
                16
            );

        ctx.save();

        ctx.fillStyle =
            color;

        ctx.shadowColor =
            color;

        ctx.shadowBlur = 12;

        ctx.beginPath();

        ctx.arc(
            point.x,
            point.y,
            7,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.shadowBlur = 0;

        ctx.font =
            "700 10px sans-serif";

        ctx.fillStyle =
            COLORS.text;

        ctx.fillText(
            label,
            point.x + 10,
            point.y + 4
        );

        ctx.restore();
    }

    private drawObstacle(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        label: string | undefined,
        project: (
            point: Point,
            z?: number
        ) => Point
    ): void {
        const point =
            project(
                {
                    x: x,
                    y: y,
                },
                20
            );

        ctx.save();

        ctx.fillStyle =
            COLORS.obstacle;

        ctx.shadowColor =
            "rgba(245, 197, 66, 0.9)";

        ctx.shadowBlur = 10;

        ctx.beginPath();

        ctx.arc(
            point.x,
            point.y,
            6,
            0,
            Math.PI * 2
        );

        ctx.fill();

        if (label) {
            ctx.shadowBlur = 0;

            ctx.font =
                "600 9px sans-serif";

            ctx.fillStyle =
                COLORS.text;

            ctx.fillText(
                label,
                point.x + 9,
                point.y + 3
            );
        }

        ctx.restore();
    }

    private drawRoomLabels(
        ctx: CanvasRenderingContext2D,
        layers: RawMapData["layers"],
        project: (
            point: Point,
            z?: number
        ) => Point
    ): void {
        ctx.save();

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        for (
            const layer of layers
        ) {
            const name =
                layer.metaData.name;

            if (!name) {
                continue;
            }

            const point =
                project(
                    {
                        x:
                            layer.dimensions.x.mid,
                        y:
                            layer.dimensions.y.mid,
                    },
                    7
                );

            ctx.font =
                "700 11px sans-serif";

            const metrics =
                ctx.measureText(name);

            const padding = 8;

            ctx.fillStyle =
                "rgba(255, 255, 255, 0.88)";

            ctx.beginPath();

            ctx.roundRect(
                point.x -
                    metrics.width / 2 -
                    padding,
                point.y - 9,
                metrics.width +
                    padding * 2,
                18,
                9
            );

            ctx.fill();

            ctx.strokeStyle =
                "rgba(100, 115, 130, 0.25)";

            ctx.stroke();

            ctx.fillStyle =
                COLORS.text;

            ctx.fillText(
                name,
                point.x,
                point.y
            );
        }

        ctx.restore();
    }

    private drawFurniture(
        ctx: CanvasRenderingContext2D,
        rawMap: RawMapData,
        project: (
            point: Point,
            z?: number
        ) => Point,
        scale: number
    ): void {
        const layout =
            this.loadLayout();

        if (!layout) {
            return;
        }

        for (const layer of rawMap.layers) {
            if (layer.type !== RawMapLayerType.Segment) {
                continue;
            }

            const name =
                layer.metaData.name;

            if (!name) {
                continue;
            }

            const room =
                layout.rooms[name];

            if (!room || !room.furniture) {
                continue;
            }

            const roomWidth =
                room.x.max - room.x.min;

            const roomHeight =
                room.y.max - room.y.min;

            for (const item of room.furniture) {
                const x =
                    room.x.min +
                    roomWidth * item.x;

                const y =
                    room.y.min +
                    roomHeight * item.y;

                const width =
                    roomWidth * item.w;

                const height =
                    roomHeight * item.h;

                this.drawFurnitureItem(
                    ctx,
                    item.type,
                    x,
                    y,
                    width,
                    height,
                    item.rotation ?? 0,
                    project,
                    scale
                );
            }
        }
    }

    private drawFurnitureItem(
        ctx: CanvasRenderingContext2D,
        type: string,
        x: number,
        y: number,
        width: number,
        height: number,
        rotation: number,
        project: (
            point: Point,
            z?: number
        ) => Point,
        scale: number
    ): void {
        const centerX =
            x + width / 2;

        const centerY =
            y + height / 2;

        const cos =
            Math.cos(
                rotation * Math.PI / 180
            );

        const sin =
            Math.sin(
                rotation * Math.PI / 180
            );

        const transformPoint = (
            px: number,
            py: number,
            z: number
        ): Point => {
            const dx =
                px - centerX;

            const dy =
                py - centerY;

            return project(
                {
                    x:
                        centerX +
                        dx * cos -
                        dy * sin,
                    y:
                        centerY +
                        dx * sin +
                        dy * cos,
                },
                z
            );
        };

        let height3D =
            Math.max(
                4,
                scale * 12
            );

        let color =
            "#8a6244";

        let topColor =
            "#b98a61";

        switch (type) {
            case "bed":
                height3D =
                    Math.max(3, scale * 6);
                color = "#8c735f";
                topColor = "#d7c1a5";
                break;

            case "sofa":
                height3D =
                    Math.max(2, scale * 4);
                color = "#5f6670";
                topColor = "#8d96a2";
                break;

            case "table":
                height3D =
                    Math.max(3, scale * 6);
                color = "#765137";
                topColor = "#b98559";
                break;

            case "tv":
                height3D =
                    Math.max(2, scale * 5);
                color = "#20252b";
                topColor = "#303842";
                break;

            case "wardrobe":
                height3D =
                    Math.max(6, scale * 12);
                color = "#75543b";
                topColor = "#a8784e";
                break;

            case "counter":
                height3D =
                    Math.max(2, scale * 4);
                color = "#747b82";
                topColor = "#c7cbd0";
                break;

            case "shower":
                height3D =
                    Math.max(2, scale * 4);
                color = "#9caeb8";
                topColor = "#dce6eb";
                break;

            case "toilet":
                height3D =
                    Math.max(2, scale * 5);
                color = "#d9dde0";
                topColor = "#ffffff";
                break;

            case "sink":
                height3D =
                    Math.max(2, scale * 5);
                color = "#bfc8ce";
                topColor = "#f5f7f8";
                break;

            case "nightstand":
            case "console":
                height3D =
                    Math.max(3, scale * 7);
                color = "#79563d";
                topColor = "#ae7c52";
                break;

            case "runner":
                height3D =
                    Math.max(1, scale * 2);
                color = "#a7744f";
                topColor = "#c28e63";
                break;

            default:
                break;
        }

        const p0 =
            transformPoint(
                x,
                y,
                0
            );

        const p1 =
            transformPoint(
                x + width,
                y,
                0
            );

        const p2 =
            transformPoint(
                x + width,
                y + height,
                0
            );

        const p3 =
            transformPoint(
                x,
                y + height,
                0
            );

        const t0 =
            transformPoint(
                x,
                y,
                height3D
            );

        const t1 =
            transformPoint(
                x + width,
                y,
                height3D
            );

        const t2 =
            transformPoint(
                x + width,
                y + height,
                height3D
            );

        const t3 =
            transformPoint(
                x,
                y + height,
                height3D
            );

        this.quad(
            ctx,
            [p0, p1, t1, t0],
            color
        );

        this.quad(
            ctx,
            [p1, p2, t2, t1],
            color
        );

        this.quad(
            ctx,
            [p3, p2, t2, t3],
            color
        );

        this.quad(
            ctx,
            [p0, p3, t3, t0],
            color
        );

        this.quad(
            ctx,
            [t0, t1, t2, t3],
            topColor
        );

        ctx.strokeStyle =
            "rgba(40, 45, 50, 0.30)";

        ctx.lineWidth =
            Math.max(
                0.6,
                scale * 0.6
            );

        this.line(
            ctx,
            [t0, t1, t2, t3, t0]
        );
    }

    private loadLayout(): X40Layout | undefined {
        try {
            const request =
                new XMLHttpRequest();

            request.open(
                "GET",
                "./x40-layout.json",
                false
            );

            request.send();

            if (
                request.status >= 200 &&
                request.status < 300
            ) {
                return JSON.parse(
                    request.responseText
                ) as X40Layout;
            }
        } catch (error) {
            return undefined;
        }

        return undefined;
    }

    private drawVignette(
        ctx: CanvasRenderingContext2D,
        options: Map3DRendererOptions
    ): void {
        const vignette =
            ctx.createRadialGradient(
                options.width / 2,
                options.height / 2,
                Math.min(
                    options.width,
                    options.height
                ) * 0.18,
                options.width / 2,
                options.height / 2,
                Math.max(
                    options.width,
                    options.height
                ) * 0.72
            );

        vignette.addColorStop(
            0,
            "rgba(255, 255, 255, 0)"
        );

        vignette.addColorStop(
            1,
            "rgba(205, 212, 218, 0.20)"
        );

        ctx.fillStyle =
            vignette;

        ctx.fillRect(
            0,
            0,
            options.width,
            options.height
        );
    }

    private quad(
        ctx: CanvasRenderingContext2D,
        points: Point[],
        fill: CanvasGradient | string
    ): void {
        ctx.fillStyle =
            fill;

        ctx.beginPath();

        ctx.moveTo(
            points[0].x,
            points[0].y
        );

        for (
            let i = 1;
            i < points.length;
            i++
        ) {
            ctx.lineTo(
                points[i].x,
                points[i].y
            );
        }

        ctx.closePath();

        ctx.fill();
    }

    private line(
        ctx: CanvasRenderingContext2D,
        points: Point[]
    ): void {
        ctx.beginPath();

        ctx.moveTo(
            points[0].x,
            points[0].y
        );

        for (
            let i = 1;
            i < points.length;
            i++
        ) {
            ctx.lineTo(
                points[i].x,
                points[i].y
            );
        }

        ctx.stroke();
    }

    private getBounds(
        rawMap: RawMapData
    ): {
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
    } {
        let minX =
            Number.POSITIVE_INFINITY;

        let minY =
            Number.POSITIVE_INFINITY;

        let maxX =
            Number.NEGATIVE_INFINITY;

        let maxY =
            Number.NEGATIVE_INFINITY;

        for (
            const layer of rawMap.layers
        ) {
            minX = Math.min(
                minX,
                layer.dimensions.x.min
            );

            minY = Math.min(
                minY,
                layer.dimensions.y.min
            );

            maxX = Math.max(
                maxX,
                layer.dimensions.x.max
            );

            maxY = Math.max(
                maxY,
                layer.dimensions.y.max
            );
        }

        return {
            minX: minX,
            minY: minY,
            maxX: maxX,
            maxY: maxY,
        };
    }
}
