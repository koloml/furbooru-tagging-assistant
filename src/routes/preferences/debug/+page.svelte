<script>
  import Menu from "$components/ui/menu/Menu.svelte";
  import MenuItem from "$components/ui/menu/MenuItem.svelte";
  import { popupTitle } from "$stores/popup";

  $popupTitle = 'Debugging Tools';
</script>

<Menu>
  <MenuItem href="/preferences" icon="arrow-left">Back</MenuItem>
  <hr>
  <MenuItem href="/preferences/debug/storage">Inspect Storages</MenuItem>
</Menu>
