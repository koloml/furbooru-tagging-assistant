# Philomena Tagging Assistant

This is a browser extension written for the [Furbooru](https://furbooru.org) and [Derpibooru](https://derpibooru.org) 
image-boards. It gives you the ability to manually go over the list of images and apply tags to them without opening 
each individual image.

## Installation

This extension is available for both Chromium- and Firefox-based browsers. You can find the links to the extension pages
below.

### Furbooru Tagging Assistant

[![Get the Add-on on Firefox](.github/assets/firefox.png)](https://addons.mozilla.org/en-US/firefox/addon/furbooru-tagging-assistant/)
[![Get the extension on Chrome](.github/assets/chrome.png)](https://chromewebstore.google.com/detail/kpgaphaooaaodgodmnkamhmoedjcnfkj)

### Derpibooru Tagging Assistant

[![Get the Add-on on Firefox](.github/assets/firefox.png)](https://addons.mozilla.org/en-US/firefox/addon/derpibooru-tagging-assistant/)
[![Get the extension on Chrome](.github/assets/chrome.png)](https://chromewebstore.google.com/detail/pnmbomcdbfcghgmegklfofncfigdielb)

## Features

### Tagging Profiles

Select a set of tags and add/remove them from images without opening them. Just hover over image, click on tags and 
you're done!

![Tagging Profiles Showcase](.github/assets/profiles-showcase.png)

### Custom Tag Groups

Customize the list of tags with your own custom tag groups. Apply custom colors to different groups or even separate 
them from each other with group titles.

![Tag Groups Showcase](.github/assets/groups-showcase.png)

### Fullscreen Viewer

Open up the specific image or video in fullscreen mode by clicking 🔍 icon in the bottom left corner of the image. This 
feature is opt-in and should be enabled in the settings first.

![Fullscreen Viewer Icon](.github/assets/fullscreen-viewer-icon.png)

![Fullscreen Viewer Showcase](.github/assets/fullscreen-viewer-showcase.png)

## Building

Recommendations on environment:

- Recommended version of Node.js: LTS (20)

First you need to clone the repository and install all packages:

```shell
npm install --save-dev
```

Second, you need to run the `build` command. It will first build the popup using SvelteKit and then build all the 
content scripts/stylesheets and copy the manifest afterward.

Extension can currently be built for 2 different imageboards using one of the following commands:

```shell
# To build the extension for Furbooru, use:
npm run build

# To build the extension for Derpbooru, use:
npm run build:derpibooru
```

When build is complete, extension  files can be found in the `/build` directory. These files can be either used 
directly in Chrome (via loading the extension as unpacked extension) or manually compressed into `*.zip` file and loaded
into Firefox.
