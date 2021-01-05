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

<style>
	section {
		width: 200px;
		padding: 16px;
		box-shadow: 2px 2px 4px #dedede;
		border: 1px solid #888;
		margin: 16px;
		float: left;
	}

	section.claimed {
		background-color: #888;
	}

	section div {
		float: left;
		width: 50%;
	}

	section div span {
		float: left;
		width: 100%;
	}

	img.thumb {
		width: 100%;
		height: 100%;
	}
</style>

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