import fs from 'fs';
import path from 'path';
import http from 'http';
import { execSync } from 'child_process';

const ARTIFACT_DIR = 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e';
const results = {
  stage: '4.2',
  timestamp: new Date().toISOString(),
  tests: {},
  summary: { total: 9, passed: 0, failed: 0 }
};

function recordTest(id, name, status, details) {
  results.tests[id] = { name, status, details };
  if (status === 'PASS') {
    results.summary.passed++;
  } else {
    results.summary.failed++;
  }
  console.log(`[${status}] ${id}: ${name}`);
}

async function fetchHttp(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      resolve({ status: res.statusCode, headers: res.headers });
    }).on('error', (err) => {
      resolve({ status: 0, error: err.message });
    });
  });
}

async function main() {
  console.log('--- INICIANDO VERIFICACIÓN DE ETAPA 4.2 ---');

  // PRUEBA 1: Existencia y formato de los cuatro recursos
  const requiredFiles = [
    { path: 'public/favicon.svg', expectedExt: '.svg' },
    { path: 'public/favicon.ico', expectedExt: '.ico' },
    { path: 'public/apple-touch-icon.png', expectedExt: '.png' },
    { path: 'public/images/og-card-demo.png', expectedExt: '.png' }
  ];
  let filesExist = true;
  const fileDetails = {};
  for (const f of requiredFiles) {
    const exists = fs.existsSync(f.path);
    const size = exists ? fs.statSync(f.path).size : 0;
    fileDetails[f.path] = { exists, size, ext: path.extname(f.path) };
    if (!exists || size === 0 || path.extname(f.path) !== f.expectedExt) {
      filesExist = false;
    }
  }
  recordTest('TEST-1', 'Existencia y formato de los cuatro recursos', filesExist ? 'PASS' : 'FAIL', fileDetails);

  // PRUEBA 2: Dimensiones exactas de los archivos PNG
  // Using python PIL to inspect dimensions
  let dimensionsPass = false;
  let dimDetails = {};
  try {
    const pyOutput = execSync('python -c "from PIL import Image; a=Image.open(\'public/apple-touch-icon.png\'); b=Image.open(\'public/images/og-card-demo.png\'); print(f\'{a.size[0]}x{a.size[1]}|{b.size[0]}x{b.size[1]}\')"', { encoding: 'utf8' }).trim();
    const [appleDim, ogDim] = pyOutput.split('|');
    dimDetails = {
      'apple-touch-icon.png': { actual: appleDim, expected: '180x180' },
      'og-card-demo.png': { actual: ogDim, expected: '1200x630' }
    };
    if (appleDim === '180x180' && ogDim === '1200x630') {
      dimensionsPass = true;
    }
  } catch (err) {
    dimDetails = { error: err.message };
  }
  recordTest('TEST-2', 'Dimensiones exactas de los archivos PNG', dimensionsPass ? 'PASS' : 'FAIL', dimDetails);

  // PRUEBA 3: Integridad y validez del SVG e ICO
  let integrityPass = false;
  let integrityDetails = {};
  try {
    const svgContent = fs.readFileSync('public/favicon.svg', 'utf8');
    const svgValid = svgContent.includes('<svg') && svgContent.includes('</svg>') && svgContent.includes('#0D3B36') && svgContent.includes('#A67C52');
    const pyIcoOutput = execSync('python -c "from PIL import Image; ico=Image.open(\'public/favicon.ico\'); print(ico.format, getattr(ico, \'info\', {}).get(\'sizes\', \'unknown\'))"', { encoding: 'utf8' }).trim();
    integrityDetails = {
      svg: { valid: svgValid, size: svgContent.length },
      ico: { valid: pyIcoOutput.startsWith('ICO'), details: pyIcoOutput }
    };
    if (svgValid && pyIcoOutput.startsWith('ICO')) {
      integrityPass = true;
    }
  } catch (err) {
    integrityDetails = { error: err.message };
  }
  recordTest('TEST-3', 'Integridad y validez del SVG e ICO', integrityPass ? 'PASS' : 'FAIL', integrityDetails);

  // PRUEBA 4: Carga HTTP 200 de los recursos locales
  const urls = [
    'http://127.0.0.1:3000/favicon.svg',
    'http://127.0.0.1:3000/favicon.ico',
    'http://127.0.0.1:3000/apple-touch-icon.png',
    'http://127.0.0.1:3000/images/og-card-demo.png'
  ];
  let httpPass = true;
  const httpDetails = {};
  for (const url of urls) {
    const res = await fetchHttp(url);
    httpDetails[url] = { status: res.status, contentType: res.headers ? res.headers['content-type'] : null };
    if (res.status !== 200) {
      httpPass = false;
    }
  }
  recordTest('TEST-4', 'Carga HTTP 200 de los recursos locales', httpPass ? 'PASS' : 'FAIL', httpDetails);

  // PRUEBA 5: Presencia y ausencia de duplicados en metadatos
  const indexHtml = fs.readFileSync('index.html', 'utf8');
  const countOccurrences = (str, regex) => (str.match(regex) || []).length;
  const metadataChecks = {
    titleCount: countOccurrences(indexHtml, /<title>/gi),
    descCount: countOccurrences(indexHtml, /name="description"/gi),
    viewportCount: countOccurrences(indexHtml, /name="viewport"/gi),
    charsetCount: countOccurrences(indexHtml, /charset=/gi),
    robotsCount: countOccurrences(indexHtml, /name="robots"/gi),
    ogTitleCount: countOccurrences(indexHtml, /property="og:title"/gi),
    ogDescCount: countOccurrences(indexHtml, /property="og:description"/gi),
    ogImageCount: countOccurrences(indexHtml, /property="og:image"/gi),
    twitterCardCount: countOccurrences(indexHtml, /name="twitter:card"/gi),
    hasSecureUrl: indexHtml.includes('og:image:secure_url')
  };
  const metaDuplicatesPass = (
    metadataChecks.titleCount === 1 &&
    metadataChecks.descCount === 1 &&
    metadataChecks.viewportCount === 1 &&
    metadataChecks.charsetCount === 1 &&
    metadataChecks.robotsCount === 1 &&
    metadataChecks.ogTitleCount === 1 &&
    metadataChecks.ogDescCount === 1 &&
    metadataChecks.ogImageCount === 1 &&
    metadataChecks.twitterCardCount === 1 &&
    !metadataChecks.hasSecureUrl
  );
  recordTest('TEST-5', 'Presencia y ausencia de duplicados en metadatos', metaDuplicatesPass ? 'PASS' : 'FAIL', metadataChecks);

  // PRUEBA 6: Conservación de noindex, nofollow
  const robotsMatch = indexHtml.match(/<meta\s+name="robots"\s+content="([^"]+)"/i);
  const robotsPass = robotsMatch && robotsMatch[1].trim() === 'noindex, nofollow';
  recordTest('TEST-6', 'Conservación de noindex, nofollow', robotsPass ? 'PASS' : 'FAIL', { content: robotsMatch ? robotsMatch[1] : null });

  // PRUEBA 7: Comparación mediante Git Diff para demostrar que el BODY no cambió
  let bodyUnchanged = false;
  let bodyDiffDetails = {};
  try {
    const diff = execSync('git diff --no-index index.html.bak_stage4_2 index.html', { encoding: 'utf8' });
    const touchesBody = diff.includes('<body') || diff.includes('selection:text-legal-navy');
    bodyDiffDetails = { touchesBody, diffLines: diff.split('\n').length };
    bodyUnchanged = !touchesBody;
  } catch (err) {
    // git diff returns exit code 1 when differences exist
    const diff = err.stdout || '';
    const touchesBody = diff.includes('<body') || diff.includes('selection:text-legal-navy') || diff.includes('overflow-x-hidden');
    bodyDiffDetails = { touchesBody, diffLength: diff.length };
    bodyUnchanged = !touchesBody;
  }
  recordTest('TEST-7', 'Comparación mediante Git Diff para demostrar que el BODY no cambió', bodyUnchanged ? 'PASS' : 'FAIL', bodyDiffDetails);

  // PRUEBA 8: Integridad de todos los archivos protegidos
  const protectedFiles = [
    'src/components/Hero.jsx',
    'src/components/Header.jsx',
    'src/components/Footer.jsx',
    'src/components/PracticeAreas.jsx',
    'src/components/EligibilityEvaluator.jsx',
    'src/components/AboutFirm.jsx',
    'src/components/OfficeLocations.jsx',
    'src/components/BlogPreview.jsx',
    'src/components/VideoShowcase.jsx',
    'src/data/demoData.js',
    'server/apiMiddleware.js',
    'server_data/call_requests_vault.jsonl',
    'server_data/leads_vault.jsonl',
    'server_data/evaluations_vault.jsonl',
    // Stage 4.1 Images
    'public/images/firm/courthouse.webp',
    'public/images/offices/miami.webp',
    'public/images/offices/orlando.webp',
    'public/images/offices/tampa.webp',
    'public/images/offices/houston.webp',
    'public/images/showcase/boardroom.webp',
    'public/images/showcase/library.webp',
    'public/images/showcase/skyline.webp',
    'public/images/blog/capitol.webp',
    'public/images/blog/contract.webp',
    'public/images/blog/gavel.webp'
  ];
  let protectedPass = true;
  const protectedDetails = {};
  for (const pf of protectedFiles) {
    const exists = fs.existsSync(pf);
    protectedDetails[pf] = { exists };
    if (!exists) protectedPass = false;
  }
  // Check that synthetic record VS-EVAL-474783 is intact
  const vaultPath = 'server_data/evaluations_vault.jsonl';
  const vaultContent = fs.existsSync(vaultPath) ? fs.readFileSync(vaultPath, 'utf8') : '';
  const synthExists = vaultContent.includes('VS-EVAL-474783');
  protectedDetails['VS-EVAL-474783 in evaluations_vault.jsonl'] = { exists: synthExists };
  if (!synthExists) protectedPass = false;

  recordTest('TEST-8', 'Integridad de todos los archivos protegidos', protectedPass ? 'PASS' : 'FAIL', protectedDetails);

  // PRUEBA 9: npm run build sin errores
  let buildPass = false;
  let buildDetails = {};
  try {
    console.log('Compilando proyecto (npm run build)...');
    const buildOutput = execSync('npm run build', { encoding: 'utf8' });
    buildPass = true;
    buildDetails = { output: buildOutput.split('\n').slice(-10).join('\n') };
  } catch (err) {
    buildDetails = { error: err.message, output: err.stdout };
  }
  recordTest('TEST-9', 'npm run build sin errores', buildPass ? 'PASS' : 'FAIL', buildDetails);

  // Write JSON report to artifact dir
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verificacion_etapa4_2_resultados.json'), JSON.stringify(results, null, 2), 'utf8');
  console.log(`\nRESUMEN FINAL: ${results.summary.passed}/9 pruebas superadas (${results.summary.failed} fallidas).`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
