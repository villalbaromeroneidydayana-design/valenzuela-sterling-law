import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();
  const videoSrc = 'http://127.0.0.1:3000/' + encodeURI('video precentacion.mp4');
  console.log('Inspecting:', videoSrc);
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body>
        <video id="v" src="${videoSrc}" muted playsinline></video>
      </body>
    </html>
  `);
  
  const res = await page.evaluate(async () => {
    const v = document.getElementById('v');
    const getMeta = () => ({
      width: v.videoWidth,
      height: v.videoHeight,
      duration: v.duration,
      ratio: (v.videoWidth / v.videoHeight).toFixed(3),
      readyState: v.readyState
    });
    if (v.readyState >= 1) return getMeta();
    return new Promise(resolve => {
      v.onloadedmetadata = () => resolve(getMeta());
      v.onerror = (e) => resolve({ error: v.error?.message || 'Error' });
      setTimeout(() => resolve(getMeta()), 5000);
    });
  });
  console.log('Result for video precentacion.mp4:', res);
  await browser.close();
})();
