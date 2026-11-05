import { PDFDocument } from 'pdf-lib';

async function run() {
  console.log('Creando PDF nuevo...');
  const doc = await PDFDocument.create();
  const page = doc.addPage([600, 400]);
  page.drawText('Test');
  const bytes = await doc.save();
  console.log('Bytes guardados:', bytes.length);

  console.log('Cargando PDF válido...');
  const doc2 = await PDFDocument.load(bytes);
  console.log('Páginas cargadas:', doc2.getPageCount());
}

run().catch(console.error);

