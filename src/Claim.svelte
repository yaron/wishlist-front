<script>
    import Modal from './Modal.svelte';
    import { item_store, texts_store } from './stores.js';
    import { saveClaimKey, unclaimUrl } from './claimKeys.js';
        
    let texts = {}
	texts_store.subscribe(val => {
		texts = val
    });

    let showClaim = false
    export let item_id
    export let item_name
    let mail = ''
    let busy = false
    let undoLink = ''

    function close() {
        showClaim = false
        undoLink = ''
        item_store.updateList()
    }

    async function claimItem() {
        busy = true
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
        let url = config.api+'/claim/'+item_id
        const res = await fetch(url, params);
        busy = false
        if (res.ok) {
            const result = await res.json();
            if (result.key) {
                // Keep the modal open to show the undo link; the list is
                // refreshed when it closes, since that removes this component.
                saveClaimKey(item_id, result.key)
                undoLink = unclaimUrl(item_id, result.key)
            } else {
                close()
            }
        } else {
            throw new Error(await res.text());
        }
    }

</script>

{#if showClaim}
	<Modal onclose={close}>
		<h2 slot="header">
            {texts.claim} {item_name}
        </h2>
        {#if undoLink}
        <div class="claim-form">
            <p>{texts.claimedUndoInfo}</p>
            <input class="undo-link" readonly value={undoLink} on:focus={(e) => e.target.select()}>
        </div>
        {:else}
        <div class="claim-form">

                <label for="mail">{texts.yourMail}</label>
                <input id="mail" bind:value={mail}>
            <p class="disclaimer">{texts.mailDisclaimer}</p>
        </div>
		<button disabled={busy} on:click="{claimItem}">
            {texts.claim}
		</button>
        {/if}
	</Modal>
{/if}

<button class="claim btn" on:click="{() => showClaim=true}">
    {texts.claim}
</button>
<style>
    .undo-link {
        width: 100%;
        box-sizing: border-box;
    }
</style>
