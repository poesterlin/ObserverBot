
import { pageSettings } from './config.json';
import hash from 'object-hash';
import { writeEmail, authorize } from './gmail.js';
import { parse } from 'node-html-parser';
import * as fetch from 'node-fetch';

let lastSeenHash: string[] = [];

async function run() {
    // @ts-ignore
    const req = await fetch(pageSettings.url);
    const html = await req.text();
    const root: any = parse(html);

    const elements = root.querySelectorAll(pageSettings.selector)
        .filter((el: any) => !lastSeenHash.includes(hash.sha1(el.structuredText)));

    if (elements.length > 0) {
        const str: string[] = elements.map((el: any) => {
            let html = "";
            try {
                html = el.childNodes[1].toString();
            } catch (e) { }
            return html.replace('href="', 'href="https://www.wg-gesucht.de/').replace(' class="detailansicht"', "");
        });
        notify(str.join("\n <br>"));
    } else {
        console.log('no updates found');
    }
    lastSeenHash.push(...elements.map((t: any) => hash.sha1(t.structuredText)));
};

async function notify(text: string) {
    await writeEmail(`${text} <br> <a href="${pageSettings.url}"> go to overview </a>`);
}

authorize().then(() => {
    run();
    setInterval(run, pageSettings.interval * 1000);
})
