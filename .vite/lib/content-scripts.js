import { build } from "vite";
import { createHash } from "crypto";
import path from "path";
import fs from "fs";

/**
 * Create the result base file name for the file.
 * @param {string} inputPath Path to the original filename.
 * @return {string} Result base file name without extension. Contains original filename + hash suffix.
 */
function createOutputBaseName(inputPath) {
  const hashSuffix = createHash('sha256')
    .update(
      // Yes, suffix is only dependent on the entry file, dependencies are not included.
      fs.readFileSync(inputPath, 'utf8')
    )
    .digest('base64url')
    .substring(0, 8);

  const baseName = path.basename(inputPath, path.extname(inputPath));

  return `${baseName}-${hashSuffix}`;
}

/**
 * Small workaround plugin to cover each individual content script into IIFE. This is pretty much mandatory to use,
 * otherwise helper functions made by Vite will collide with each other. Only include this plugin into config with
 * script!
 * @return {import('vite').Plugin}
 */
function wrapScriptIntoIIFE() {
  return {
    name: 'wrap-scripts-into-iife',
    generateBundle(outputBundles, bundle) {
      Object.keys(bundle).forEach(fileName => {
        const file = bundle[fileName];

        file.code = `(() => {\n${file.code}})();`
      });
    }
  }
}

/**
 * Default aliases used inside popup app.
 * @param {string} rootDir Root directory of the repo for building paths.
 * @return {Record<string, string>} Aliases to include into the config object.
 */
function makeAliases(rootDir) {
  return {
    "$config": path.resolve(rootDir, 'src/config'),
    "$lib": path.resolve(rootDir, 'src/lib'),
    "$entities": path.resolve(rootDir, 'src/lib/extension/entities'),
    "$styles": path.resolve(rootDir, 'src/styles'),
  }
}

/**
 * @param {import('rollup').OutputChunk} chunk
 * @param {import('rollup').OutputBundle} bundle
 * @param {Set<import('rollup').OutputChunk>} processedChunks
 * @return string[]
 */
function collectChunkDependencies(chunk, bundle, processedChunks = new Set()) {
  if (processedChunks.has(chunk) || !chunk.imports) {
    return [];
  }

  processedChunks.add(chunk);

  return chunk.imports.concat(
    chunk.imports
      .map(importedChunkName => {
        const module = bundle[importedChunkName];

        if (module.type === 'chunk') {
          return collectChunkDependencies(module, bundle, processedChunks);
        }

        return [];
      })
      .flat()
  );
}

/**
 * @param {(fileName: string, dependencies: string[]) => void} onDependencyResolvedCallback
 * @returns {import('vite').Plugin}
 */
function collectDependenciesForManifestBuilding(onDependencyResolvedCallback) {
  return {
    name: 'extract-dependencies-for-content-scripts',
    enforce: "post",
    /**
     * @param {any} options
     * @param {import('rollup').OutputBundle} bundle
     */
    writeBundle(options, bundle) {
      Object.keys(bundle).forEach(fileName => {
        const chunk = bundle[fileName];

        if (chunk.type !== "chunk" || !chunk.facadeModuleId) {
          return;
        }

        const dependencies = Array.from(
          new Set(
            collectChunkDependencies(chunk, bundle)
          )
        );

        onDependencyResolvedCallback(fileName, dependencies);
      });
    }
  }
}

/**
 * Second revision of the building logic for the content scripts. This method tries to address duplication of
 * dependencies generated with the previous method, where every single content script was built separately.
 * @param {BatchBuildOptions} buildOptions
 * @returns {Promise<Map<string, string[]>>}
 */
export async function buildScriptsAndStyles(buildOptions) {
  /** @type {Map<string, string[]>} */
  const pathsReplacement = new Map();
  /** @type {Map<string, string[]>} */
  const pathsReplacementByOutputPath = new Map();

  const amdScriptsInput = {};
  const libsAndStylesInput = {};

  for (const inputPath of buildOptions.inputs) {
    let outputExtension = path.extname(inputPath);

    if (outputExtension === '.scss') {
      outputExtension = '.css';
    }

    if (outputExtension === '.ts') {
      outputExtension = '.js';
    }

    const outputPath = createOutputBaseName(inputPath);
    const replacementsArray = [`${outputPath}${outputExtension}`];

    pathsReplacement.set(inputPath, replacementsArray);

    if (outputExtension === '.css' || inputPath.includes('/deps/')) {
      libsAndStylesInput[outputPath] = inputPath;
      continue;
    }

    pathsReplacementByOutputPath.set(outputPath + '.js', replacementsArray);

    amdScriptsInput[outputPath] = inputPath;
  }

  const aliasesSettings = makeAliases(buildOptions.rootDir);

  // Building all scripts together with AMD loader in mind
  await build({
    configFile: false,
    publicDir: false,
    build: {
      rollupOptions: {
        input: amdScriptsInput,
        output: {
          dir: buildOptions.outputDir,
          entryFileNames: '[name].js',
          chunkFileNames: 'chunks/[name]-[hash].js',
          // ManifestV3 doesn't allow to use modern ES modules syntax, so we build all content scripts as AMD modules.
          format: "amd",
          inlineDynamicImports: false,
          amd: {
            // amd-lite requires names even for the entry-point scripts, so we should make sure to add those.
            autoId: true,
          }
        }
      },
      emptyOutDir: false,
    },
    resolve: {
      alias: aliasesSettings,
    },
    plugins: [
      wrapScriptIntoIIFE(),
      collectDependenciesForManifestBuilding((fileName, dependencies) => {
        pathsReplacementByOutputPath
          .get(fileName)
          ?.push(...dependencies);
      }),
    ]
  });

  // Build styles separately because AMD converts styles to JS files.
  await build({
    configFile: false,
    publicDir: false,
    build: {
      rollupOptions: {
        input: libsAndStylesInput,
        output: {
          dir: buildOptions.outputDir,
          entryFileNames: '[name].js',
          assetFileNames: '[name].[ext]',
        }
      },
      emptyOutDir: false
    },
    resolve: {
      alias: aliasesSettings,
    },
    plugins: [
      wrapScriptIntoIIFE(),
    ]
  });

  return pathsReplacement;
}

/**
 * @typedef {Object} AssetBuildOptions
 * @property {string} input Full path to the input file to build.
 * @property {string} outputDir Destination folder for the script.
 * @property {string} rootDir Root directory of the repository.
 */

/**
 * @typedef {Object} BatchBuildOptions
 * @property {Set<string>} inputs Set of all scripts and styles to build.
 * @property {string} outputDir Destination folder for the assets.
 * @property {string} rootDir Root directory of the repository.
 * @property {(fileName: string, dependencies: string[]) => void} onDependenciesResolved Callback for dependencies.
 */
