<script>
	import Item from './Item.svelte';
	import AddItem from './AddItem.svelte';
	import Login from './Login.svelte'
	import { item_store } from './stores.js';

	let list = ''
	item_store.subscribe(val => {
		list = val
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

	div.clear {
		clear: both;
	}
</style>

<h1>Wishlist</h1>
{#await list}
	<p>...waiting</p>
{:then items}
	{#each items as item}
		<Item item={item} />
	{/each}
	
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}
<div class="clear" />
<AddItem />
<Login />

