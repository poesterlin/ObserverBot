
import puppeteer from 'puppeteer';
import { pageSettings } from './config.json';
import hash from 'object-hash';
import { writeEmail } from './gmail.js';

let lastSeenHash: string[] = [];

let browser: puppeteer.Browser, page: puppeteer.Page;

async function setup() {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.goto(pageSettings.url);
}

async function run() {
    await page.reload();
    const els = await page.$$(pageSettings.selector);

    const found: string[] = [];

    for (const el of els) {
        const text: string = await page.evaluate(element => element.innerText, el);
        const h = hash.sha1(text.trim());

        if (!lastSeenHash.includes(h)) {
            lastSeenHash.push(h);
            found.push(text.trim());
        }

        el.dispose();
    }

    if (found.length > 0) {
        await notify(found.join("\n"), pageSettings.url);
    } else {
        console.log("nothing", lastSeenHash);
    }
};


async function notify(text: string, link: string) {
    await writeEmail(`${text} <br> <a href="${link}"> link </a>`);
}

setup().then(() => {
    setInterval(run, pageSettings.interval * 1000);
})

process.addListener('beforeExit', async () => {
    await browser.close();
    console.log('closed');
});





