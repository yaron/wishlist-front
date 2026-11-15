<script>
	import { onMount } from 'svelte';
	import { texts_store } from './stores';
	let texts = {}
	texts_store.subscribe(val => {
		texts = val
	});

	export let onclose = () => {};
	const close = () => onclose();

	let dialog;

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
		close();
	}

	// Clicks on the dialog itself (outside the article) are clicks on the backdrop.
	function handleClick(e) {
		if (e.target === dialog) close();
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog bind:this={dialog} on:cancel={handleCancel} on:click={handleClick}>
	<article>
		<header>
			<button rel="prev" aria-label={texts.close} on:click={close}></button>
			<slot name="header"></slot>
		</header>
		<slot></slot>
		{#if $$slots.footer}
			<footer>
				<slot name="footer"></slot>
			</footer>
		{/if}
	</article>
</dialog>

<style>
	article {
		width: min(36rem, 100%);
	}

	header :global(h2) {
		margin: 0;
		font-size: 1.25rem;
	}
</style>
