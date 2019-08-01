import fs from "fs";
import readline from "readline";
import { gmail } from './config.json';
import { google } from "googleapis";
import { email, subject } from './config.json';
import base64url from "base64url";

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

const TOKEN_PATH = 'token.json';

export async function authorize() {

    const { client_secret, client_id, redirect_uris } = gmail;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    let cred;
    try {
        // Check if we have previously stored a token.
        cred = JSON.parse(await readFile(TOKEN_PATH));
        oAuth2Client.setCredentials(cred);
        console.log("restored token")
    } catch (error) {
        await getNewToken(oAuth2Client);
    }

    return oAuth2Client;
}

export async function writeEmail(text: string) {
    const auth = await authorize();
    const gmail = google.gmail({ version: 'v1', auth });
    const raw = makeBody(email, email, subject, text);

    if (process.env.NODE_ENV === 'production') {
        gmail.users.messages.send({
            userId: 'me',
            auth,
            requestBody: { raw },
        }, (err) => {
            if (err) console.error(err); else console.log('sent email');
        });
    } else {
        console.log('didnt sent email');
        console.log(base64url.decode(text));
    }
}

function makeBody(to: string, from: string, subject: string, message: string) {
    const str = [`Content-Type: text/plain; charset="UTF-8"`,
        "MIME-Version: 1.0",
        "Content-Transfer-Encoding: 7bit",
        `to:  ${to}`,
        `from: ${from}`,
        `subject: ${subject}`,
        message
    ].join('\n');

    return base64url.encode(str);
}


function readFile(filename: string): Promise<string> {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            if (!data) {
                resolve();
                return;
            }
            resolve(data.toString())
        })
    })
}

function getNewToken(oAuth2Client: any) {
    return new Promise((res) => {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });

        console.log('Authorize this app by visiting this url:', authUrl);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            oAuth2Client.getToken(code, (err: any, token: any) => {
                if (err)
                    return console.error('Error retrieving access token');

                oAuth2Client.setCredentials(token);

                // Store the token to disk for later program executions
                fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                    if (err)
                        return console.error(err);
                    console.log('Token stored to', TOKEN_PATH);
                    res(oAuth2Client);
                });
            });
        });
    })

}


