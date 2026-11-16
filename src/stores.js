import { writable, derived } from 'svelte/store';
import { get } from './api.js';
import { t as en } from './languages/en.js';
import { t as nl } from './languages/nl.js';

export const texts = { en, nl }[config.language] || nl;

export const user_store = writable({ userId: null, userRoles: [] });
export const is_admin = derived(user_store, (user) =>
    Array.isArray(user.userRoles) && user.userRoles.includes('administrator'));

fetch('/.auth/me')
    .then((res) => res.json())
    .then(({ clientPrincipal }) => {
        if (clientPrincipal) user_store.set(clientPrincipal);
    })
    .catch(() => {
        // Not logged in (or no auth endpoint, when developing without the SWA CLI).
    });

// The items stay on screen while the list is refreshed, so the page does not jump.
function createListStore() {
    const { subscribe, update } = writable({ items: [], loaded: false, error: false });

    async function updateList() {
        try {
            const items = await get('/list');
            update(() => ({ items, loaded: true, error: false }));
        } catch (err) {
            // The visitor gets a friendly message (texts.loadError); keep the details for debugging.
            console.error(err);
            update((state) => ({ ...state, error: true }));
        }
    }

    updateList();
    return { subscribe, updateList };
}
export const item_store = createListStore();
