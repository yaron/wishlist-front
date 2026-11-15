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
<a href="/.auth/login/aad" class="login secondary" role="button">
	{texts.login}
</a>
{:else}
<a href="/.auth/logout" class="logout secondary outline" role="button">
	{texts.logout}
</a>
{/if}
