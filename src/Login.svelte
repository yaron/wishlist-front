<script>
    import { user_store, texts_store } from './stores.js';
    
    let texts = {}
	texts_store.subscribe(val => {
		texts = val
    });

	let user = {}
	user_store.subscribe(val => {
		user = val
    });
</script>

{#if user.userId == null}
<a href="/.auth/login/aad" class="login" >
	{texts.login}
</a>
{:else}
<a href="/.auth/logout" class="logout" >
	{texts.logout}
</a>
{/if}