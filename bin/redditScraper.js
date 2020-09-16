const puppeteer = require('puppeteer');
const $ = require('cheerio');
const fs = require('fs');
const path = require('path');
const downloadImages = require('./downloadImages');

const imageDir = path.join(__dirname, '../', 'public', 'images');

async function scrape(url) {
    console.log(url);
    const browser = await puppeteer
        .launch({
            headless: true,
            defaultViewport: null,
            args: [
                '--disable-setuid-sandbox',
                '--no-sandbox',
                // '--window-size=800,600',
                '--disable-dev-shm-usage'
            ]
        })
        .catch(function (err) {
            console.log(err);
            process.exit(1);
        });
    console.log("browser created");
    let html;
    try {
        const page = await browser.newPage();
        await page.goto(url);

        // await scrollToBottom(page);
        html = await page.content();
        console.log("Got html");
        // console.log(html);
        await browser.close();
    }
    catch (err) {
        console.log(err);
        await browser.close();
    }
    const images = [];
    const parsed = $('div > div > a > img', html);
    for (let i = 0; i < Math.min(parsed.length, 150); i++) {
        let url = parsed[i].attribs.src;
        if(!url.endsWith('.jpg')) {
            continue;
        }
        if(!url.startsWith('https:')) {
            url = "https:" + url;
        }
        images.push(url);
    }
    // await browser.close();
    // console.log("browser closed");
    console.log(images.length);
    // console.log(images);
    // let dirSize = fs.readdirSync(imageDir).length;
    // downloadImages(images, dirSize + 1, 75, 75);
    return [$('span.next-button > a', html).attr('href'), images];
}

async function scrollToBottom(page) {
    const distance = 400; // should be less than or equal to window.innerHeight
    const delay = 300;
    while (await page.evaluate(() => document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight)) {
        await page.evaluate((y) => { document.scrollingElement.scrollBy(0, y); }, distance);
        await page.waitFor(delay);
        // console.log((await page.content()).length);
    }
}

module.exports = scrape; 