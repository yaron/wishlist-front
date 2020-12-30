<script>
	let list = getList()
	async function getList() {
		const res = await fetch(`http://localhost:8080/list`);
		const text = await res.text();

		if (res.ok) {
			return JSON.parse(text);
		} else {
			throw new Error(res);
		}
	}
</script>

<h1>Wishlist</h1>
{#await list}
	<p>...waiting</p>
{:then items}
	{#each items as item}
		<p>{item.name}</p>
	{/each}
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}