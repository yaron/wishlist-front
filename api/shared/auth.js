// Static Web Apps passes the logged-in user in the x-ms-client-principal header.
// staticwebapp.config.json already limits the admin routes to administrators; checking
// again here means a mistake in those route rules cannot open up the API.
function getPrincipal(req) {
    const header = req && req.headers && req.headers['x-ms-client-principal'];
    if (typeof header !== 'string' || header.length === 0) {
        return null;
    }
    try {
        return JSON.parse(Buffer.from(header, 'base64').toString('utf8'));
    } catch (e) {
        return null;
    }
}

function isAdmin(req) {
    const principal = getPrincipal(req);
    return Boolean(principal && Array.isArray(principal.userRoles) && principal.userRoles.includes('administrator'));
}

// The response for a request that is not allowed, or null when the caller is an administrator.
function denyUnlessAdmin(req) {
    if (isAdmin(req)) {
        return null;
    }
    return json(getPrincipal(req) ? 403 : 401, { error: 'Administrators only' });
}

function json(status, body) {
    return { status, headers: { 'content-type': 'application/json' }, body };
}

module.exports = { isAdmin, denyUnlessAdmin, json };
