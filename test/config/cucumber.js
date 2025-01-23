// eslint-disable-next-line @typescript-eslint/no-var-requires
const { DEFAULT_THEME } = require('@cucumber/pretty-formatter');

module.exports = {
  default: {
    paths: ['test/acceptance/features/**/*.feature'],
    requireModule: ['ts-node/register', 'tsconfig-paths/register'],
    require: ['test/acceptance/run-acceptance-tests.ts'],
    format: ['@cucumber/pretty-formatter'],
    formatOptions: {
      colorsEnabled: true,
      theme: { ...DEFAULT_THEME },
    },
  },
};
