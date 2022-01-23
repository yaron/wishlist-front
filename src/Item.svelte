<script>
	import { getContext } from "svelte";
	import Modal from './Modal.svelte';

	export let item = {}

	let showImage = false
	let hideClaim = getContext("hideClaim")
	let item_class = "unclaimed"
	if (item.claimed && !hideClaim) {
		item_class = "claimed"
	}
</script>

<section class="item {item_class}">
	<div class="title">
		<h3>{item.name}</h3>
	</div>
	<div class="image">
		{#if item.image != "" }
			<img class="thumb" src={item.image} on:click="{() => showImage=true}" alt="" />
		{/if}
	</div>
	<div class="link">
		{#if item.url != "" }
			<span><a target="_blank" href="{item.url}">Link</a></span>
		{/if}
	</div>
	<div class="price">
		{#if item.price > 0 }
			<span>&euro;{(item.price / 100).toFixed(2)}</span>
		{/if}
	</div>
	
	<slot></slot>
</section>
{#if showImage == true}
	<Modal on:close="{() => showImage = false}">
		<h2 slot="header">{item.name}</h2>
		<img class="big" src={item.image} alt="" />
	</Modal>
{/if}