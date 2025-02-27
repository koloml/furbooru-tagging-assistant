<script lang="ts">
  import Menu from "$components/ui/menu/Menu.svelte";
  import MenuItem from "$components/ui/menu/MenuItem.svelte";
  import TagsEditor from "$components/tags/TagsEditor.svelte";
  import FormControl from "$components/ui/forms/FormControl.svelte";
  import TextField from "$components/ui/forms/TextField.svelte";
  import FormContainer from "$components/ui/forms/FormContainer.svelte";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { maintenanceProfiles } from "$stores/entities/maintenance-profiles";
  import MaintenanceProfile from "$entities/MaintenanceProfile";
  import { permalinks } from "$lib/extension/EntityPermalinks";

  const profilePermalinks = permalinks.profiles;

  let profileId = $derived(page.params.id);

  let targetProfile = $derived.by<MaintenanceProfile | null>(() => {
    if (profileId === 'new') {
      return new MaintenanceProfile(crypto.randomUUID(), {});
    }

    return $maintenanceProfiles.find(profile => profile.id === profileId) || null;
  });

  const backPermalink = $derived(
    profileId === 'new'
      ? profilePermalinks.list()
      : profilePermalinks.detail(profileId)
  );

  let profileName = $state('');
  let tagsList = $state<string[]>([]);

  $effect(() => {
    if (profileId === 'new') {
      return;
    }

    if (!targetProfile) {
      goto(profilePermalinks.list());
      return;
    }

    profileName = targetProfile.settings.name;
    tagsList = [...targetProfile.settings.tags].sort((a, b) => a.localeCompare(b));
  });

  async function saveProfile() {
    if (!targetProfile) {
      console.warn('Attempting to save the profile, but the profile is not loaded yet.');
      return;
    }

    targetProfile.settings.name = profileName;
    targetProfile.settings.tags = [...tagsList];
    targetProfile.settings.temporary = false;

    await targetProfile.save();
    await goto(profilePermalinks.detail(targetProfile.id));
  }
</script>

<Menu>
  <MenuItem href={backPermalink} icon="arrow-left">
    Back
  </MenuItem>
  <hr>
</Menu>
<FormContainer>
  <FormControl label="Profile Name">
    <TextField bind:value={profileName} placeholder="Profile Name"></TextField>
  </FormControl>
  <FormControl label="Tags">
    <TagsEditor bind:tags={tagsList}></TagsEditor>
  </FormControl>
</FormContainer>
<Menu>
  <hr>
  <MenuItem href="#" onclick={saveProfile}>Save Profile</MenuItem>
</Menu>
