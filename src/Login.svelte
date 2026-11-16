<script>
    import { user_store, texts } from './stores.js';
</script>

{#if $user_store.userId == null}
    <a href="/.auth/login/aad" class="login">{texts.login}</a>
{:else}
    <a href="/.auth/logout" class="logout">{texts.logout}</a>
{/if}
