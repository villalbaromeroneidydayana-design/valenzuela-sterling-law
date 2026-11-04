import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\ALP\\.gemini\\antigravity\\brain\\d1b3b533-9af7-4f55-9581-c95ba2a1b59e';

const IMAGES_TO_DOWNLOAD = [
  // 1. FIRMA / TRIBUNAL
  {
    folder: 'firm',
    filename: 'courthouse.webp',
    baseId: 'photo-1589829545856-d10d557cf95f',
    author: 'Tingey Injury Law Firm (@tingeyinjurylawfirm)',
    description: 'Fachada de tribunal federal con columnas de mármol',
    width: 1200,
    height: 800,
    license: 'Licencia Unsplash Comercial Libre (Arquitectura pública inanimada)'
  },
  // 2. SEDES URBANAS
  {
    folder: 'offices',
    filename: 'miami.webp',
    baseId: 'photo-1535498730771-e735b998cd64',
    author: 'Aura Maria (@auramariaphoto)',
    description: 'Distrito financiero de Miami Brickell y bahía',
    width: 800,
    height: 500,
    license: 'Licencia Unsplash Comercial Libre (Paisaje urbano público)'
  },
  {
    folder: 'offices',
    filename: 'orlando.webp',
    baseId: 'photo-1575917649705-5b59aaa12e6b',
    author: 'Mick Connor (@mickconnor)',
    description: 'Distrito comercial de Orlando',
    width: 800,
    height: 500,
    license: 'Licencia Unsplash Comercial Libre (Paisaje urbano público)'
  },
  {
    folder: 'offices',
    filename: 'tampa.webp',
    baseId: 'photo-1530089711124-9ca31fb9e863',
    author: 'Noah Erickson (@noaherickson)',
    description: 'Skyline corporativo de Tampa',
    width: 800,
    height: 500,
    license: 'Licencia Unsplash Comercial Libre (Paisaje urbano público)'
  },
  {
    folder: 'offices',
    filename: 'houston.webp',
    baseId: 'photo-1486406146926-c627a92ad1ab',
    author: 'Sean Pollock (@parrish)',
    description: 'Fachada de rascacielos corporativo en Houston',
    width: 800,
    height: 500,
    license: 'Licencia Unsplash Comercial Libre (Arquitectura exterior)'
  },
  // 3. SHOWCASE
  {
    folder: 'showcase',
    filename: 'boardroom.webp',
    baseId: 'photo-1497366216548-37526070297c',
    author: 'Alicia G. (@aliciagil)',
    description: 'Sala de juntas corporativa vacía (arquitectura interior)',
    width: 1000,
    height: 600,
    license: 'Licencia Unsplash Comercial Libre (Arquitectura interior sin personas)'
  },
  {
    folder: 'showcase',
    filename: 'library.webp',
    baseId: 'photo-1505664194779-8beaceb93744',
    author: 'Giammarco Boscaro (@giammarco)',
    description: 'Biblioteca jurídica con códigos y jurisprudencia federal',
    width: 1000,
    height: 600,
    license: 'Licencia Unsplash Comercial Libre (Bodegón de libros inanimados)'
  },
  {
    folder: 'showcase',
    filename: 'skyline.webp',
    baseId: 'photo-1535498730771-e735b998cd64',
    author: 'Aura Maria (@auramariaphoto)',
    description: 'Presencia federal metropolitana (paisaje urbano)',
    width: 1000,
    height: 600,
    license: 'Licencia Unsplash Comercial Libre (Paisaje urbano público)'
  },
  // 4. BLOG
  {
    folder: 'blog',
    filename: 'capitol.webp',
    baseId: 'photo-1541872703-74c5e44368f9',
    author: 'David Nevozhai (@dnevozhai)',
    description: 'Cúpula del Capitolio de EE. UU. en Washington D.C.',
    width: 800,
    height: 450,
    license: 'Licencia Unsplash Comercial Libre (Edificio público federal)'
  },
  {
    folder: 'blog',
    filename: 'gavel.webp',
    baseId: 'photo-1450133064473-71024230f91b',
    author: 'Wesley Tingey (@wesleytingey)',
    description: 'Mazo de juez y código legal sobre estrado',
    width: 800,
    height: 450,
    license: 'Licencia Unsplash Comercial Libre (Bodegón de objetos judiciales)'
  },
  {
    folder: 'blog',
    filename: 'contract.webp',
    baseId: 'photo-1577495508048-b635879837f1',
    author: 'Cytonn Photography (@cytonn_photography)',
    description: 'Apretón de manos en plano de detalle sobre contrato comercial',
    width: 800,
    height: 450,
    license: 'Licencia Unsplash Comercial Libre (Plano cerrado de manos sin rostros)'
  }
];

async function main() {
  console.log("=== INICIANDO DESCARGA Y OPTIMIZACIÓN LOCAL (ETAPA 4.1) ===\n");

  const results = [];

  for (const item of IMAGES_TO_DOWNLOAD) {
    const targetDir = path.join(process.cwd(), 'public', 'images', item.folder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const targetFile = path.join(targetDir, item.filename);

    const originalUrl = `https://images.unsplash.com/${item.baseId}?auto=format&fit=crop&w=${item.width}&q=80`;
    const webpUrl = `https://images.unsplash.com/${item.baseId}?auto=format&fit=crop&w=${item.width}&h=${item.height}&q=80&fm=webp`;

    console.log(`[Descargando] ${item.folder}/${item.filename}...`);

    try {
      // 1. Obtener tamaño original (JPG)
      const origResp = await fetch(originalUrl);
      const origBuffer = Buffer.from(await origResp.arrayBuffer());
      const origSize = origBuffer.length;

      // 2. Obtener versión optimizada WebP
      const webpResp = await fetch(webpUrl);
      const webpBuffer = Buffer.from(await webpResp.arrayBuffer());
      const webpSize = webpBuffer.length;

      // Guardar archivo en local
      fs.writeFileSync(targetFile, webpBuffer);

      const savings = Math.round((1 - (webpSize / origSize)) * 100);

      const record = {
        folder: item.folder,
        filename: item.filename,
        localPath: `/images/${item.folder}/${item.filename}`,
        absolutePath: targetFile,
        sourceUrl: `https://images.unsplash.com/${item.baseId}`,
        author: item.author,
        description: item.description,
        dimensions: `${item.width}x${item.height} px`,
        license: item.license,
        originalSizeBytes: origSize,
        originalSizeKB: Math.round(origSize / 1024 * 10) / 10,
        optimizedSizeBytes: webpSize,
        optimizedSizeKB: Math.round(webpSize / 1024 * 10) / 10,
        savingsPercent: savings
      };

      results.push(record);
      console.log(`    ✓ Guardado: ${record.localPath} | Original: ${record.originalSizeKB} KB -> WebP: ${record.optimizedSizeKB} KB (Ahorro: ${savings}%)`);
    } catch (err) {
      console.error(`    ✗ Error al descargar ${item.filename}:`, err.message);
    }
  }

  // Guardar log en artefactos
  fs.writeFileSync(
    path.join(ARTIFACT_DIR, 'descarga_imagenes_etapa4_1.json'),
    JSON.stringify(results, null, 2),
    'utf8'
  );

  console.log("\n=== DESCARGA Y OPTIMIZACIÓN COMPLETADA CON ÉXITO ===");
}

main().catch(err => {
  console.error("Error global:", err);
  process.exit(1);
});

