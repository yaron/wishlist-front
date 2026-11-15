const crypto = require('crypto');

// Generate a random key that can be used to undo a claim.
function newClaimKey() {
    return crypto.randomBytes(16).toString('base64url');
}

// Only a hash of the key is stored, so the key itself never ends up in the database.
function hashClaimKey(key) {
    return crypto.createHash('sha256').update(String(key)).digest('hex');
}

function claimKeyMatches(key, hash) {
    if (typeof key !== 'string' || typeof hash !== 'string' || key.length === 0) {
        return false;
    }
    const a = Buffer.from(hashClaimKey(key), 'hex');
    const b = Buffer.from(hash, 'hex');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { newClaimKey, hashClaimKey, claimKeyMatches };
