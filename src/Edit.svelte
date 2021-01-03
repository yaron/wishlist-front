<script>
    import Modal from './Modal.svelte';
    import { token_store, item_store } from './stores.js';
    let showEdit = false
    let editing={}
    export let item

    let token = ''
	token_store.subscribe(val => {
		token = val
    });

    async function editItem() {
        this.disabled = true
        const params = {
            headers: {
                "content-type": "application/json; charset=UTF-8",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                name: editing.name,
                price: parseInt(editing.price),
                claimed: item.claimed,
                claimable: item.claimable,
                url: item.url,
                image: item.image,
            }),
            method: "POST"
        }
        const res = await fetch(`http://localhost:8080/admin/edit/`+item.id, params);
        const text = await res.text();
        if (res.ok) {
            showEdit=false
            item_store.updateList()
        } else {
            throw new Error(res);
        }
    }

</script>

{#if showEdit}
	<Modal on:close="{() => showEdit = false}">
		<h2 slot="header">
			Edit
		</h2>
		<p>
			<label>
				Name
				<input bind:value={editing.name}>
            </label>
            <label>
				Price
				<input bind:value={editing.price}>
			</label>
		</p>
		<button on:click="{editItem}">
			Edit
		</button>
	</Modal>
{/if}

<button on:click="{() => {showEdit=true ; editing=item}}">
    Edit
</button>