<script>
    import Menu from "$components/ui/menu/Menu.svelte";
    import MenuLink from "$components/ui/menu/MenuLink.svelte";
    import {page} from "$app/stores";
    import {goto} from "$app/navigation";

    import {onDestroy} from "svelte";
    import {activeProfileStore, maintenanceProfilesStore} from "$stores/maintenance-profiles-store.js";

    const profileId = $page.params.id;
    /** @type {import('$lib/extension/entities/MaintenanceProfile.js').default|null} */
    let profile = null;
    let isActiveProfile = false;

    if (profileId === 'new') {
        goto('/maintenance/profiles/new/edit');
    }

    $: {
        const resolvedProfile = $maintenanceProfilesStore.find(profile => profile.id === profileId);

        if (resolvedProfile) {
            profile = resolvedProfile;
        } else {
            console.warn(`Profile ${profileId} not found.`);
            goto('/settings/maintenance');
        }
    }

    $: isActiveProfile = $activeProfileStore === profileId;

    function activateProfile() {
        if (isActiveProfile) {
            return;
        }

        $activeProfileStore = profileId;
    }
</script>

<Menu>
    <MenuLink href="/settings/maintenance" icon="arrow-left">Back</MenuLink>
    <hr>
</Menu>
{#if profile}
    <div class="block">
        <strong>Profile:</strong>
        <div>{profile.settings.name}</div>
    </div>
    <div class="block">
        <strong>Tags:</strong>
        <div class="tags-list">
            {#each profile.settings.tags as tagName}
                <span class="tag">{tagName}</span>
            {/each}
        </div>
    </div>
{/if}
<Menu>
    <hr>
    <MenuLink icon="wrench" href="/settings/maintenance/{profileId}/edit">Edit Profile</MenuLink>
    <MenuLink icon="tag" href="#" on:click={activateProfile}>
        {#if isActiveProfile}
            <span>Profile is Active</span>
        {:else}
            <span>Activate Profile</span>
        {/if}
    </MenuLink>
</Menu>

<style lang="scss">
    .tags-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }

    .block + .block {
        margin-top: .5em;

        strong {
            display: block;
            margin-bottom: .25em;
        }
    }
</style>
