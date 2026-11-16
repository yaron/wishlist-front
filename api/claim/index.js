const { newClaimKey, hashClaimKey } = require('../shared/claimKey');
const { json } = require('../shared/auth');
const db = require('../shared/db');
const mailer = require('../shared/mail');

module.exports = async function (context, req, item) {
    if (item == undefined) {
        context.res = json(404, { error: 'Unable to find item' });
        return;
    }

    if (item.claimable != true || item.claimed == true) {
        context.res = json(409, { error: 'Item is already claimed' });
        return;
    }

    const key = newClaimKey();
    item.claimed = true;
    item.claimKeyHash = hashClaimKey(key);

    const result = { status: 'Item claimed', key: key, mailSent: false };

    // The mail address is only used to send this one mail and is never stored.
    const mail = req.body && typeof req.body.mail === 'string' ? req.body.mail.trim() : '';
    let sendMail = false;
    if (mail.length > 0) {
        if (!mailer.isConfigured()) {
            result.error = 'Mail is not configured';
        } else if (!mailer.isValidMail(mail)) {
            result.error = 'Invalid mail address';
        } else if (!mailer.mayMailAgain(item.lastMailAt)) {
            // Claiming and unclaiming in a loop must not turn the site into a mail cannon.
            result.error = 'A mail for this item was sent recently';
        } else {
            sendMail = true;
            item.lastMailAt = new Date().toISOString();
        }
    }

    if (!await db.replaceItem(item)) {
        // Someone else claimed (or changed) the item at the same moment.
        context.res = json(409, { error: 'Item is already claimed' });
        return;
    }

    if (sendMail) {
        try {
            await mailer.sendClaimMail(mail, item, key);
            result.mailSent = true;
        } catch (err) {
            // The claim itself succeeded, so report the mail problem without failing.
            context.log.error('Unable to send claim mail', err && err.message);
            result.error = 'Unable to send mail';
        }
    }

    context.res = json(200, result);
};
