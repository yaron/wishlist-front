import { writable } from "svelte/store";

export const token_store = writable(localStorage.getItem("token") || "");
token_store.subscribe(val => {
    localStorage.setItem("token", val)
});

function createListStore() {
    const { subscribe, set, update } = writable(0);
    set(getList())
    return {
        subscribe,
        updateList: () => {set(getList())}
    }
}
export const item_store = createListStore()

async function getList() {
    const res = await fetch(`http://localhost:8080/list`);
    const text = await res.text();

    if (res.ok) {
        return JSON.parse(text);
    } else {
        throw new Error(res);
    }
}