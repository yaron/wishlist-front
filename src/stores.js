import { writable, readable } from "svelte/store";


export const user_store = writable({UserId: null});
getUserInfo().then((val) => {user_store.set(val)})

export async function getUserInfo() {
    const response = await fetch('/.auth/me');
    const payload = await response.json();
    const { clientPrincipal } = payload;
    if (clientPrincipal == null) {
        return {UserId: null}
    }
    return clientPrincipal;
}

function createListStore() {
    const { subscribe, set } = writable(0);
    set(getList())
    return {
        subscribe,
        updateList: () => {set(getList())}
    }
}
export const item_store = createListStore()

async function getList() {
    const res = await fetch(config.api+`/list`);
    const text = await res.json();
    return text;
}

import * as langs from './languages/langs.js'
export const texts_store = readable(langs[config.language]);