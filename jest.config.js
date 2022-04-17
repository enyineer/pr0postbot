// eslint-disable-next-line no-undef
module.exports = {
    // [...]
    extensionsToTreatAsEsm: ['.ts'],
    globals: {
        'ts-jest': {
            useESM: true,
        },
    },
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    preset: "ts-jest",
    testEnvironment: "node",
    transform: {
      "node_modules/variables/.+\\.(j|t)sx?$": "ts-jest"
    },
    transformIgnorePatterns: [
      "node_modules/(?!variables/.*)"
    ]
}