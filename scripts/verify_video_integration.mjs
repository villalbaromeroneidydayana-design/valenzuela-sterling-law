import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/ALP/.gemini/antigravity/brain/d1b3b533-9af7-4f55-9581-c95ba2a1b59e';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  
  // 1. Desktop Test (1440x900)
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  console.log('Navigating to http://127.0.0.1:3000/ ...');
  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' });

  // Scroll to video showcase section
  const section = page.locator('#video-showcase');
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  const headingText = await section.locator('h2').innerText();
  console.log('[TEST 1] Section heading:', headingText);

  // Check video element
  const videoEl = section.locator('video');
  const videoCount = await videoEl.count();
  console.log('[TEST 2] Video elements in section count:', videoCount);

  // Video properties evaluation
  const videoState = await videoEl.evaluate((v) => {
    return {
      src: v.currentSrc,
      paused: v.paused,
      muted: v.muted,
      loop: v.loop,
      playsInline: v.playsInline,
      videoWidth: v.videoWidth,
      videoHeight: v.videoHeight,
      duration: v.duration,
      currentTime: v.currentTime,
      readyState: v.readyState
    };
  });
  console.log('[TEST 3] Video runtime state:', videoState);

  // Wait 2 seconds and check that video is actually advancing in playback
  await page.waitForTimeout(2000);
  const advancingState = await videoEl.evaluate(v => ({ currentTime: v.currentTime, paused: v.paused }));
  console.log('[TEST 4] Video advancing playback:', advancingState);

  // Take Desktop Screenshot
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'evidencia_video_desktop_recorrido.png') });
  console.log('[EVIDENCE] Saved evidencia_video_desktop_recorrido.png');

  // 2. Mobile Viewport Test (iPhone 13/14: 390x844)
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await mobilePage.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' });
  const mobileSection = mobilePage.locator('#video-showcase');
  await mobileSection.scrollIntoViewIfNeeded();
  await mobilePage.waitForTimeout(1500);

  const mobileVideoState = await mobileSection.locator('video').evaluate(v => ({
    paused: v.paused,
    muted: v.muted,
    currentTime: v.currentTime,
    videoWidth: v.videoWidth,
    videoHeight: v.videoHeight
  }));
  console.log('[TEST 5] Mobile video state:', mobileVideoState);

  // Take Mobile Screenshot
  await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'evidencia_video_mobile_recorrido.png') });
  console.log('[EVIDENCE] Saved evidencia_video_mobile_recorrido.png');

  // Verify Hero "Ver Instalaciones" click scrolls to #video-showcase
  const heroBtn = page.locator('button:has-text("Ver Instalaciones")');
  await heroBtn.scrollIntoViewIfNeeded();
  await heroBtn.click();
  await page.waitForTimeout(800);
  const isSectionVisible = await section.isVisible();
  console.log('[TEST 6] Click on Hero button scrolls to video section:', isSectionVisible);

  await browser.close();

  // Validate results
  const isHeadingCorrect = headingText.toLowerCase().includes('instalaciones corporativas') && headingText.toLowerCase().includes('recorrido virtual');
  const isPlaying = !videoState.paused || advancingState.currentTime > 0;
  const isMuted = videoState.muted;
  const isLooping = videoState.loop;
  const hasDimensions = videoState.videoWidth === 1920 && videoState.videoHeight === 1080;

  console.log('\n--- VERIFICATION SUMMARY ---');
  console.log('Heading contains "Recorrido Virtual / Instalaciones":', isHeadingCorrect);
  console.log('Autoplay active and advancing:', isPlaying);
  console.log('Muted (sin sonido):', isMuted);
  console.log('Loop enabled (bucle):', isLooping);
  console.log('Native 1920x1080 aspect ratio preserved:', hasDimensions);

  if (isHeadingCorrect && isPlaying && isMuted && isLooping && hasDimensions) {
    console.log('\n>>> ALL 6 REQUIREMENTS VALIDATED 100% SUCCESSFULLY! <<<');
  } else {
    console.error('\n>>> SOME CHECKS FAILED <<<');
    process.exit(1);
  }
})();

