const puppeteer = require('puppeteer');

async function main(){
  /* 1: Create and launch a new browser instance */
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: {
      width: 1400,
      height: 821
    },
  })

  /* 2: Create a new tab in the current browser context */
  const page = await browser.newPage();

  /* 3: Use the browser tab to navigate to a URL */
  await page.goto("https://www.facebook.com");

  /*4: Close the browser when tasks done */
  await browser.close();
}

main();