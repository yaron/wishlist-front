// Keeps the keys of claims made in this browser, so they can be undone later.
const STORAGE_KEY = 'claimKeys';

function read() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
        return {};
    }
}

function write(keys) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
    } catch (e) {
        // Storage can be unavailable (private mode); the unclaim link still works.
    }
}

export function getClaimKey(id) {
    return read()[id];
}

export function saveClaimKey(id, key) {
    const keys = read();
    keys[id] = key;
    write(keys);
}

export function removeClaimKey(id) {
    const keys = read();
    delete keys[id];
    write(keys);
}

export function unclaimUrl(id, key) {
    const url = new URL(window.location.href);
    url.search = new URLSearchParams({ id, key }).toString();
    url.hash = '';
    return url.toString();
}
