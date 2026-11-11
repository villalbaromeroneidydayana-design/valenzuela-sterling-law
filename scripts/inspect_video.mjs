import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();
  const videoSrc = 'http://127.0.0.1:3000/' + encodeURI('VALENZUELA & STERLING IMMIGRATION LAW GROUP, P.A..mp4');
  console.log('Testing videoSrc:', videoSrc);
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body>
        <video id="v" src="${videoSrc}" autoplay muted loop playsinline></video>
      </body>
    </html>
  `);
  
  const res = await page.evaluate(async () => {
    const v = document.getElementById('v');
    return new Promise(resolve => {
      if (v.readyState >= 1) {
        resolve({ width: v.videoWidth, height: v.videoHeight, duration: v.duration, paused: v.paused });
      }
      v.onloadedmetadata = () => {
        resolve({ width: v.videoWidth, height: v.videoHeight, duration: v.duration, paused: v.paused });
      };
      v.onerror = (e) => resolve({ error: v.error?.message || 'Error loading video' });
      setTimeout(() => resolve({ timeout: true, readyState: v.readyState, paused: v.paused }), 8000);
    });
  });
  console.log('Video metadata:', res);
  await browser.close();
})();

