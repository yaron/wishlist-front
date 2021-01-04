<script>
	import Item from './Item.svelte';
	import AddItem from './AddItem.svelte';
	import Login from './Login.svelte'
	import { token_store, item_store } from './stores.js';

	let list = ''
	item_store.subscribe(val => {
		list = val
	});

	let token = ''
	token_store.subscribe(val => {
		token = val
	});
</script>

<style>
	section {
		width: 200px;
		padding: 16px;
		box-shadow: 2px 2px 4px #dedede;
		border: 1px solid #888;
		margin: 16px;
		float: left;
	}
</style>

<h1>Wishlist</h1>
{#await list}
	<p>...waiting</p>
{:then items}
	{#each items as item}
		<Item>
			<span slot="name">{item.name}</span>
			<span slot="price">&euro;{(item.price / 100).toFixed(2)}</span>

			<span slot="edit">			
			{#if token != ''}
				<AddItem item={item} />
			{/if}
			</span>

		</Item>
	{/each}
	
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}

<section>
	<AddItem />
</section>


<Login />

