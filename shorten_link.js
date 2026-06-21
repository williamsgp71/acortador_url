const { chromium } = require('playwright');

(async () => {
  const urlToShorten = process.argv[2];
  if (!urlToShorten) {
    console.error('Error: Por favor proporciona la URL a acortar como argumento.');
    console.log('Ejemplo: node shorten_link.js "https://example.com"');
    process.exit(1);
  }

  console.log('Iniciando navegador en modo visible (headed)...');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    const timestamp = Date.now();
    const email = `user_headed_${timestamp}@example.com`;
    const username = `headed_${timestamp}`;
    const password = `Password123!`;

    console.log(`Navegando a la página de registro...`);
    await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    console.log(`Completando el formulario de registro (usuario: ${username})...`);
    await page.locator('#email').fill(email);
    await page.waitForTimeout(500);
    await page.locator('#username').fill(username);
    await page.waitForTimeout(500);
    await page.locator('#password').fill(password);
    await page.waitForTimeout(500);
    
    console.log('Enviando registro...');
    await page.locator('button[type="submit"]').click();

    console.log('Esperando redirección al dashboard...');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.waitForTimeout(1500);

    console.log('Navegando a la página de URLs...');
    await page.goto('http://localhost:5173/urls', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    console.log(`Ingresando la URL a acortar: ${urlToShorten}`);
    const urlInput = page.locator('input[type="url"]');
    await urlInput.fill(urlToShorten);
    await page.waitForTimeout(1000);
    
    console.log('Haciendo clic en "Shorten URL"...');
    await page.locator('button:has-text("Shorten URL")').click();

    console.log('Esperando que aparezca el enlace acortado en la lista...');
    const shortLinkLocator = page.locator('button:has-text("s/")');
    await shortLinkLocator.first().waitFor({ state: 'visible', timeout: 5000 });
    
    const shortenedUrl = await shortLinkLocator.first().textContent();
    console.log('\n========================================');
    console.log('SUCCESS_URL: ' + shortenedUrl.trim());
    console.log('========================================\n');

    console.log('Manteniendo el navegador abierto por 10 segundos para visualización...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('Error durante la ejecución:', error);
    await page.waitForTimeout(5000);
  } finally {
    await browser.close();
    console.log('Navegador cerrado.');
  }
})();
