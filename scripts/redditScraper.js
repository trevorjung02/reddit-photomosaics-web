const puppeteer = require('puppeteer');
const $ = require('cheerio');
const fs = require('fs');
const path = require('path');
const downloadImages = require('./downloadImages');

const imageDir = 'public/images';

function scrape(url) {
    puppeteer
        .launch({
            headless: false,
            defaultViewport: null,
            args: ['--window-size=800,600']
        })
        .then(async function (browser) {
            const page = await browser.newPage();
            await page.goto(url);

            // await scrollToBottom(page);
            return page.content();
        })
        .then(function (html) {
            const images = [];
            // const parsed = $('a', html).filter(function(i, e) {
            //     console.log($(this).attr.src);  
            //     return $(this).attr.src;
            // });
            const parsed = $('a > div > div > img', html);
            for (let i = 0; i < Math.min(parsed.length, 60); i++) {
                images.push(parsed[i].attribs.src);
            }
            console.log(images.length);
            console.log(images);
            let dirSize = fs.readdirSync(imageDir).length;
            // downloadImages(images, dirSize + 1, 75, 75);
        })
        .catch(function (err) {
            console.log(err);
        });
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