<script>
    import { item_store, texts_store } from './stores.js';
    import { removeClaimKey } from './claimKeys.js';
        
    let texts = {}
	texts_store.subscribe(val => {
		texts = val
    });

    export let item_id
    export let key
    let busy = false

    async function unclaimItem() {
        busy = true
        const params = {
            headers: {
                "content-type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify({
                id: item_id,
                key: key,
            }),
            method: "POST"
        }
        let url = config.api+'/unclaim/'+item_id
        const res = await fetch(url, params);
        busy = false
        if (res.ok) {
            removeClaimKey(item_id)
            item_store.updateList()
        } else {
            throw new Error(res);
        }
    }

</script>

<button class="unclaim secondary outline" disabled={busy} aria-busy={busy} on:click={unclaimItem}>
    {texts.unclaim}
</button>
