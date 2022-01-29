<script>
	import Item from './Item.svelte';
	import AddItem from './AddItem.svelte';
	import Login from './Login.svelte'
	import Claim from './Claim.svelte';
	import UnClaim from './UnClaim.svelte';
	import queryString from "query-string";
	import { setContext } from 'svelte';
	import { item_store, texts_store, user_store} from './stores.js';

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

<h1>{config.title}</h1>
{#await list}
	<p>{texts.waiting}</p>
{:then items}
	{#each items as item}
		<Item item={item}>
			<div class="buttons">
				{#if user.userId != null }
					<AddItem item={item} />
				{/if}
				{#if !hideClaim && item.claimable}
					{#if  !item.claimed}
						<Claim item_id={item.id} item_name={item.name} />
					{/if}
					{#if queryParams.id == item.id && item.claimed}
						<UnClaim item_id={item.id} key={queryParams.key} />
					{/if}
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