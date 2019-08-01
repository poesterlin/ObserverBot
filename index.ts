
import puppeteer from 'puppeteer';
import { pageSettings } from './config.json';
import hash from 'object-hash';
import { writeEmail, authorize } from './gmail.js';

let lastSeenHash: string[] = [];

let browser: puppeteer.Browser, page: puppeteer.Page;

async function setup() {
    await authorize();
    browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    page = await browser.newPage();
    await page.goto(pageSettings.url);
}

async function run() {
    await page.reload();
    await page.waitForNavigation();
    const els = await page.$$(pageSettings.selector);
    const found: string[] = [];

    for (const el of els) {
        const text: string = await page.evaluate(element => element.innerText, el);
        const link: string = await page.evaluate(element => element.children[2].href, el);
        const comb = `<a href="${link}">${text.trim()}</a> <br>`
        const h = hash.sha1(comb);

        if (!lastSeenHash.includes(h)) {
            lastSeenHash.push(h);
            found.push(comb);
        }

        el.dispose();
    }

    if (found.length > 0) {
        await notify(found.join("\n"));
    } else {
        console.log('no updates found');
    }
};


async function notify(text: string) {
    await writeEmail(`${text} <br> <a href="${pageSettings.url}"> go to overview </a>`);
}

setup().then(() => {
    run();
    setInterval(run, pageSettings.interval * 1000);
})

process.on('exit', async () => {
    await browser.close();
    console.log('closed');
});





