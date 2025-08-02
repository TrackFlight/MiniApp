<script lang="ts">
    import {onMount, tick} from "svelte";

    const { text } : {text: string} = $props();

    interface Point {
        mx: number;
        my: number;
        md: number;
        x: number;
        y: number;
        dx: number;
        dy: number;
        s: number;
        cnt: number;
        dotSize: number;
        fps: number;
        l_sec: number;
        t: number;
    }

    let canvas: HTMLCanvasElement;
    const max_d = 1;
    const fps = 30;
    const l_sec = 0.6;
    let last_render = 0;
    let points: Point[] = [];
    const interval = 1000 / fps;

    function random(x: number, y: number) {
        return x + Math.floor(Math.random() * (y + 1 - x));
    }

    function generateVector(count: number) {
        const speedMax = 8;
        const speedMin = 4;
        const lifetime = 600;
        const value = random(0, 2 * count + 2);
        const negative = value < count + 1;
        const mod = negative ? value : (value - count - 1);
        const speed = speedMin + ((speedMax - speedMin) * mod) / count;
        const max = Math.ceil(speedMax * lifetime);
        const k = speed / lifetime;
        const x = (random(0, 2 * max + 1) - max) / max;
        const y = Math.sqrt(1 - x * x) * (negative ? -1 : 1);
        return {
            dx: k * x,
            dy: k * y
        };
    }

    function resetPoint(point: Point) {
        const v = generateVector(point.cnt);
        point.x = random(point.md, point.mx - point.md);
        point.y = random(point.md, point.my - point.md);
        point.dx = v.dx;
        point.dy = v.dy;
        point.s = random(70, 90) * point.my / 3600;
    }

    function updatePoint(ctx: CanvasRenderingContext2D, point: Point) {
        const t = point.t;
        const d = point.fps * point.l_sec / 3;
        const k = 360 / point.l_sec / point.fps;
        const x = point.x + k * t * point.dx;
        const y = point.y + k * t * point.dy;
        ctx.globalAlpha = (t < d ? (t / d) : (t < d * 2 ? 1 : (d * 3 - t) / d)) * 0.95;
        ctx.beginPath();
        ctx.arc(x, y, point.s * 2, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }

    function animate(ctx: CanvasRenderingContext2D, width: number, height: number) {
        const now = +Date.now();
        if (now - last_render >= interval) {
            ctx.clearRect(0, 0, width, height);
            for (const point of points) {
                point.t++;
                if (point.t >= fps * l_sec) {
                    point.t = 0;
                    resetPoint(point);
                }
                updatePoint(ctx, point);
            }
            last_render = now;
        }
        requestAnimationFrame(() => animate(ctx, width, height));
    }

    onMount(async () => {
        await tick();
        const ctx = canvas.getContext("2d")!;

        // Draw Logic
        const dpr = window.devicePixelRatio || 1;
        const width = canvas.offsetWidth;
        const height = canvas.clientHeight;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const pointsCount = width * 120 / 100;

        points = Array.from({ length: pointsCount }, () => {
            const point = {
                mx: width,
                my: height,
                md: max_d,
                cnt: pointsCount,
                fps: fps,
                l_sec: l_sec,
                t: random(0, fps * l_sec)
            } as Point;
            resetPoint(point);
            updatePoint(ctx, point);
            return point;
        });

        animate(ctx!, width, height);
    })
</script>

<span>
    <canvas bind:this={canvas}></canvas>
    <span>{text}</span>
</span>

<style>
    span {
        position: relative;
    }

    span > span {
        visibility: hidden;
    }

    canvas {
        position: absolute;
        width: calc(100%);
        height: calc(100%);
    }
</style>