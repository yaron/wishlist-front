<script>
	import Modal from './Modal.svelte';
	import { texts } from './stores.js';

	let { item, highlight = false, children } = $props();

	let showImage = $state(false);
	// Images are hotlinked from shops, so they can disappear; fall back to the placeholder.
	let brokenImage = $state(null);
	let hasImage = $derived(Boolean(item.image) && brokenImage !== item.image);

	const priceFormat = new Intl.NumberFormat(config.language, { style: 'currency', currency: 'EUR' });
</script>

<article class="item" class:claimed={item.claimed} class:highlight id="item-{item.id}">
	<div class="item-image">
		{#if hasImage}
			<button class="image-button" onclick={() => showImage = true} aria-label="{texts.enlarge}: {item.name}">
				<img src={item.image} alt="" loading="lazy" onerror={() => brokenImage = item.image} />
			</button>
		{:else}
			<svg class="placeholder" viewBox="0 0 24 24" aria-hidden="true">
				<path d="M20 12v9H4v-9M2 7h20v5H2zM12 21V7M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7z" />
			</svg>
		{/if}
		{#if item.claimed}
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
		{@render children?.()}
	</footer>
</article>

{#if showImage}
	<Modal title={item.name} onclose={() => showImage = false}>
		<img class="big" src={item.image} alt={item.name} />
	</Modal>
{/if}
