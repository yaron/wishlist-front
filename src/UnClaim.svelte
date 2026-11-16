<script>
    import { onMount } from 'svelte';
    import Modal from './Modal.svelte';
    import { post, ApiError } from './api.js';
    import { item_store, texts } from './stores.js';
    import { removeClaimKey } from './claimKeys.js';

    // fromLink: the visitor opened the undo link from the mail or the claim dialog.
    let { item, key, fromLink = false } = $props();

    let showConfirm = $state(false);
    let busy = $state(false);
    let error = $state('');

    // Someone who follows the undo link came to do exactly this: show them the item and ask.
    onMount(() => {
        if (fromLink) {
            document.getElementById(`item-${item.id}`)?.scrollIntoView({ block: 'center' });
            showConfirm = true;
        }
    });

    function open() {
        error = '';
        showConfirm = true;
    }

    async function unclaimItem() {
        busy = true;
        error = '';
        try {
            await post(`/unclaim/${item.id}`, { key });
            removeClaimKey(item.id);
            if (fromLink) {
                // The link is used up; drop it from the address bar.
                history.replaceState(null, '', window.location.pathname);
            }
            showConfirm = false;
        } catch (err) {
            error = err instanceof ApiError && err.status === 403 ? texts.unclaimDenied : texts.actionError;
        } finally {
            busy = false;
        }
        item_store.updateList();
    }
</script>

{#if showConfirm}
    <Modal title="{texts.unclaim}: {item.name}" onclose={() => showConfirm = false}>
        <p>{texts.confirmUnclaim}</p>
        {#if error}
            <p class="error" role="alert">{error}</p>
        {/if}
        {#snippet footer()}
            <button type="button" class="secondary outline" onclick={() => showConfirm = false}>{texts.cancel}</button>
            <button type="button" disabled={busy} aria-busy={busy} onclick={unclaimItem}>{texts.unclaim}</button>
        {/snippet}
    </Modal>
{/if}

<button class="unclaim secondary outline" onclick={open}>
    {texts.unclaim}
</button>
