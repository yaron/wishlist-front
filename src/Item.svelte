<script>
	import { getContext } from "svelte";
	import Modal from './Modal.svelte';
	import { texts_store } from './stores.js';

	export let item = {}

	let texts = {}
	texts_store.subscribe(val => {
		texts = val
	});

	let showImage = false
	let hideClaim = getContext("hideClaim")
	$: claimed = item.claimed && !hideClaim

	const priceFormat = new Intl.NumberFormat(config.language, { style: 'currency', currency: 'EUR' })
</script>

<article class="item" class:claimed>
	<div class="item-image">
		{#if item.image}
			<button class="image-button" on:click={() => showImage = true} aria-label={item.name}>
				<img src={item.image} alt="" loading="lazy" />
			</button>
		{:else}
			<svg class="placeholder" viewBox="0 0 24 24" aria-hidden="true">
				<path d="M20 12v9H4v-9M2 7h20v5H2zM12 21V7M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7z" />
			</svg>
		{/if}
		{#if claimed}
			<span class="badge">{texts.claimed}</span>
		{/if}
	</div>

	<div class="item-body">
		<h3>{item.name}</h3>
		{#if item.price > 0}
			<p class="price">{priceFormat.format(item.price / 100)}</p>
		{/if}
	</div>

	<footer class="item-actions">
		{#if item.url}
			<a class="link" href={item.url} target="_blank" rel="noopener noreferrer">{texts.url} ↗</a>
		{/if}
		<slot></slot>
	</footer>
</article>

{#if showImage}
	<Modal onclose={() => showImage = false}>
		<h2 slot="header">{item.name}</h2>
		<img class="big" src={item.image} alt={item.name} />
	</Modal>
{/if}
