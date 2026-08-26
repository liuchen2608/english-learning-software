import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
await page.screenshot({ path: '/Users/m4air/Documents/ChatGPT/英语学习软件开发/ppt-build/screenshots/home.png' });
await page.getByRole('button', { name: '场景训练' }).click();
await page.waitForTimeout(450);
await page.screenshot({ path: '/Users/m4air/Documents/ChatGPT/英语学习软件开发/ppt-build/screenshots/lesson.png' });
await page.getByRole('button', { name: '知识库' }).click();
await page.waitForTimeout(450);
await page.screenshot({ path: '/Users/m4air/Documents/ChatGPT/英语学习软件开发/ppt-build/screenshots/library.png' });
await browser.close();
