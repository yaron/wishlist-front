<script>
    import Modal from './Modal.svelte';
    import { post, ApiError } from './api.js';
    import { item_store, texts } from './stores.js';
    import { saveClaimKey, unclaimUrl } from './claimKeys.js';

    let { item } = $props();
    const formId = $props.id();

    let showClaim = $state(false);
    let mail = $state('');
    let busy = $state(false);
    let error = $state('');
    let undoLink = $state('');
    let mailSent = $state(false);
    let mailFailed = $state(false);
    let copied = $state(false);

    function open() {
        error = '';
        showClaim = true;
    }

    // The list is refreshed when the modal closes, since a claimed item no longer
    // shows this component (and with it, this modal).
    function close() {
        showClaim = false;
        item_store.updateList();
    }

    async function claimItem(e) {
        e.preventDefault();
        busy = true;
        error = '';
        try {
            const result = await post(`/claim/${item.id}`, { mail });
            saveClaimKey(item.id, result.key);
            mailSent = result.mailSent === true;
            mailFailed = mail.trim().length > 0 && !mailSent;
            undoLink = unclaimUrl(item.id, result.key);
        } catch (err) {
            error = err instanceof ApiError && err.status === 409 ? texts.claimTaken : texts.actionError;
        } finally {
            busy = false;
        }
    }

    async function copyLink() {
        try {
            await navigator.clipboard.writeText(undoLink);
            copied = true;
        } catch (err) {
            // No clipboard access; the link can still be selected and copied by hand.
        }
    }
</script>

{#if showClaim}
    <Modal title="{texts.claim}: {item.name}" onclose={close}>
        {#if undoLink}
            {#if mailSent}
                <p>{texts.claimedMailSent}</p>
            {:else if mailFailed}
                <p class="error" role="alert">{texts.claimedMailFailed}</p>
            {/if}
            <label>
                {texts.claimedUndoInfo}
                <input readonly value={undoLink} onfocus={(e) => e.target.select()}>
            </label>
        {:else}
            <form id={formId} onsubmit={claimItem}>
                <label>
                    {texts.yourMail}
                    <!-- svelte-ignore a11y_autofocus -->
                    <input type="email" name="mail" autocomplete="email" bind:value={mail} autofocus aria-describedby="{formId}-disclaimer">
                    <small id="{formId}-disclaimer">{texts.mailDisclaimer}</small>
                </label>
            </form>
            {#if error}
                <p class="error" role="alert">{error}</p>
            {/if}
        {/if}
        {#snippet footer()}
            {#if undoLink}
                <button type="button" class="secondary outline" onclick={copyLink}>{copied ? texts.copied : texts.copy}</button>
                <button type="button" onclick={close}>{texts.close}</button>
            {:else}
                <button type="button" class="secondary outline" onclick={close}>{texts.cancel}</button>
                <button type="submit" form={formId} disabled={busy} aria-busy={busy}>{texts.claim}</button>
            {/if}
        {/snippet}
    </Modal>
{/if}

<button class="claim" onclick={open}>
    {texts.claim}
</button>
