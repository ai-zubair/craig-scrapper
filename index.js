const puppeteer = require('puppeteer');
const cheerio = require("cheerio");
const fs = require("fs");

async function main(){
  /* 1: Create and launch a new browser instance */
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: 1400,
      height: 821
    },
  })

  /* 2: Create a new tab in the current browser context */
  const page = await browser.newPage();

  /* 3: Use the browser tab to navigate to a URL */
  await page.goto("https://sfbay.craigslist.org/d/software-qa-dba-etc/search/sof");

  /* Get the HTML of the page as a string */
  const pageHTMLString = await page.content();

  /* Parse the HTML string into markup structure for the server */
  const $ = cheerio.load(pageHTMLString);

  /*Use jQuery based syntax to traverse the parsed markup and scrape the desired data */
  const results = $(".result-info").map((index,element)=>{
    return {
      title: $(element).find(".result-title").text(),
      descriptionURL: $(element).find(".result-title").attr("href"),
      postDate: new Date($(element).find(".result-date").attr("datetime")),
      location: $(element).find(".result-hood").text() ||"Not available"
    }
  }).get();
  
  /* write the scraped results to a file */
  fs.writeFileSync("results.json",JSON.stringify(results,undefined,2));

  /*4: Close the browser when tasks done */
  await browser.close();
}

main();