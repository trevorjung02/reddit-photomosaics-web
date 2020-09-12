const puppeteer = require('puppeteer');
const $ = require('cheerio');
const fs = require('fs');
const path = require('path');
const downloadImages = require('./downloadImages');

const imageDir = path.join(__dirname, '../', 'public', 'images');

async function scrape(url) {
    const browser = await puppeteer
        .launch({
            headless: false,
            defaultViewport: null,
            args: ['--window-size=800,600']
        });
    console.log("browser created");
    let html;
    try {
        const page = await browser.newPage();
        await page.goto(url);

        await scrollToBottom(page);
        html = await page.content();
        // console.log(html);
        console.log("Got html");
        await browser.close();
    }
    catch (err) {
        console.log(err);
        await browser.close();
    }
    const images = [];
    const parsed = $('a > div > div > img', html);
    for (let i = 0; i < Math.min(parsed.length, 150); i++) {
        images.push(parsed[i].attribs.src);
    }
    // await browser.close();
    // console.log("browser closed");
    console.log(images.length);
    // console.log(images);
    // console.log(images);
    let dirSize = fs.readdirSync(imageDir).length;
    downloadImages(images, dirSize+1, 75, 75);
}

async function scrollToBottom(page) {
    const distance = 400; // should be less than or equal to window.innerHeight
    const delay = 100;
    while (await page.evaluate(() => document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight)) {
        await page.evaluate((y) => { document.scrollingElement.scrollBy(0, y); }, distance);
        await page.waitFor(delay);
    }
}

module.exports = scrape; 