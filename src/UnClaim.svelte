<script>
    import { item_store, texts_store } from './stores.js';
        
    let texts = {}
	texts_store.subscribe(val => {
		texts = val
    });

    export let item_id
    export let key

    async function unclaimItem() {
        this.disabled = true
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
        let url = config.api+'/unclaim'
        const res = await fetch(url, params);
        const text = await res.text();
        if (res.ok) {
            item_store.updateList()
        } else {
            throw new Error(res);
        }
    }

</script>


<button class="unclaim" on:click={unclaimItem}>
    {texts.unclaim}
</button>