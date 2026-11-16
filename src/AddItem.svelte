<script>
    import Modal from './Modal.svelte';
    import { post, ApiError } from './api.js';
    import { item_store, texts } from './stores.js';

    // Without an item this is the "add" button; with one, the edit and delete buttons.
    let { item = null } = $props();
    const formId = $props.id();

    let showEdit = $state(false);
    let showDelete = $state(false);
    let busy = $state(false);
    let error = $state('');
    // The form edits a copy, so the card behind it only changes once it is saved.
    let draft = $state({});

    function openEdit() {
        draft = {
            name: item?.name ?? '',
            // Stored in cents, entered in euros.
            price: item?.price > 0 ? item.price / 100 : null,
            url: item?.url ?? '',
            image: item?.image ?? '',
            claimable: item?.claimable ?? false,
            claimed: item?.claimed ?? false,
        };
        error = '';
        showEdit = true;
    }

    function openDelete() {
        error = '';
        showDelete = true;
    }

    function describe(err) {
        if (err instanceof ApiError && err.status === 409) return texts.conflict;
        if (err instanceof ApiError && err.message) return `${texts.saveError}: ${err.message}`;
        return texts.actionError;
    }

    async function save(e) {
        e.preventDefault();
        busy = true;
        error = '';
        const body = {
            name: draft.name,
            price: typeof draft.price === 'number' ? Math.round(draft.price * 100) : 0,
            claimable: draft.claimable,
            url: draft.url,
            image: draft.image,
        };
        // Only send "claimed" when it was changed here, so saving cannot undo
        // a claim that a visitor made while this form was open.
        if (!item || draft.claimed !== item.claimed) {
            body.claimed = draft.claimed;
        }
        try {
            await post(item ? `/itemEdit/${item.id}` : '/itemAdd', body);
            showEdit = false;
        } catch (err) {
            error = describe(err);
        } finally {
            busy = false;
        }
        item_store.updateList();
    }

    async function remove() {
        busy = true;
        error = '';
        try {
            await post(`/itemDelete/${item.id}`);
            showDelete = false;
        } catch (err) {
            error = describe(err);
        } finally {
            busy = false;
        }
        item_store.updateList();
    }
</script>

{#if showEdit}
    <Modal title={item ? texts.edit : texts.add} onclose={() => showEdit = false}>
        <form id={formId} class="edit-grid" onsubmit={save}>
            <div>
                <label>
                    {texts.name}
                    <!-- svelte-ignore a11y_autofocus -->
                    <input name="name" bind:value={draft.name} required maxlength="200" autofocus>
                </label>
                <label>
                    {texts.price}
                    <input name="price" type="number" min="0" step="0.01" inputmode="decimal" bind:value={draft.price}>
                </label>
                <label>
                    {texts.url}
                    <input name="url" type="url" bind:value={draft.url}>
                </label>
                <label>
                    {texts.image}
                    <input name="image" type="url" bind:value={draft.image}>
                </label>
                <fieldset>
                    <label>
                        <input name="claimable" type="checkbox" role="switch" bind:checked={draft.claimable}>
                        {texts.claimable}
                    </label>
                    <label>
                        <input name="claimed" type="checkbox" role="switch" bind:checked={draft.claimed}>
                        {texts.claimed}
                    </label>
                </fieldset>
            </div>
            {#if draft.image}
                <img class="preview" src={draft.image} alt="" />
            {/if}
        </form>
        {#if error}
            <p class="error" role="alert">{error}</p>
        {/if}
        {#snippet footer()}
            <button type="button" class="secondary outline" onclick={() => showEdit = false}>{texts.cancel}</button>
            <button type="submit" form={formId} disabled={busy} aria-busy={busy}>
                {item ? texts.save : texts.add}
            </button>
        {/snippet}
    </Modal>
{/if}

{#if showDelete}
    <Modal title={texts.delete} onclose={() => showDelete = false}>
        <p>{texts.confirmDelete}</p>
        <p><strong>{item.name}</strong></p>
        {#if error}
            <p class="error" role="alert">{error}</p>
        {/if}
        {#snippet footer()}
            <button type="button" class="secondary outline" onclick={() => showDelete = false}>{texts.cancel}</button>
            <button type="button" class="danger" disabled={busy} aria-busy={busy} onclick={remove}>{texts.delete}</button>
        {/snippet}
    </Modal>
{/if}

{#if item}
    <button class="icon secondary outline edit" onclick={openEdit} aria-label={texts.edit} title={texts.edit}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
    </button>
    <button class="icon secondary outline delete" onclick={openDelete} aria-label={texts.delete} title={texts.delete}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/></svg>
    </button>
{:else}
    <button class="add" onclick={openEdit}>+ {texts.add}</button>
{/if}

<style>
    .edit-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
        margin: 0;
    }
    @media (min-width: 576px) {
        .edit-grid:has(.preview) {
            grid-template-columns: 3fr 2fr;
        }
    }
    .preview {
        width: 100%;
        max-height: 16rem;
        object-fit: contain;
        border-radius: var(--pico-border-radius);
        background: var(--wl-image-bg);
    }
</style>
