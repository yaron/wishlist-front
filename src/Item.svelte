<script>
	import AddItem from './AddItem.svelte';
	import Claim from './Claim.svelte';
	import UnClaim from './UnClaim.svelte';
	import { token_store } from './stores.js';
	import queryString from "query-string";

	export let item = {}
	let token = ''
	const unsubscribe = token_store.subscribe(val => {
		token = val
	});
	
	let item_class = "unclaimed"
	if (item.claimed) {
		item_class = "claimed"
	}

	let queryParams;
	queryParams = queryString.parse(window.location.search);
</script>

<section class={item_class}>
	<div class="text">
		<span>{item.name}</span>
		<span>&euro;{(item.price / 100).toFixed(2)}</span>
			
		{#if token != ''}
			<AddItem item={item} />
		{/if}
	</div>
	<div class="image">
		<img class="thumb" src={item.image} alt="" />
	</div>
	<div>
		{#if item.claimable && !item.claimed}
			<Claim item_id={item.id} item_name={item.name} />
		{/if}
		{#if queryParams.id == item.id && item.claimable && item.claimed}
			<UnClaim item_id={item.id} key={queryParams.key} />
		{/if}
	</div>

</section>