import fs from 'fs';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { stampSignatureOnPdf } from '../server/pdfSigner.js';

// Valid 1x1 base64 PNG
const samplePngBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

async function test() {
  console.log('Probando incorporación de firma manuscrita a PDF...');
  
  // Generar un PDF válido de prueba
  const originalDoc = await PDFDocument.create();
  const page = originalDoc.addPage([612, 792]);
  const font = await originalDoc.embedFont(StandardFonts.Helvetica);
  page.drawText('VALENZUELA & STERLING IMMIGRATION LAW GROUP, P.A.', { x: 50, y: 720, size: 14, font });
  page.drawText('CONTRATO DE SERVICIOS Y RETENCION LEGAL DE ASILO', { x: 50, y: 690, size: 12, font });
  page.drawText('Por medio de la presente, el cliente autoriza la representacion ante USCIS / EOIR.', { x: 50, y: 660, size: 10, font });
  const samplePdf = Buffer.from(await originalDoc.save());

  const res = await stampSignatureOnPdf(samplePdf, samplePngBase64, {
    caseNumber: 'VS-TEST-2026-9001',
    clientName: 'Carlos Mendez (Cliente de Prueba)',
    docName: 'Contrato_Retencion_Servicios.pdf',
    signedAt: new Date().toISOString(),
    ipAddress: '190.24.120.55'
  });

  console.log('Original SHA-256:', res.originalSha256);
  console.log('Signed SHA-256:', res.signedSha256);
  console.log('Signed Buffer Length:', res.signedPdfBuffer.length);

  const verifyDoc = await PDFDocument.load(res.signedPdfBuffer);
  console.log('Total páginas del PDF firmado:', verifyDoc.getPageCount());

  if (verifyDoc.getPageCount() === 2 && res.signedSha256) {
    console.log('✓ TEST PASSED: Firma manuscrita incorporada correctamente en PDF');
  } else {
    console.error('✗ TEST FAILED');
    process.exit(1);
  }
}

test().catch(err => {
  console.error('Error en prueba de firma:', err);
  process.exit(1);
});
