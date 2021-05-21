<script>
	import Item from './Item.svelte';
	import AddItem from './AddItem.svelte';
	import Login from './Login.svelte'
	import Claim from './Claim.svelte';
	import UnClaim from './UnClaim.svelte';
	import queryString from "query-string";
	import { token_store, item_store, texts_store} from './stores.js';

	let list = ''
	item_store.subscribe(val => {
		list = val
	});

    let texts = {}
	texts_store.subscribe(val => {
		texts = val
    });

	let token = ''
	const unsubscribe = token_store.subscribe(val => {
		token = val
	});

	let queryParams;
	queryParams = queryString.parse(window.location.search);
</script>

<h1>{config.title}</h1>
{#await list}
	<p>{texts.waiting}</p>
{:then items}
	{#each items as item}
		<Item item={item}>
			<div class="buttons">
				{#if token != ''}
					<AddItem item={item} />
				{/if}
				{#if item.claimable && !item.claimed}
					<Claim item_id={item.id} item_name={item.name} />
				{/if}
				{#if queryParams.id == item.id && item.claimable && item.claimed}
					<UnClaim item_id={item.id} key={queryParams.key} />
				{/if}
			</div>
		</Item>
	{/each}
	
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}
<div class="clear" />
<AddItem />
<Login />