import { SassString, Value } from "sass";

/**
 * @return {import('vite').Plugin}
 */
export function ScssViteReadEnvVariableFunctionPlugin() {
  return {
    name: 'koloml:scss-read-env-variable-function',
    apply: 'build',
    enforce: 'post',

    configResolved: config => {
      config.css.preprocessorOptions ??= {};
      config.css.preprocessorOptions.scss ??= {};
      config.css.preprocessorOptions.scss.functions ??= {};

      /**
       * @param {Value[]} args
       * @return {SassString}
       */
      config.css.preprocessorOptions.scss.functions['vite-read-env-variable($constant-name)'] = (args) => {
        const constName = args[0].assertString('constant-name').text;

        if (config.define && config.define.hasOwnProperty(constName)) {
          let returnedValue = config.define[constName];

          try {
            returnedValue = JSON.parse(returnedValue);
          } catch {
            returnedValue = null;
          }

          if (typeof returnedValue !== 'string') {
            console.warn(`Attempting to read the constant with non-string type: ${constName}`);
            return new SassString('');
          }

          return new SassString(returnedValue);
        }

        console.warn(`Constant does not exist: ${constName}`);
        return new SassString('');
      }
    }
  }
}
