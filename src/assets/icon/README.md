# Extension Icon

This folder contains original resources used to make an icon for the extension. Since I'm not really an icon designer, I
ended up just composing the icon from sites logos + the shorthand name of the extension with fancy font. Nothing 
special.

## Sources

All resources used for composing an icon are stored here as copies just to not lose anything. Original assets are 
sourced from the following places:

- [Derpibooru Logo](https://github.com/derpibooru/philomena/blob/40ffb1b75bd0d96db24fa7c84bce36fcb7f2935f/assets/static/favicon.svg)
- [Furbooru Logo](https://github.com/furbooru/philomena/blob/cbfde406de34734403c06952bcaca51db6df1390/assets/static/favicon.svg)
- [Tantabus Logo](https://github.com/tantabus-ai/philomena/blob/285a7666ae4be46ac4da36bbc9ac8fda9e5c0fc3/assets/static/favicon.svg)
- [RoundFeather Font](https://drive.google.com/file/d/18ggNplAZNYtO4eNtMUpv3XpkeOAxSkxm/view?usp=sharing) 
  - Made by [allorus162](https://bsky.app/profile/allorus162.bsky.social) 
  - [Original Bluesky post](https://bsky.app/profile/allorus162.bsky.social/post/3mfqntff4j22i)

## Rendering

**Note:** You don't need to do anything to pack current version of icon to the extension. All icons are already pre-rendered and
placed into the `static` directory. 

For now, any change to the icons will require manual re-rendering of PNG versions of the logos used when packing 
extension for the release. All you need is to open `/src/assets/icon/icon.svg` in software like Inskape, hide the 
currently opened logo and toggle the required one and save it into `icon256.png`, `icon128.png`, `icon48.png` and 
`icon16.png`.

For the font on the bottom-right to work, you will need to install it from the file 
`src/assets/icon/fonts/roundfeather-regular-1.001.ttf` (or you can download and install it from the source link).

You should render them into `/static` directory in the following structure:

- Place Furbooru icons into `/static` directory
- Then add same icons for Derpibooru and Tantabus into `/static/icons/depribooru` and `/static/icons/tantabus` 
  respectively.

Resulting structure will look like this:

```
static/
    icons/
        derpibooru/
            icon16.png
            icon48.png
            icon128.png
            icon256.png
        tantabus/
            icon16.png
            icon48.png
            icon128.png
            icon256.png
    icon16.png
    icon48.png
    icon128.png
    icon256.png
```
