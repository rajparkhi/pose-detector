'use client';

import { useEffect, useRef } from "react";
import { drawSkeleton } from "../helpers/DrawSkeleton";

export default function PoseDetector() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let camera: any = null;

        const init = async () => {
            const video = videoRef.current!;
            const canvas = canvasRef.current!;
            const ctx = canvas.getContext("2d")!;

            /* -----------------------------
               1. Dynamic import: Camera
            ------------------------------ */
            // @ts-ignore
            const cameraUtils = await import("@mediapipe/camera_utils");
            const Camera = cameraUtils.Camera;

            /* -----------------------------
               2. Dynamic import: Pose
            ------------------------------ */
            // @ts-ignore
            const mpPose = await import("@mediapipe/pose");
            const Pose = mpPose.Pose;

            const pose = new Pose({
                locateFile: (file: string) =>
                    `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
            });

            pose.setOptions({
                modelComplexity: 1,
                smoothLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5,
            });

            /* -----------------------------
               3. Handle pose results
            ------------------------------ */
            pose.onResults((results: any) => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Draw webcam frame
                ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

                // Draw skeleton
                if (results.poseLandmarks) {
                    drawSkeleton(ctx, results.poseLandmarks, canvas.width, canvas.height);
                }
            });

            /* -----------------------------
               4. Camera feed
            ------------------------------ */
            camera = new Camera(video, {
                onFrame: async () => {
                    await pose.send({ image: video });
                },
                width: 640,
                height: 480,
            });

            camera.start();
        };

        init();

        return () => {
            camera?.stop();
        };
    }, []);

    return (
        <div style={{ position: "relative", width: 640, height: 480 }}>
            <video ref={videoRef} playsInline style={{ display: "none" }} />
            <canvas ref={canvasRef} width={640} height={480} />
        </div>
    );
}
