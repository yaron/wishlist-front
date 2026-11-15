<script>
    import Modal from './Modal.svelte';
    import { user_store, item_store, texts_store } from './stores.js';
    import Item from './Item.svelte';
    import { getContext } from "svelte";

    let showAdd = false
    let showDelete = false
    let busy = false
    export let item = {}

    let error = ''

    function closeAdd() {
        showAdd = false
        error = ''
        // Edits are bound to the item directly; reload to undo unsaved changes.
        if (item.id != undefined) {
            item_store.updateList()
        }
    }

    let texts = {}
	texts_store.subscribe(val => {
		texts = val
    });

    let user = {UserId: null}
	user_store.subscribe(val => {
		user = val
    });

    let hideClaim = getContext("hideClaim");

    async function deleteItem() {
        busy = true
        const params = {
            headers: {
                "content-type": "application/json; charset=UTF-8",
            },
            method: "POST"
        }
        let url = config.api+'/itemDelete/' + item.id
        const res = await fetch(url, params);
        const text = await res.text();
        if (res.ok) {
            showDelete=false
            item_store.updateList()
        } else {
            throw new Error(res);
        }
    }

    async function addItem() {
        busy = true
        const params = {
            headers: {
                "content-type": "application/json; charset=UTF-8",
            },
            body: JSON.stringify({
                name: item.name,
                price: parseInt(item.price),
                claimed: item.claimed,
                claimable: item.claimable,
                url: item.url,
                image: item.image,
            }),
            method: "POST"
        }
        let url = config.api+'/itemAdd'
        if (item.id != undefined) {
            url = config.api+'/itemEdit/'+item.id
        }
        const res = await fetch(url, params);
        busy = false
        if (res.ok) {
            error = ''
            showAdd=false
            if (item.id == undefined) {
                item = {}
            }
            item_store.updateList()
        } else {
            const text = await res.text();
            try {
                error = JSON.parse(text).error || text
            } catch (e) {
                error = text || res.statusText
            }
        }
    }

</script>

{#if showAdd}
	<Modal onclose={closeAdd}>
		<h2 slot="header">
            {#if item.id != undefined}
                {texts.edit}
            {:else}
                {texts.add}
            {/if}
        </h2>
        <div class="edit-grid">
            <div>
                <label>
                    {texts.name}
                    <input id="name" bind:value={item.name} required>
                </label>
                <label>
                    {texts.price}
                    <input id="price" type=number min=0 bind:value={item.price}>
                </label>
                <label>
                    {texts.url}
                    <input id="url" type="url" bind:value={item.url}>
                </label>
                <label>
                    {texts.image}
                    <input id="image" type="url" bind:value={item.image}>
                </label>
                <fieldset>
                    <label>
                        <input id="claimable" type=checkbox role="switch" bind:checked={item.claimable}>
                        {texts.claimable}
                    </label>
                    {#if !hideClaim}
                        <label>
                            <input id="claimed" type=checkbox role="switch" bind:checked={item.claimed}>
                            {texts.claimed}
                        </label>
                    {/if}
                </fieldset>
            </div>
            {#if item.image}
                <img class="preview" src={item.image} alt="" />
            {/if}
        </div>
        {#if error}
            <p class="error" role="alert">{texts.saveError}: {error}</p>
        {/if}
        <svelte:fragment slot="footer">
            <button class="secondary outline" on:click={closeAdd}>{texts.cancel}</button>
            <button disabled={busy} aria-busy={busy} on:click={addItem}>
                {#if item.id != undefined}
                    {texts.save}
                {:else}
                    {texts.add}
                {/if}
            </button>
        </svelte:fragment>
	</Modal>
{/if}

{#if showDelete}
    <Modal onclose={() => showDelete = false}>
        <h2 slot="header">{texts.delete}</h2>
        <p>{texts.confirmDelete}</p>
        <p><strong>{item.name}</strong></p>
        <svelte:fragment slot="footer">
            <button class="secondary outline" on:click={() => showDelete = false}>{texts.cancel}</button>
            <button class="danger" disabled={busy} aria-busy={busy} on:click={deleteItem}>{texts.delete}</button>
        </svelte:fragment>
    </Modal>
{/if}

{#if user.userId != null}
    {#if item.id != undefined}
        <button class="icon secondary outline edit" on:click={() => showAdd = true} aria-label={texts.edit} title={texts.edit}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
        </button>
        <button class="icon secondary outline delete" on:click={() => showDelete = true} aria-label={texts.delete} title={texts.delete}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/></svg>
        </button>
    {:else}
        <button class="add" on:click={() => showAdd = true}>+ {texts.add}</button>
    {/if}
{/if}

<style>
    .edit-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    @media (min-width: 576px) {
        .edit-grid:has(.preview) {
            grid-template-columns: 3fr 2fr;
        }
    }
    .preview {
        width: 100%;
        max-height: 16rem;
        object-fit: contain;
        border-radius: var(--pico-border-radius);
        background: var(--wl-image-bg);
    }
</style>
