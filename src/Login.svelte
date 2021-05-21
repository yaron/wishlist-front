<script>
    import { token_store, texts_store } from './stores.js';
	import Modal from './Modal.svelte';
    
    let loginError = ''
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
            token_store.set(JSON.parse(text).token)
            showLogin = false
            loginError = ''
        } else {
            let resp = JSON.parse(text)
            if (resp.error) {
                loginError = resp.error
            } else if (resp.status && resp.status == "unauthorized") {
                loginError = texts.loginError
            }
            this.disabled = false
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
<button class="login" on:click="{() => showLogin = true}">
	{texts.login}
</button>
{:else}
<button class="logout" on:click="{() => token_store.set('')}">
	{texts.logout}
</button>
{/if}

{#if showLogin}
	<Modal on:close="{() => showLogin = false}">
		<h2 slot="header">
			{texts.login}
		</h2>
        {#if loginError != ''}
        <p class="error">{loginError}</p>
        {/if}
        <label for="username">{texts.username}</label>
        <input id="username" bind:value={username} placeholder="{texts.username}">
        
        <label for="password">{texts.password}</label>
        <input id="password" type="password" bind:value={password} placeholder="{texts.password}">
        
        <div class="clear" />
        <button on:click="{loginUser}">
            {texts.login}
        </button>
	</Modal>
{/if}