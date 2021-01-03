<script>
	import Item from './Item.svelte';
	import Login from './Login.svelte'
	import Edit from './Edit.svelte'
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

<h1>Wishlist</h1>
{#if token != ''}
	<h2>Hello</h2>
{/if}
{#await list}
	<p>...waiting</p>
{:then items}
	{#each items as item}
		<Item>
			<span slot="name">{item.name}</span>
			<span slot="price">&euro;{(item.price / 100).toFixed(2)}</span>

			<span slot="edit">			
			{#if token != ''}
				<Edit item={item} />
			{/if}
			</span>

		</Item>
	{/each}
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}

<Login />

