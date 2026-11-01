import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Photorealistic Single-Image 3D Reconstruction",
  description: "Dual-stage diffusion & 3D Gaussian Splats interactive studio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#09090b] text-zinc-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
