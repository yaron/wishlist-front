const instance = require('./instance');

// Same variables as the wishlist-go templates, plus UnclaimUrl.
const DEFAULT_SUBJECT = 'Je hebt {{.ItemName}} afgestreept';
const DEFAULT_BODY = [
    'Hoi,',
    '',
    'Je hebt "{{.ItemName}}" afgestreept op de verlanglijst.',
    '',
    'Wil je dit ongedaan maken? Open dan deze link:',
    '{{.UnclaimUrl}}',
].join('\n');

const MAX_MAIL_LENGTH = 254;
const MAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidMail(mail) {
    return typeof mail === 'string' && mail.length <= MAX_MAIL_LENGTH && MAIL_PATTERN.test(mail);
}

// At most one mail per item per hour. Without this, claiming and unclaiming in a loop
// would send an unlimited number of mails to any address.
const MAIL_COOLDOWN_MS = 60 * 60 * 1000;

function mayMailAgain(lastMailAt, now = Date.now()) {
    const last = Date.parse(lastMailAt);
    return Number.isNaN(last) || now - last >= MAIL_COOLDOWN_MS;
}

function unclaimUrl(itemId, key) {
    const site = process.env.WISH_SITE_URL || instance.siteUrl;
    if (!site) {
        return '';
    }
    const url = new URL(site);
    url.search = new URLSearchParams({ id: itemId, key }).toString();
    return url.toString();
}

// Fills in {{.Name}} placeholders, compatible with the simple templates used in wishlist-go.
function render(template, data) {
    return template.replace(/\{\{\s*\.(\w+)\s*\}\}/g, (match, name) =>
        Object.prototype.hasOwnProperty.call(data, name) ? String(data[name]) : match);
}

function isConfigured() {
    return Boolean(process.env.WISH_MAILGUN_DOMAIN && process.env.WISH_MAILGUN_KEY && process.env.WISH_MAIL_FROM);
}

// Same settings as wishlist-go: WISH_MAILGUN_EU=1 uses the EU region of Mailgun.
function mailgunUrl() {
    const base = process.env.WISH_MAILGUN_EU === '1' ? 'https://api.eu.mailgun.net' : 'https://api.mailgun.net';
    return `${base}/v3/${encodeURIComponent(process.env.WISH_MAILGUN_DOMAIN)}/messages`;
}

// Sends the mail with the undo link. Resolves once Mailgun accepted it.
async function sendClaimMail(mail, item, key) {
    const data = {
        ItemName: item.name,
        ItemID: item.id,
        Key: key,
        Mail: mail,
        UnclaimUrl: unclaimUrl(item.id, key),
    };
    const auth = Buffer.from(`api:${process.env.WISH_MAILGUN_KEY}`).toString('base64');
    const res = await fetch(mailgunUrl(), {
        method: 'POST',
        headers: { Authorization: `Basic ${auth}` },
        body: new URLSearchParams({
            from: process.env.WISH_MAIL_FROM,
            to: mail,
            subject: render(process.env.WISH_MAIL_SUBJECT || DEFAULT_SUBJECT, data),
            text: render(process.env.WISH_MAIL_BODY || DEFAULT_BODY, data),
        }),
        signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
        throw new Error(`Mailgun responded with ${res.status}: ${await res.text()}`);
    }
}

module.exports = { isConfigured, isValidMail, mayMailAgain, sendClaimMail, render };
