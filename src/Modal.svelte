<script>
	import { onMount } from 'svelte';
	import { texts } from './stores.js';

	let { title, onclose = () => {}, children, footer } = $props();

	let dialog = $state();

	// A native modal dialog traps focus, makes the page behind it inert
	// and gives focus back to the previous element when it closes.
	onMount(() => {
		dialog.showModal();
		return () => {
			if (dialog.open) dialog.close();
		};
	});

	// Escape: let the parent decide, so it can reset its own state.
	function handleCancel(e) {
		e.preventDefault();
		onclose();
	}

	// Clicks on the dialog itself (outside the article) are clicks on the backdrop.
	function handleClick(e) {
		if (e.target === dialog) onclose();
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog bind:this={dialog} oncancel={handleCancel} onclick={handleClick}>
	<article>
		<header>
			<button type="button" rel="prev" aria-label={texts.close} onclick={() => onclose()}></button>
			<h2>{title}</h2>
		</header>
		{@render children?.()}
		{#if footer}
			<footer>
				{@render footer()}
			</footer>
		{/if}
	</article>
</dialog>

<style>
	article {
		width: min(36rem, 100%);
	}

	header h2 {
		margin: 0;
		font-size: 1.25rem;
	}
</style>
