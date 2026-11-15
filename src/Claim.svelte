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
    let mailSent = false
    let mailFailed = false

    function close() {
        showClaim = false
        undoLink = ''
        mailSent = false
        mailFailed = false
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
                mailSent = result.mailSent === true
                mailFailed = mail.trim().length > 0 && !mailSent
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
		<h2 slot="header">{texts.claim}: {item_name}</h2>
		{#if undoLink}
			{#if mailSent}
				<p>{texts.claimedMailSent}</p>
			{:else if mailFailed}
				<p class="error" role="alert">{texts.claimedMailFailed}</p>
			{/if}
			<label>
				{texts.claimedUndoInfo}
				<input readonly value={undoLink} on:focus={(e) => e.target.select()}>
			</label>
		{:else}
			<label>
				{texts.yourMail}
				<input type="email" autocomplete="email" bind:value={mail} aria-describedby="mail-disclaimer-{item_id}">
				<small id="mail-disclaimer-{item_id}">{texts.mailDisclaimer}</small>
			</label>
		{/if}
		<svelte:fragment slot="footer">
			{#if undoLink}
				<button on:click={close}>{texts.close}</button>
			{:else}
				<button class="secondary outline" on:click={close}>{texts.cancel}</button>
				<button disabled={busy} aria-busy={busy} on:click={claimItem}>{texts.claim}</button>
			{/if}
		</svelte:fragment>
	</Modal>
{/if}

<button class="claim" on:click={() => showClaim = true}>
	{texts.claim}
</button>
