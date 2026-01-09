<script lang="ts">
  import Menu from "$components/ui/menu/Menu.svelte";
  import MenuItem from "$components/ui/menu/MenuItem.svelte";
  import { popupTitle } from "$stores/popup";

  $popupTitle = 'Import/Export';
</script>

<Menu>
  <MenuItem href="/" icon="arrow-left">Back</MenuItem>
  <hr>
  <MenuItem href="/transporting/export">Export</MenuItem>
  <MenuItem href="/transporting/import">Import</MenuItem>
</Menu>
