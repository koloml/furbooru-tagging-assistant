/**
 * @param {SwapDefinedVariablesSettings} settings
 * @return {import('vite').Plugin}
 */
export function SwapDefinedVariablesPlugin(settings) {
  return {
    name: 'koloml:swap-defined-variables',
    enforce: 'post',
    configResolved: (config) => {
      if (
        config.define
        && process.env.hasOwnProperty(settings.envVariable)
        && process.env[settings.envVariable] === settings.expectedValue
      ) {
        for (const [key, value] of Object.entries(settings.define)) {
          config.define[key] = value;
        }
      }
    }
  }
}

/**
 * @typedef {Object} SwapDefinedVariablesSettings
 * @property {string} envVariable
 * @property {string} expectedValue
 * @property {Record<string, string>} define
 */
