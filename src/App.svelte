<script>
	import Item from './Item.svelte';
	import AddItem from './AddItem.svelte';
	import Login from './Login.svelte';
	import Claim from './Claim.svelte';
	import UnClaim from './UnClaim.svelte';
	import { item_store, is_admin, texts } from './stores.js';
	import { getClaimKey } from './claimKeys.js';

	// The undo link from the mail or the claim dialog: ?id=<item>&key=<claim key>
	const params = new URLSearchParams(window.location.search);
	const linkId = params.get('id');
	const linkKey = params.get('key');

	function undoKey(item) {
		if (linkKey && linkId === item.id) return { key: linkKey, fromLink: true };
		const stored = getClaimKey(item.id);
		return stored ? { key: stored, fromLink: false } : null;
	}
</script>

<header class="container site-header">
	<h1>{config.title}</h1>
	{#if $is_admin}
		<nav>
			<AddItem />
		</nav>
	{/if}
</header>

<main class="container">
	{#if $item_store.error}
		<p class="error" role="alert">{texts.loadError}</p>
	{/if}
	{#if !$item_store.loaded}
		{#if !$item_store.error}
			<p aria-busy="true">{texts.waiting}</p>
		{/if}
	{:else if $item_store.items.length === 0}
		<p class="empty">{texts.empty}</p>
	{:else}
		<div class="items">
			{#each $item_store.items as item (item.id)}
				{@const undo = item.claimed ? undoKey(item) : null}
				<Item {item} highlight={undo?.fromLink === true}>
					{#if $is_admin}
						<AddItem {item} />
					{/if}
					{#if item.claimable}
						{#if !item.claimed}
							<Claim {item} />
						{:else if undo}
							<UnClaim {item} key={undo.key} fromLink={undo.fromLink} />
						{/if}
					{/if}
				</Item>
			{/each}
		</div>
	{/if}
</main>

<footer class="container site-footer">
	<Login />
</footer>

<div class="illustration" aria-hidden="true"></div>
