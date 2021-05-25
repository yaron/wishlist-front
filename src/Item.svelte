<script>
	export let item = {}
	
	let item_class = "unclaimed"
	if (item.claimed) {
		item_class = "claimed"
	}
</script>

<section class="item {item_class}">
	<div class="title">
		<h3>{item.name}</h3>
	</div>
	<div class="image">
		<img class="thumb" src={item.image} alt="" />
	</div>
	<div class="link">
		<span><a target="_blank" href="{item.url}">Link</a></span>
	</div>
	<div class="price">
		<span>&euro;{(item.price / 100).toFixed(2)}</span>
	</div>
	
	<slot></slot>
</section>