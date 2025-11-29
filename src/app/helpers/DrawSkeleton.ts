export function drawSkeleton(ctx: CanvasRenderingContext2D, landmarks: any[], width: number, height: number) {
    ctx.fillStyle = "rgba(255, 0, 0, 0.9)";
    ctx.strokeStyle = "rgba(0, 255, 0, 0.9)";
    ctx.lineWidth = 2;

    // draw points
    for (const lm of landmarks) {
        const x = (1 - lm.x) * width; // flip horizontally
        const y = lm.y * height;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    // draw connections (subset — you can extend)
    const connections = [
        // left/right shoulders to elbows to wrists
        [11, 13], [13, 15],
        [12, 14], [14, 16],
        // shoulders to hips
        [11, 23], [12, 24],
        // hips to knees to ankles
        [23, 25], [25, 27],
        [24, 26], [26, 28],
        // back / chest
        [11, 12], [23, 24]
    ];

    for (const [a, b] of connections) {
        const A = landmarks[a];
        const B = landmarks[b];
        if (!A || !B) continue;
        const ax = (1 - A.x) * width;
        const ay = A.y * height;
        const bx = (1 - B.x) * width;
        const by = B.y * height;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
    }
}