module.exports = function (wallaby) {
  // const babel = JSON.parse(require("fs").readFileSync(require("path").join(__dirname, ".babelrc")))
  // babel.presets.push("babel-preset-jest")

  return {
    files: ["package.json", "lib/**/*.js"],
    tests: ["/test/**/*.js", "!/test/helper.js", "!/test/utils.js", "!/test/gql.js", "!/test/__mocks__"],

    compilers: {
      "**/*.js": wallaby.compilers.babel(),
    },
    testFramework: "jest",
    env: {
      type: "node",
      runner: "node",
    },
    debug: true,
  }
}
