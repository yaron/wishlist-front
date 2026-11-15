// Validation of wishlist items, based on WishlistItem in wishlist-go.
const MAX_NAME_LENGTH = 200;
const MAX_URL_LENGTH = 2048;

function isHttpUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (e) {
        return false;
    }
}

function optionalUrl(body, field, errors) {
    const value = body[field];
    if (value === undefined || value === null || value === '') {
        return '';
    }
    if (typeof value !== 'string' || value.length > MAX_URL_LENGTH || !isHttpUrl(value.trim())) {
        errors.push(`${field} must be an http(s) URL`);
        return '';
    }
    return value.trim();
}

function optionalBoolean(body, field, errors, fallback) {
    const value = body[field];
    if (value === undefined || value === null) {
        return fallback;
    }
    if (typeof value !== 'boolean') {
        errors.push(`${field} must be true or false`);
        return fallback;
    }
    return value;
}

// Returns { item } with only the known fields, or { errors } when the body is invalid.
function validateItem(body) {
    const errors = [];
    if (body === null || typeof body !== 'object' || Array.isArray(body)) {
        return { errors: ['Body must be a JSON object'] };
    }

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (name.length === 0) {
        errors.push('name is required');
    } else if (name.length > MAX_NAME_LENGTH) {
        errors.push(`name can be at most ${MAX_NAME_LENGTH} characters`);
    }

    // Price in cents. An empty price field in the form arrives as null.
    let price = 0;
    if (body.price !== undefined && body.price !== null) {
        if (!Number.isInteger(body.price) || body.price < 0) {
            errors.push('price must be a whole number of cents, 0 or more');
        } else {
            price = body.price;
        }
    }

    const item = {
        name,
        price,
        claimable: optionalBoolean(body, 'claimable', errors, false),
        claimed: optionalBoolean(body, 'claimed', errors, false),
        url: optionalUrl(body, 'url', errors),
        image: optionalUrl(body, 'image', errors),
    };

    return errors.length > 0 ? { errors } : { item };
}

function badRequest(errors) {
    return {
        status: 400,
        headers: { "content-type": "application/json" },
        body: { error: errors.join(', ') }
    };
}

module.exports = { validateItem, badRequest };
