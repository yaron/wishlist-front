const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

const db = require('../shared/db');
const mailer = require('../shared/mail');
const { validateItem } = require('../shared/item');
const { hashClaimKey, claimKeyMatches, newClaimKey } = require('../shared/claimKey');
const { isAdmin } = require('../shared/auth');

const claim = require('../claim');
const unclaim = require('../unclaim');
const itemAdd = require('../itemAdd');
const itemEdit = require('../itemEdit');
const itemDelete = require('../itemDelete');
const list = require('../list');

function principal(roles) {
    const value = Buffer.from(JSON.stringify({ userId: 'u', userRoles: roles })).toString('base64');
    return { 'x-ms-client-principal': value };
}
const admin = principal(['anonymous', 'authenticated', 'administrator']);

function context(bindings = {}) {
    return { bindings, res: undefined, log: { error() {} } };
}

let saved;
let replaceResult;
let sentMails;
beforeEach(() => {
    saved = [];
    replaceResult = true;
    sentMails = [];
    db.replaceItem = async (item) => { saved.push(structuredClone(item)); return replaceResult; };
    db.deleteItem = async (id) => id === 'known';
    mailer.isConfigured = () => true;
    mailer.sendClaimMail = async (mail) => { sentMails.push(mail); };
});

test('validateItem keeps only known fields and rejects bad input', () => {
    const { item } = validateItem({ name: ' Book ', price: 1999, url: 'https://example.com', id: 'x', claimKeyHash: 'y' });
    assert.deepEqual(item, { name: 'Book', price: 1999, claimable: false, claimed: false, url: 'https://example.com', image: '' });
    assert.ok(validateItem({ name: '' }).errors);
    assert.ok(validateItem({ name: 'a', price: 19.99 }).errors);
    assert.ok(validateItem({ name: 'a', url: 'javascript:alert(1)' }).errors);
    assert.ok(validateItem([]).errors);
});

test('claim keys only match their own hash', () => {
    const key = newClaimKey();
    assert.equal(claimKeyMatches(key, hashClaimKey(key)), true);
    assert.equal(claimKeyMatches('other', hashClaimKey(key)), false);
    assert.equal(claimKeyMatches(undefined, hashClaimKey(key)), false);
    assert.equal(claimKeyMatches(key, undefined), false);
});

test('isAdmin needs the administrator role', () => {
    assert.equal(isAdmin({ headers: admin }), true);
    assert.equal(isAdmin({ headers: principal(['anonymous', 'authenticated']) }), false);
    assert.equal(isAdmin({ headers: {} }), false);
    assert.equal(isAdmin({ headers: { 'x-ms-client-principal': 'not base64 json' } }), false);
});

test('admin functions refuse visitors and non-admin users', async () => {
    for (const fn of [itemAdd, itemEdit, itemDelete]) {
        const anonymous = context();
        await fn(anonymous, { headers: {}, body: { name: 'a' }, params: { id: 'known' } }, { id: 'known' });
        assert.equal(anonymous.res.status, 401);

        const user = context();
        await fn(user, { headers: principal(['authenticated']), body: { name: 'a' }, params: { id: 'known' } }, { id: 'known' });
        assert.equal(user.res.status, 403);
    }
    assert.equal(saved.length, 0);
});

test('itemAdd stores a validated item', async () => {
    const ctx = context();
    await itemAdd(ctx, { headers: admin, body: { name: 'Book', price: 500, claimable: true } });
    assert.equal(ctx.res.status, 200);
    assert.equal(JSON.parse(ctx.bindings.addItem).name, 'Book');

    const bad = context();
    await itemAdd(bad, { headers: admin, body: { name: '' } });
    assert.equal(bad.res.status, 400);
    assert.equal(bad.bindings.addItem, undefined);
});

