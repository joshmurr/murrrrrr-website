const { build } = require("esbuild");

build({
  entryPoints: ["src/ts/index.ts"],
  bundle: true,
  minify: true,
  platform: "browser",
  format: "esm",
  outfile: "public/js/background/bundle.js",
});
