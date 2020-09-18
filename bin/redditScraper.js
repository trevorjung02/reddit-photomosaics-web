const puppeteer = require('puppeteer');
const kill = require('tree-kill');
const $ = require('cheerio');
const fs = require('fs');
const path = require('path');
const downloadImages = require('./downloadImages');

const imageDir = path.join(__dirname, '../', 'public', 'images');

async function scrape(urls) {
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
    const page = await browser.newPage();
    async function scrapePage(url) {
        console.log(url);
        let html;
        try {
            await page.goto(url);

            // await scrollToBottom(page);
            html = await page.content();
            // console.log("Got html");
            // console.log(html);
        }
        catch (err) {
            console.log(err);
            kill(browser.process().pid, 'SIGKILL');
        }
        const images = [];
        const parsed = $('div > div > a > img', html);
        for (let i = 0; i < Math.min(parsed.length, 150); i++) {
            let url = parsed[i].attribs.src;
            if (!url.endsWith('.jpg')) {
                continue;
            }
            if (!url.startsWith('https:')) {
                url = "https:" + url;
            }
            images.push(url);
        }
        return [$('span.next-button > a', html).attr('href'), images];
    }
    let images;
    for (let i = 0; i < urls.length; i++) {
        let res = await scrapePage(urls[i]);
        let nextUrl = res[0];
        images = res[1];
        for (let j = 0; j < 5; j++) {
            res = await scrapePage(nextUrl);
            nextUrl = res[0];
            images = images.concat(res[1]);
        }
    }
    console.log(images.length);
    kill(browser.process().pid, 'SIGKILL');
    return images;
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