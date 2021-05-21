<script>
	export let item = {}
	
	let item_class = "unclaimed"
	if (item.claimed) {
		item_class = "claimed"
	}
</script>

<section class="item {item_class}">
	<div class="text">
		<span>{item.name}</span>
		<span>&euro;{(item.price / 100).toFixed(2)}</span>
	</div>
	<div class="image">
		<img class="thumb" src={item.image} alt="" />
	</div>
	<slot></slot>
</section>