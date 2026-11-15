<script>
	import Item from './Item.svelte';
	import AddItem from './AddItem.svelte';
	import Login from './Login.svelte'
	import Claim from './Claim.svelte';
	import UnClaim from './UnClaim.svelte';
	import queryString from "query-string";
	import { setContext } from 'svelte';
	import { item_store, texts_store, user_store} from './stores.js';
	import { getClaimKey } from './claimKeys.js';

	let list = ''
	item_store.subscribe(val => {
		list = val
	});

    let texts = {}
	texts_store.subscribe(val => {
		texts = val
    });

	let user = {UserId: null}
	user_store.subscribe(val => {
		user = val
    });

	let queryParams;
	queryParams = queryString.parse(window.location.search);
	let hideClaim = false;
	// If we have context=hideClaim in the url or if the user is logged in, hide wether items have been claimed.
	if (queryParams.context == "hideClaim" || (user.userId != null && queryParams.context != "showClaim")) {
		hideClaim = true;
	}
	setContext("hideClaim", hideClaim)
</script>

<header class="container site-header">
	<h1>{config.title}</h1>
	<nav>
		<AddItem />
		<Login />
	</nav>
</header>

<main class="container">
	{#await list}
		<p aria-busy="true">{texts.waiting}</p>
	{:then items}
		<div class="items">
			{#each items as item (item.id)}
				<Item item={item}>
					{#if user.userId != null }
						<AddItem item={item} />
					{/if}
					{#if !hideClaim && item.claimable}
						{#if !item.claimed}
							<Claim item_id={item.id} item_name={item.name} />
						{:else if queryParams.id == item.id && queryParams.key}
							<UnClaim item_id={item.id} key={queryParams.key} />
						{:else if getClaimKey(item.id)}
							<UnClaim item_id={item.id} key={getClaimKey(item.id)} />
						{/if}
					{/if}
				</Item>
			{/each}
		</div>
	{:catch error}
		<p class="error" role="alert">{error.message}</p>
	{/await}
</main>

<div class="illustration" aria-hidden="true"></div>
