'use client'
import Head from "next/head";
import dynamic from "next/dynamic";



const PoseDetector = dynamic(() => import("./components/PoseDetector"), { ssr: false });

export default function Home() {
  return (
    <>
      <Head>
        <title>Realtime Pose — Next.js</title>
      </Head>
      <main style={{ display: "flex", gap: 20, padding: 20 }}>
        <div>
          <h2>Realtime Pose Detection</h2>
          <PoseDetector />
        </div>
        <aside style={{ maxWidth: 300 }}>
          <h3>Controls</h3>
          <p>We’ll add settings (model complexity, enable/disable smoothing) here in the next step.</p>
        </aside>
      </main>
    </>
  );
}
