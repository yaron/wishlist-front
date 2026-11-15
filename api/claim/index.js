const { newClaimKey, hashClaimKey } = require('../shared/claimKey');
const mailer = require('../shared/mail');

module.exports = async function (context, req, claimItemIn) {
    if (claimItemIn == undefined) {
        context.res = {
            status: 404,
            body: "Unable to find item"
        };
        return
    }

    if (claimItemIn.claimable != true || claimItemIn.claimed == true) {
        context.res = {
            status: 403,
            body: "Unable to claim item"
        };
        return
    }

    const key = newClaimKey()
    context.bindings.claimItemOut = claimItemIn
    context.bindings.claimItemOut.claimed = true
    context.bindings.claimItemOut.claimKeyHash = hashClaimKey(key)

    const result = { status: "Item claimed", key: key, mailSent: false }

    // The mail address is only used to send this one mail and is never stored.
    const mail = req.body && typeof req.body.mail === 'string' ? req.body.mail.trim() : ''
    if (mail.length > 0) {
        if (!mailer.isConfigured()) {
            result.error = "Mail is not configured"
        } else if (!mailer.isValidMail(mail)) {
            result.error = "Invalid mail address"
        } else {
            try {
                await mailer.sendClaimMail(mail, claimItemIn, key)
                result.mailSent = true
            } catch (err) {
                // The claim itself succeeded, so report the mail problem without failing.
                context.log.error("Unable to send claim mail", err && err.message)
                result.error = "Unable to send mail"
            }
        }
    }

    context.res = {
        headers: { "content-type": "application/json" },
        body: result
    };
}
