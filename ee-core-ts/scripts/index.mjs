import {transform} from "cjstoesm";

await transform({
  input: [
    "addon/**/*.*",
    "config/**/*.*",
    "const/**/*.*",
    "controller/**/*.*",
    "core/**/*.*",
    "cross/**/*.*",
    "ee/**/*.*",
    "electron/**/*.*",
    "exception/**/*.*",
    "httpclient/**/*.*",
    "jobs/**/*.*",
    "loader/**/*.*",
    "log/**/*.*",
    "main/**/*.*",
    "message/**/*.*",
    "ps/**/*.*",
    "services/**/*.*",
    "socket/**/*.*",
    "storage/**/*.*",
    "utils/**/*.*",
    "index.js"
  ],
  outDir: "esm"
});