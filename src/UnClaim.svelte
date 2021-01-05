<script>
    import { item_store } from './stores.js';
        
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
        let url = `http://localhost:8080/unclaim`
        const res = await fetch(url, params);
        const text = await res.text();
        if (res.ok) {
            item_store.updateList()
        } else {
            throw new Error(res);
        }
    }

</script>


<button on:click={unclaimItem}>
    UnClaim
</button>