test('claim marks the item and returns a key that unclaims it', async () => {
    const ctx = context();
    await claim(ctx, { body: {} }, { id: '1', name: 'Book', claimable: true, claimed: false, _etag: 'e1' });
    assert.equal(ctx.res.status, 200);
    assert.equal(saved[0].claimed, true);
    assert.equal(ctx.res.body.mailSent, false);

    const undo = context();
    await unclaim(undo, { body: { key: ctx.res.body.key } }, saved[0]);
    assert.equal(undo.res.status, 200);
    assert.equal(saved[1].claimed, false);
    assert.equal(saved[1].claimKeyHash, undefined);
});

test('claim reports a conflict for a claimed item or a lost race', async () => {
    const taken = context();
    await claim(taken, { body: {} }, { id: '1', claimable: true, claimed: true });
    assert.equal(taken.res.status, 409);
    assert.equal(saved.length, 0);

    replaceResult = false;
    const race = context();
    await claim(race, { body: { mail: 'a@example.com' } }, { id: '1', claimable: true, claimed: false, _etag: 'e1' });
    assert.equal(race.res.status, 409);
    assert.equal(sentMails.length, 0);
});

test('claim sends at most one mail per item per hour', async () => {
    const first = context();
    await claim(first, { body: { mail: 'a@example.com' } }, { id: '1', name: 'Book', claimable: true, claimed: false });
    assert.equal(first.res.body.mailSent, true);
    assert.ok(saved[0].lastMailAt);

    const again = context();
    await claim(again, { body: { mail: 'b@example.com' } }, { ...saved[0], claimed: false });
    assert.equal(again.res.status, 200);
    assert.equal(again.res.body.mailSent, false);
    assert.deepEqual(sentMails, ['a@example.com']);

    const hourAgo = new Date(Date.now() - 61 * 60 * 1000).toISOString();
    const later = context();
    await claim(later, { body: { mail: 'c@example.com' } }, { ...saved[0], claimed: false, lastMailAt: hourAgo });
    assert.equal(later.res.body.mailSent, true);
});

test('unclaim needs the right key', async () => {
    const ctx = context();
    await unclaim(ctx, { body: { key: 'wrong' } }, { id: '1', claimed: true, claimKeyHash: hashClaimKey('right') });
    assert.equal(ctx.res.status, 403);
    assert.equal(saved.length, 0);
});

test('itemEdit leaves the claim alone unless it is sent explicitly', async () => {
    const existing = () => ({ id: '1', name: 'Book', claimable: true, claimed: true, claimKeyHash: 'h', _etag: 'e' });

    const keep = context();
    await itemEdit(keep, { headers: admin, body: { name: 'New name', claimable: true } }, existing());
    assert.equal(keep.res.status, 200);
    assert.equal(saved[0].name, 'New name');
    assert.equal(saved[0].claimed, true);
    assert.equal(saved[0].claimKeyHash, 'h');

    const reset = context();
    await itemEdit(reset, { headers: admin, body: { name: 'Book', claimed: false } }, existing());
    assert.equal(saved[1].claimed, false);
    assert.equal(saved[1].claimKeyHash, undefined);

    replaceResult = false;
    const conflict = context();
    await itemEdit(conflict, { headers: admin, body: { name: 'Book' } }, existing());
    assert.equal(conflict.res.status, 409);
});

test('itemDelete reports a missing item', async () => {
    const ok = context();
    await itemDelete(ok, { headers: admin, params: { id: 'known' } });
    assert.equal(ok.res.status, 200);

    const missing = context();
    await itemDelete(missing, { headers: admin, params: { id: 'nope' } });
    assert.equal(missing.res.status, 404);
});

test('list hides server-only fields and puts claimed items last', async () => {
    const ctx = context({ items: [
        { id: '1', name: 'Zebra', claimable: true, claimed: true, claimKeyHash: 'h', lastMailAt: 'x', _etag: 'e' },
        { id: '2', name: 'banana', claimable: true },
        { id: '3', name: 'Apple', claimable: true },
    ] });
    await list(ctx);
    assert.deepEqual(ctx.res.body.map((i) => i.name), ['Apple', 'banana', 'Zebra']);
    assert.deepEqual(Object.keys(ctx.res.body[0]), ['id', 'name', 'price', 'claimable', 'claimed', 'url', 'image']);
});
