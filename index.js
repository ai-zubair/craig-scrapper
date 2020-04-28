const puppeteer = require('puppeteer');
const cheerio = require("cheerio");
const fs = require("fs");

main();//

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
  const jobListings = await getJobListings(page,"https://sfbay.craigslist.org/d/software-qa-dba-etc/search/sof");
  await getLisitingDescription(page,jobListings);

  /*4: Close the browser when tasks done */
  browser.close();


  fs.writeFileSync("results.json",JSON.stringify(jobListings,undefined,2));
}

async function getJobListings(browserPage, listingURL){

  await browserPage.goto(listingURL);

  /* Get the HTML of the page as a string */
  const pageHTMLString = await browserPage.content();

  /* Parse the HTML string into markup structure for the server */
  const $ = cheerio.load(pageHTMLString);

  /*Use jQuery based syntax to traverse the parsed markup and scrape the desired data */
  const jobListings = $(".result-info").map((index,element)=>{
    return {
      title: $(element).find(".result-title").text(),
      descriptionURL: $(element).find(".result-title").attr("href"),
      postDate: new Date($(element).find(".result-date").attr("datetime")),
      location: $(element).find(".result-hood").text() ||"Not available"
    }
  }).get();

  return jobListings;

}

async function getLisitingDescription(browserPage, jobListings){
  for (let i = 0; i < jobListings.length; i++) {
    await browserPage.goto(jobListings[i].descriptionURL);
    const descriptionPageHTML = await browserPage.content();
    const $ =  cheerio.load(descriptionPageHTML); 
    jobListings[i].jobDescription = $("#postingbody").text() || "Description not available!";
    jobListings[i].compensation = $("section.body section.userbody .mapAndAttrs p.attrgroup span:nth-child(1) b").text() || "Not available";
    await sleep(1000)//wait 1s before next request
  }
}

function sleep(timeInMilliseconds){
  return new Promise((resolve)=>{
    setTimeout(() => {
      resolve();
    }, timeInMilliseconds);
  })
}