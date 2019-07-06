
import puppeteer from 'puppeteer';
import { pageSettings } from './config.json';
import hash from 'object-hash';
import { writeEmail } from './gmail.js';

let lastSeenHash: string[] = [];

async function run() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(pageSettings.url);
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

    await browser.close();
};


async function notify(text: string, link: string) {
    await writeEmail(`${text} <br> <a href="${link}"> link </a>`);
}

setInterval(run, pageSettings.interval * 1000);


