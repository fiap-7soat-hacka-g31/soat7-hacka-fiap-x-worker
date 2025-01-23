// eslint-disable-next-line @typescript-eslint/no-var-requires
const { jest: jestConfig } = require('../../package.json');

module.exports = {
  ...jestConfig,
  rootDir: '../..',
  testRegex: '.spec.ts$',
  coverageDirectory: './coverage/unit',
  collectCoverageFrom: [
    ...jestConfig.collectCoverageFrom,
    '!**/main.(t|j)s',
    '!**/*.module.(t|j)s',
  ],
};
