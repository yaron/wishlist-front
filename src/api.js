// All calls to the API go through here, so every failure ends up as an ApiError
// that the caller can show to the visitor.
export class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

async function request(path, options) {
    let res;
    try {
        res = await fetch(config.api + path, options);
    } catch (err) {
        // No connection, or the request was blocked.
        throw new ApiError(0, '');
    }
    const text = await res.text();
    let body = text;
    try {
        body = JSON.parse(text);
    } catch (e) {
        // Not JSON; keep the text.
    }
    if (!res.ok) {
        throw new ApiError(res.status, (body && body.error) || (typeof body === 'string' ? body : ''));
    }
    return body;
}

export function get(path) {
    return request(path);
}

export function post(path, body = {}) {
    return request(path, {
        method: 'POST',
        headers: { 'content-type': 'application/json; charset=UTF-8' },
        body: JSON.stringify(body),
    });
}
