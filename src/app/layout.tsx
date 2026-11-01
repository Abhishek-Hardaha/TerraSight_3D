import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TerraSight 3D Benchmark | VGGT-Ω vs DUSt3R vs Depth Anything 3 vs COLMAP',
  description: 'Rigorous empirical 3D reconstruction benchmark evaluated against authentic LiDAR ground truth datasets across dual GPUs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#09090b] text-zinc-100 min-h-screen selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}

