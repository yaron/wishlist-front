import { writable, readable } from "svelte/store";
import jwt_decode from 'jwt-decode';


let token = ''
export const token_store = writable(localStorage.getItem("token") || "", function () {
    const interval = setInterval(() => {
		if (token != '') {
            checkToken(token)
        }
    }, 60000);
    
    return () => clearInterval(interval)
});

token_store.subscribe(val => {
    localStorage.setItem("token", val)
    if (val != '') { checkToken(val) }
    token = val
});

async function checkToken(t) {
    let decoded_token = await jwt_decode(t)
    let current_time = Math.floor(Date.now() / 1000)

    // Drop token if it is expired.
    if (decoded_token.exp < current_time) {
        token_store.set('')
    }
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
    const text = await res.text();

    if (res.ok) {
        return JSON.parse(text);
    } else {
        throw new Error(res);
    }
}

import * as langs from './languages/langs.js'
export const texts_store = readable(langs[config.language]);