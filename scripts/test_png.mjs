import { PDFDocument } from 'pdf-lib';

async function testPng() {
  const doc = await PDFDocument.create();
  // Valid 1x1 transparent PNG
  const valid1x1Png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  console.log('Embedding 1x1 PNG...');
  const img = await doc.embedPng(valid1x1Png);
  console.log('Width:', img.width, 'Height:', img.height);
}

testPng().then(() => console.log('Done')).catch(console.error);

