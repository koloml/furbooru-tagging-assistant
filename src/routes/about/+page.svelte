<script>
  import Menu from "$components/ui/menu/Menu.svelte";
  import MenuItem from "$components/ui/menu/MenuItem.svelte";
</script>

<Menu>
  <MenuItem href="/" icon="arrow-left">Back</MenuItem>
  <hr>
</Menu>
<h1>
  Furbooru Tagging Assistant
</h1>
<p>
  This is a tool made to help tag images on Furbooru more efficiently. It is currently in development and is not yet
  ready for use, but it still can provide some useful functionality.
</p>
<Menu>
  <hr>
  <MenuItem href="https://furbooru.org" icon="globe" target="_blank">
    Visit Furbooru
  </MenuItem>
  <MenuItem href="https://github.com/koloml/furbooru-tagging-assistant" icon="info-circle" target="_blank">
    GitHub Repo
  </MenuItem>
</Menu>
