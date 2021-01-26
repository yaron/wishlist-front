<script>
    import Modal from './Modal.svelte';
    import { token_store, item_store, texts_store } from './stores.js';

    let showAdd = false
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
            item_store.updateList()
        } else {
            throw new Error(res);
        }
    }

</script>
<style>
    img.thumb {
        width: 90%;
        height: 90%;
    }

    div.form-container {
        width: 50%;
        float: left;
    }
    div.image-container {
        width: 50%;
        float: left;
    }

    div.clear {
        clear: both;
    }

</style>
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
                <label>
                    {texts.name}
                    <input bind:value={item.name}>
                </label>
                <label>
                    {texts.price}
                    <input type=number min=0 bind:value={item.price}>
                </label>
                <label>
                    {texts.claimable}
                    <input type=checkbox bind:checked={item.claimable}>
                </label>
                <label>
                    {texts.claimed}
                    <input type=checkbox bind:checked={item.claimed}>
                </label>
                <label>
                    {texts.url}
                    <input bind:value={item.url}>
                </label>
                <label>
                    {texts.image}
                    <input bind:value={item.image} on:select="{() => showImage=false}" on:blur="{() => showImage=true}">
                </label>
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

<button on:click="{() => showAdd=true}">
    {#if item.id != undefined}
        {texts.edit}
    {:else}
        {texts.add}
    {/if}
</button>