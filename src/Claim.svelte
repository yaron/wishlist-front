<script>
    import Modal from './Modal.svelte';
    import { item_store, texts_store } from './stores.js';
        
    let texts = {}
	texts_store.subscribe(val => {
		texts = val
    });

    let showClaim = false
    export let item_id
    export let item_name
    let mail = ''

    async function claimItem() {
        this.disabled = true
        const params = {
            headers: {
                "content-type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify({
                id: item_id,
                mail: mail,
            }),
            method: "POST"
        }
        let url = config.api+'/claim'
        const res = await fetch(url, params);
        const text = await res.text();
        if (res.ok) {
            showClaim=false
            item_store.updateList()
        } else {
            throw new Error(res);
        }
    }

</script>

{#if showClaim}
	<Modal on:close="{() => showClaim = false}">
		<h2 slot="header">
            {texts.claim} {item_name}
        </h2>
        <div class="form-container">
            <p>
                <label>
                    {texts.yourMail}
                    <input bind:value={mail}>
                </label>
            </p>
        </div>
		<button on:click="{claimItem}">
            {texts.claim}
		</button>
	</Modal>
{/if}

<button class="claim" on:click="{() => showClaim=true}">
    {texts.claim}
</button>