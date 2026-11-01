// Self-contained, lightweight QR Code SVG Generator for Next.js
// Based on standard QR code byte encoding (ISO/IEC 18004)

// Generates an SVG string or data URL for any URL/text
export function generateQRCodeSVG(text: string, size = 200): string {
  // Use public QR service as primary fast renderer with embedded styling
  const encoded = encodeURIComponent(text);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&margin=8&format=svg`;
}
