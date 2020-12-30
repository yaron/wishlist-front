<script>
	import Item from './Item.svelte';
	import Modal from './Modal.svelte';

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

	async function loginUser() {
		this.disabled = true
		const params = {
			headers: {
				"content-type": "application/json; charset=UTF-8"
			},
			body: JSON.stringify({
				user: username,
				password: password
			}),
			method: "POST"
		}
		password = ''
		const res = await fetch(`http://localhost:8080/login`, params);
		const text = await res.text();
		if (res.ok) {
			token=JSON.parse(text).token;
			showLogin=false
		} else {
			throw new Error(res);
		}
	}

	let showLogin = false
	let showEdit = false
	let editing={}
	let username = ''
	let password = ''
	let token = ''
</script>

<h1>Wishlist</h1>
{#if token != ''}
	<h2>Hello {username}</h2>
{/if}
{#await list}
	<p>...waiting</p>
{:then items}
	{#each items as item}
		<Item>
			<span slot="name">{item.name}</span>
			<span slot="price">&euro;{(item.price / 100).toFixed(2)}</span>

			<span slot="edit">			
			{#if token != ''}
				<button on:click="{() => {showEdit=true ; editing=item}}">
					Edit
				</button>
			{/if}
			</span>

		</Item>
	{/each}
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}

{#if token == ''}
<button on:click="{() => showLogin = true}">
	Login
</button>
{/if}

{#if showLogin}
	<Modal on:close="{() => showLogin = false}">
		<h2 slot="header">
			Login
		</h2>
		<p>
			<label>
				Username
				<input bind:value={username} placeholder="enter your username">
			</label>
			<label>
				Password
				<input type="password" bind:value={password} placeholder="enter your password">
			</label>
			<button on:click="{loginUser}">
				Login
			</button>
		</p>
	</Modal>
{/if}
{#if showEdit}
	<Modal on:close="{() => showEdit = false}">
		<h2 slot="header">
			Edit
		</h2>
		<p>
			<label>
				Name
				<input bind:value={editing.name}>
			</label>
		</p>
	</Modal>
{/if}