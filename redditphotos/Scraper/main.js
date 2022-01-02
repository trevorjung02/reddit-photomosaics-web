const axios = require('axios');
const fs = require('fs');
const { pipeline } = require('stream/promises');
const path = require('path');

main();

async function main() {
    if (process.argv.length < 5) {
        usage();
        process.exit(1);
    }
    // Regex to scrape thumbnails 
    const re_img = /[ab]\.thumbs\.redditmedia\.com\S*\.jpg/g;
    // Regex to scrape url to next page
    const re_next = /(\?\S*)" rel="nofollow next"/;
    // url to scrape
    const url = process.argv[2];
    // number of images to scrape
    const num_images = process.argv[3];
    // Output directory to place scraped images
    const outDir = process.argv[4];

    // Scrape images
    await scrape(url, num_images, re_img, re_next)
        .then(async (img_urls) => {
            await download_images(img_urls, outDir);
        });
}

// Scrape num_images from url, given regex for scraping images and regex for scraping url of next page. 
// Returns list of image urls
async function scrape(url, num_images, re_img, re_next) {
    // Scraped image urls
    let img_urls = [];
    // Url component that represent page
    let page_num = "";
    // Scrape images until there are num_images
    while (img_urls.length < num_images) {
        // Number of images scraped at start of iteration
        let startLength = img_urls.length;
        // promise from scraping image urls
        let p1 = scrape_urls(url + '.compact' + page_num, re_img, img_urls);
        // promise from scraping next page url
        let p2 = scrape_next_page(url + page_num, re_next);

        // Wait until promises are resolved
        let p = await Promise.all([p1, p2])
            .then((res) => {
                // Can't scrape next page, return
                if (res[1] == null) {
                    return false;
                }
                // Didn't scrape enough images, return
                if (img_urls.length - startLength < 10) {
                    return false;
                }
                // Set page_num to next page
                page_num = res[1];
                return true;
            })
        if (!p) {
            console.log(`p = ${p}`);
            break;
        }
    };
    if (img_urls.length > num_images) {
        return img_urls.slice(0, num_images);
    }
    return img_urls;
}

// Scrapes url for images given regex, and appends to img_urls
function scrape_urls(url, re_img, img_urls) {
    return axios.get(url)
        .then(function (response) {
            let matches = response.data.match(re_img);
            if (matches != null) {
                img_urls.push(...matches);
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

// Scrapes url for the url to the next page, given regex
function scrape_next_page(url, re_next) {
    return axios.get(url)
        .then(function (response) {
            let matches = response.data.match(re_next);
            if (matches == null) {
                return null;
            }
            return matches[1];
        })
        .catch(function (error) {
            console.log(error);
        });
}

// Downloads images from a list img_urls, putting results into outDdir
function download_images(img_urls, outDir) {
    let promises = [];
    for (let i = 0; i < img_urls.length; i++) {
        promises.push(downloadFile("https://" + img_urls[i], path.join(outDir, `${i}.jpg`)));
    }
    return Promise.all(promises);
}

// Downloads File from fileUrl, putting result into outputLocationPath
function downloadFile(fileUrl, outputLocationPath) {
    return axios({
        method: 'get',
        url: fileUrl,
        responseType: 'stream',
    }).then(async response => {
        return pipeline(response.data, fs.createWriteStream(outputLocationPath));
    });
}

// Prints usage of program
function usage() {
    console.log(`Usage: ${process.argv[1]} url num_images outDir`);
}