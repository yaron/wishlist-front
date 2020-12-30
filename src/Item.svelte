<style>
	section {
		width: 200px;
		display: grid;
		grid-template-columns: 1fr 1fr;
		padding: 16px;
		box-shadow: 2px 2px 4px #dedede;
		border: 1px solid #888;
		margin-bottom: 16px;
	}
</style>

<section>
    <div>Name</div>
    <slot name="name" />
    <div>Price</div>
    <slot name="price" />
    <div>Edit</div>
    <slot name="edit" />
</section>