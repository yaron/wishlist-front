<script>
    import Modal from './Modal.svelte';
    import { token_store, item_store, texts_store } from './stores.js';
    import Item from './Item.svelte';

    let showAdd = false
    let showDelete = false
    export let item = {}

    let showImage = true

    let token = ''
	token_store.subscribe(val => {
		token = val
    });

    let texts = {}
	texts_store.subscribe(val => {
		texts = val
    });

    async function deleteItem() {
        this.disabled = true
        const params = {
            headers: {
                "content-type": "application/json; charset=UTF-8",
                "Authorization": "Bearer " + token
            },
            method: "POST"
        }
        let url = config.api+'/admin/delete/' + item.id
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
        this.disabled = true
        const params = {
            headers: {
                "content-type": "application/json; charset=UTF-8",
                "Authorization": "Bearer " + token
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
        let url = config.api+'/admin/add'
        if (item.id != undefined) {
            url = config.api+'/admin/edit/'+item.id
        }
        const res = await fetch(url, params);
        const text = await res.text();
        if (res.ok) {
            showAdd=false
            if (item.id == undefined) {
                item = {}
            }
            item_store.updateList()
        } else {
            throw new Error(res);
        }
    }

</script>

{#if showAdd}
	<Modal on:close="{() => showAdd = false}">
		<h2 slot="header">
            {#if item.id != undefined}
                {texts.edit}
            {:else}
                {texts.add}
            {/if}
        </h2>
        <div class="form-container">
            <p>
                <label for="name">{texts.name}</label>
                <input id="name" bind:value={item.name}>
                
                <label for="price">{texts.price}</label>
                <input id="price" type=number min=0 bind:value={item.price}>
                
                <label for="claimable">{texts.claimable}</label>
                <input id="claimable" type=checkbox bind:checked={item.claimable}>
                
                <label for="claimed">{texts.claimed}</label>
                <input id="claimed" type=checkbox bind:checked={item.claimed}>
                
                <label for="url">{texts.url}</label>
                <input id="url" bind:value={item.url}>
                
                <label for="image">{texts.image}</label>
                <input id="image" bind:value={item.image} on:select="{() => showImage=false}" on:blur="{() => showImage=true}">
                
            </p>
        </div>
        <div class="image-container">
            {#if item.image != undefined && item.image.length > 0 && showImage}
                <img class="thumb" src={item.image} alt="" />
            {/if}
        </div>
        <div class="clear" />
		<button on:click="{addItem}">
            {#if item.id != undefined}
                {texts.edit}
            {:else}
                {texts.add}
            {/if}
		</button>
	</Modal>
{/if}

{#if showDelete}
    <Modal on:close="{() => showDelete = false}">
        <h2 slot="header">
            {texts.delete}
        </h2>
        <div class="confirm">
            <p>
                {texts.confirmDelete}
            </p>
            <Item item={item} />
        </div>
        <div class="clear" />
        <button on:click="{deleteItem}">
            {texts.delete}
        </button>
    </Modal>
{/if}

{#if token != ''}
    {#if item.id != undefined}
        <button class="edit" on:click="{() => showAdd=true}"><img src="img/edit.png" alt="{texts.edit}"/></button>
        <button class="delete" on:click="{() => showDelete=true}"><img src="img/delete.png" alt="{texts.delete}"/></button>
    {:else}
        <button class="add" on:click="{() => showAdd=true}">{texts.add}</button>
    {/if}
{/if}