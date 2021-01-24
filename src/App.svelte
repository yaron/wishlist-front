<script>
	import Item from './Item.svelte';
	import AddItem from './AddItem.svelte';
	import Login from './Login.svelte'
	import { item_store, texts_store} from './stores.js';

	let list = ''
	item_store.subscribe(val => {
		list = val
	});

    let texts = {}
	texts_store.subscribe(val => {
		texts = val
    });
</script>

<style>
	div.clear {
		clear: both;
	}
</style>

<h1>{texts.title}</h1>
{#await list}
	<p>{texts.waiting}</p>
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

