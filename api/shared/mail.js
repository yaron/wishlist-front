const { EmailClient } = require('@azure/communication-email');

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

function unclaimUrl(itemId, key) {
    const site = process.env.WISH_SITE_URL;
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
    return Boolean(process.env.ACS_CONNECTION_STRING && process.env.WISH_MAIL_FROM);
}

// Queues the mail with the undo link. Resolves once Azure Communication Services accepted it.
async function sendClaimMail(mail, item, key) {
    const data = {
        ItemName: item.name,
        ItemID: item.id,
        Key: key,
        Mail: mail,
        UnclaimUrl: unclaimUrl(item.id, key),
    };
    const client = new EmailClient(process.env.ACS_CONNECTION_STRING);
    await client.beginSend({
        senderAddress: process.env.WISH_MAIL_FROM,
        content: {
            subject: render(process.env.WISH_MAIL_SUBJECT || DEFAULT_SUBJECT, data),
            plainText: render(process.env.WISH_MAIL_BODY || DEFAULT_BODY, data),
        },
        recipients: { to: [{ address: mail }] },
    });
}

module.exports = { isConfigured, isValidMail, sendClaimMail, render };
