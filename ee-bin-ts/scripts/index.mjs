import {transform} from "cjstoesm";

await transform({
  input: [
    "lib/**/*.*",
    "tools/**/*.*",
    "index.js"
  ],
  outDir: "esm"
});