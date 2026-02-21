import { loadManifest } from "./lib/manifest.js";
import path from "path";
import { buildScriptsAndStyles } from "./lib/content-scripts.js";
import { extractInlineScriptsFromIndex } from "./lib/index-file.js";
import { normalizePath } from "vite";

/**
 * Build addition assets required for the extension and pack it into the directory.
 * @param {PackExtensionSettings} settings Build settings.
 */
export async function packExtension(settings) {
  const manifest = loadManifest(path.resolve(settings.rootDir, 'manifest.json'));

  const replacementMapping = await buildScriptsAndStyles({
    inputs: manifest.collectContentScripts(),
    outputDir: settings.contentScriptsDir,
    rootDir: settings.rootDir,
  });

  await manifest.mapContentScripts(async entry => {
    if (entry.js) {
      entry.js = entry.js
        .map(jsSourcePath => {
          if (!replacementMapping.has(jsSourcePath)) {
            return [];
          }

          return replacementMapping.get(jsSourcePath);
        })
        .flat(1)
        .map(pathName => {
          return normalizePath(
            path.relative(
              settings.exportDir,
              path.join(
                settings.contentScriptsDir,
                pathName
              )
            )
          )
        });
    }

    if (entry.css) {
      entry.css = entry.css
        .map(jsSourcePath => {
          if (!replacementMapping.has(jsSourcePath)) {
            return [];
          }

          return replacementMapping.get(jsSourcePath);
        })
        .flat(1)
        .map(pathName => {
          return normalizePath(
            path.relative(
              settings.exportDir,
              path.join(
                settings.contentScriptsDir,
                pathName
              )
            )
          )
        })
    }

    return entry;
  })

  switch (process.env.SITE) {
    case 'derpibooru':
      manifest.replaceHostTo([
        'derpibooru.org',
        'trixiebooru.org'
      ]);
      manifest.replaceBooruNameWith('Derpibooru');
      manifest.setGeckoIdentifier('derpibooru-tagging-assistant@thecore.city');
      break;

    case 'tantabus':
      manifest.replaceHostTo('tantabus.ai');
      manifest.replaceBooruNameWith('Tantabus');
      manifest.setGeckoIdentifier('tantabus-tagging-assistant@thecore.city');
      break;

    default:
      console.warn('No replacement set up for site: ' + process.env.SITE);
  }

  manifest.passVersionFromPackage(path.resolve(settings.rootDir, 'package.json'));
  manifest.saveTo(path.resolve(settings.exportDir, 'manifest.json'));

  extractInlineScriptsFromIndex(path.resolve(settings.exportDir, 'index.html'));
}

/**
 * @typedef {Object} PackExtensionSettings
 * @property {string} rootDir Root directory of the repository. Required for properly fetching source files.
 * @property {string} exportDir Directory of the built extension.
 * @property {string} contentScriptsDir Directory specifically for content scripts entries.
 */
