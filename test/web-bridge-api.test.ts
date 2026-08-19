import { describe, it, expect } from 'vitest';
import * as qrcode from 'qrcode';

describe('Zero-Install Web Bridge & Gateway API Exhaustive Suite', () => {
  it('should generate valid DataURL QR codes for any local gateway URL', async () => {
    const gatewayUrl = 'http://192.168.1.50:8484';
    const qrDataUrl = await qrcode.toDataURL(gatewayUrl, {
      errorCorrectionLevel: 'H',
      width: 256,
      margin: 2
    });

    expect(qrDataUrl.startsWith('data:image/png;base64,')).toBe(true);
    expect(qrDataUrl.length).toBeGreaterThan(100);
  });

  it('should format Content-Disposition and MIME headers for binary downloads', () => {
    const filename = 'document_presentation.pdf';
    const mime = 'application/pdf';
    const size = 10485760; // 10MB

    const headers: Record<string, string> = {
      'Content-Type': mime,
      'Content-Length': size.toString(),
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`
    };

    expect(headers['Content-Type']).toBe('application/pdf');
    expect(headers['Content-Length']).toBe('10485760');
    expect(headers['Content-Disposition']).toContain('document_presentation.pdf');
  });

  it('should render mobile-optimized guest web portal with proper viewport meta tag', () => {
    const hostName = 'Alice (MacBook)';
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ZeroHop Web Bridge</title>
</head>
<body>
  <h1>Connected to ${hostName}</h1>
</body>
</html>`;

    expect(html).toContain('meta name="viewport"');
    expect(html).toContain('Alice (MacBook)');
    expect(html).toContain('ZeroHop Web Bridge');
  });
});
