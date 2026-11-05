import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { computeSha256 } from './securityCrypto.js';

/**
 * Incorpora la firma manuscrita digitalizada del cliente a un documento PDF,
 * añadiendo una foja de constancia y suscripción con el trazo real, metadatos,
 * sellos de tiempo y hashes criptográficos de integridad.
 * 
 * @param {Buffer} originalPdfBuffer - Buffer del documento PDF original
 * @param {string} signatureDataUrl - Imagen base64 (data:image/png;base64,...) del trazo manuscrito
 * @param {Object} metadata - Datos del firmante y del expediente
 * @returns {Promise<{ signedPdfBuffer: Buffer, signedSha256: string, originalSha256: string }>}
 */
export async function stampSignatureOnPdf(originalPdfBuffer, signatureDataUrl, metadata) {
  const originalSha256 = computeSha256(originalPdfBuffer);
  
  let pdfDoc;
  try {
    pdfDoc = await PDFDocument.load(originalPdfBuffer);
  } catch (err) {
    // Si el archivo original no era un PDF válido (ej. texto o placeholder), creamos un nuevo PDF contenedor
    pdfDoc = await PDFDocument.create();
    const fallbackPage = pdfDoc.addPage([612, 792]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    fallbackPage.drawText('DOCUMENTO ORIGINAL REGISTRADO EN EL EXPEDIENTE:', { x: 50, y: 720, size: 12, font });
    const contentText = originalPdfBuffer.toString('utf8').slice(0, 1000);
    fallbackPage.drawText(contentText, { x: 50, y: 690, size: 10, font, lineHeight: 14, maxWidth: 512 });
  }

  // Extraer los bytes de la firma desde el DataURL
  const base64Data = signatureDataUrl.replace(/^data:image\/\w+;base64,/, '');
  const signatureBytes = Buffer.from(base64Data, 'base64');
  const signatureImage = await pdfDoc.embedPng(signatureBytes);

  // Dimensiones de la imagen de la firma (máximo ancho 240, altura proporcional)
  const sigDims = signatureImage.scale(0.5);
  const maxSigW = 220;
  const maxSigH = 70;
  let finalSigW = sigDims.width;
  let finalSigH = sigDims.height;
  if (finalSigW > maxSigW) {
    const scale = maxSigW / finalSigW;
    finalSigW = maxSigW;
    finalSigH = finalSigH * scale;
  }
  if (finalSigH > maxSigH) {
    const scale = maxSigH / finalSigH;
    finalSigH = maxSigH;
    finalSigW = finalSigW * scale;
  }

  // Añadir Hoja Oficial de Constancia de Suscripción Manuscrita Digital
  const page = pdfDoc.addPage([612, 792]); // Standard US Letter
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const primaryNavy = rgb(11 / 255, 30 / 255, 61 / 255);     // #0B1E3D
  const goldAccent = rgb(184 / 255, 134 / 255, 11 / 255);    // #B8860B
  const textDark = rgb(30 / 255, 41 / 255, 59 / 255);        // #1E293B
  const textMuted = rgb(100 / 255, 116 / 255, 139 / 255);   // #64748B
  const borderGrey = rgb(226 / 255, 232 / 255, 240 / 255);  // #E2E8F0
  const bgLight = rgb(248 / 255, 250 / 255, 252 / 255);     // #F8FAFC

  // Marco decorativo institucional
  page.drawRectangle({
    x: 36,
    y: 36,
    width: 540,
    height: 720,
    borderColor: primaryNavy,
    borderWidth: 1.5,
  });

  page.drawRectangle({
    x: 40,
    y: 40,
    width: 532,
    height: 712,
    borderColor: borderGrey,
    borderWidth: 0.5,
  });

  // Franja Superior del Bufete
  page.drawRectangle({
    x: 40,
    y: 690,
    width: 532,
    height: 62,
    color: primaryNavy,
  });

  page.drawText('VALENZUELA & STERLING IMMIGRATION LAW GROUP, P.A.', {
    x: 55,
    y: 730,
    size: 13,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText('PORTAL SEGURO DE CLIENTES — FOJA OFICIAL DE SUSCRIPCIÓN MANUSCRITA', {
    x: 55,
    y: 708,
    size: 9,
    font: fontRegular,
    color: rgb(226 / 255, 232 / 255, 240 / 255),
  });

  // Título de la Constancia
  page.drawText('CONSTANCIA DE FIRMA Y CONFORMIDAD DOCUMENTAL', {
    x: 55,
    y: 660,
    size: 12,
    font: fontBold,
    color: textDark,
  });

  page.drawText('La presente foja certifica la recepción y suscripción del documento por parte del titular del expediente.', {
    x: 55,
    y: 644,
    size: 9,
    font: fontRegular,
    color: textMuted,
  });

  // Tabla / Caja de Datos del Expediente y Documento
  page.drawRectangle({
    x: 55,
    y: 490,
    width: 502,
    height: 140,
    color: bgLight,
    borderColor: borderGrey,
    borderWidth: 1,
  });

  const rowH = 26;
  const startY = 612;

  const fields = [
    { label: 'Número de Expediente:', val: metadata.caseNumber || 'N/A' },
    { label: 'Titular / Firmante:', val: metadata.clientName || 'Cliente del Despacho' },
    { label: 'Documento Firmado:', val: metadata.docName || 'Documento Legal' },
    { label: 'Fecha y Hora de Suscripción:', val: metadata.signedAt || new Date().toISOString() },
    { label: 'Dirección IP de Registro:', val: metadata.ipAddress || '127.0.0.1' }
  ];

  fields.forEach((f, idx) => {
    const yPos = startY - (idx * rowH);
    page.drawText(f.label, {
      x: 70,
      y: yPos,
      size: 9.5,
      font: fontBold,
      color: textDark,
    });
    page.drawText(String(f.val), {
      x: 230,
      y: yPos,
      size: 9.5,
      font: fontRegular,
      color: textDark,
    });
  });

  // Sección del Trazo Manuscrito
  page.drawText('TRAZO MANUSCRITO REGISTRADO POR EL CLIENTE:', {
    x: 55,
    y: 465,
    size: 10,
    font: fontBold,
    color: textDark,
  });

  // Caja para la firma
  page.drawRectangle({
    x: 55,
    y: 350,
    width: 502,
    height: 105,
    color: rgb(1, 1, 1),
    borderColor: borderGrey,
    borderWidth: 1,
  });

  // Línea guía de firma
  page.drawLine({
    start: { x: 80, y: 385 },
    end: { x: 380, y: 385 },
    thickness: 1,
    color: rgb(203 / 255, 213 / 255, 225 / 255),
  });

  page.drawText('X ____________________________________________________', {
    x: 80,
    y: 370,
    size: 9,
    font: fontRegular,
    color: textMuted,
  });

  page.drawText(`Firma de: ${metadata.clientName || 'Titular'}`, {
    x: 80,
    y: 356,
    size: 8,
    font: fontRegular,
    color: textMuted,
  });

  // Estampar la imagen de la firma manuscrita sobre la línea
  page.drawImage(signatureImage, {
    x: 110,
    y: 388,
    width: finalSigW,
    height: finalSigH,
  });

  // Sello Criptográfico e Integridad SHA-256
  page.drawRectangle({
    x: 55,
    y: 200,
    width: 502,
    height: 130,
    color: bgLight,
    borderColor: borderGrey,
    borderWidth: 1,
  });

  page.drawText('TRAZABILIDAD Y REGISTRO CRIPTOGRÁFICO DE INTEGRIDAD', {
    x: 70,
    y: 310,
    size: 9.5,
    font: fontBold,
    color: goldAccent,
  });

  page.drawText('Hash SHA-256 del Documento Original:', {
    x: 70,
    y: 290,
    size: 8,
    font: fontBold,
    color: textDark,
  });

  page.drawText(originalSha256, {
    x: 70,
    y: 278,
    size: 7.5,
    font: fontRegular,
    color: textMuted,
  });

  page.drawText('Hash SHA-256 de la Firma Capturada (PNG Trazo):', {
    x: 70,
    y: 256,
    size: 8,
    font: fontBold,
    color: textDark,
  });

  const sigSha256 = computeSha256(signatureBytes);
  page.drawText(sigSha256, {
    x: 70,
    y: 244,
    size: 7.5,
    font: fontRegular,
    color: textMuted,
  });

  page.drawText(`Identificador Unívoco de Constancia: VS-SIG-${Date.now()}-${metadata.caseNumber || 'CASE'}`, {
    x: 70,
    y: 218,
    size: 8,
    font: fontBold,
    color: primaryNavy,
  });

  // Descargo Ético y Legal
  page.drawText('AVISO LEGAL Y NOTA DE VALIDEZ DE SUSCRIPCIÓN:', {
    x: 55,
    y: 175,
    size: 8,
    font: fontBold,
    color: textDark,
  });

  const disclaimerLines = [
    '1. El cliente reconoce haber revisado íntegramente el contenido del documento antes de estampar su trazo.',
    '2. Esta constancia acredita la suscripción manuscrita digitalizada para uso interno y procesal del expediente en Valenzuela & Sterling.',
    '3. No se presenta como firma digital basada en certificado cualificado de PKI de terceros, sino como acto de conformidad voluntaria.',
    '4. El documento original inalterado permanece archivado en la bóveda privada criptográfica del bufete.'
  ];

  disclaimerLines.forEach((line, idx) => {
    page.drawText(line, {
      x: 55,
      y: 160 - (idx * 13),
      size: 7.5,
      font: fontRegular,
      color: textMuted,
    });
  });

  // Pie de Página
  page.drawText('Valenzuela & Sterling Immigration Law Group, P.A. • Bóveda Segura de Expedientes Migratorios • Miami • Orlando • Houston • New York', {
    x: 65,
    y: 50,
    size: 7,
    font: fontRegular,
    color: textMuted,
  });

  const signedBytes = await pdfDoc.save();
  const signedBuffer = Buffer.from(signedBytes);
  const signedSha256 = computeSha256(signedBuffer);

  return {
    signedPdfBuffer: signedBuffer,
    signedSha256,
    originalSha256,
  };
}

