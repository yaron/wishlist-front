<script>
    import { token_store, texts_store } from './stores.js';
	import Modal from './Modal.svelte';
    
    let texts = {}
	texts_store.subscribe(val => {
		texts = val
    });

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
        const res = await fetch(config.api+'/login', params)
        const text = await res.text();
        if (res.ok) {
            token_store.set(JSON.parse(text).token);
            showLogin=false
        } else {
            throw new Error(res);
        }
    }

    let username = ''
    let password = ''
    let showLogin = false
    let token = ''
	const unsubscribe = token_store.subscribe(val => {
		token = val
	});
</script>

{#if token == ''}
<button on:click="{() => showLogin = true}">
	{texts.login}
</button>
{:else}
<button on:click="{() => token_store.set('')}">
	{texts.logout}
</button>
{/if}

{#if showLogin}
	<Modal on:close="{() => showLogin = false}">
		<h2 slot="header">
			{texts.login}
		</h2>
		<p>
			<label>
				{texts.username}
				<input bind:value={username} placeholder="enter your username">
			</label>
			<label>
				{texts.password}
				<input type="password" bind:value={password} placeholder="enter your password">
			</label>
			<button on:click="{loginUser}">
				{texts.login}
			</button>
		</p>
	</Modal>
{/if}