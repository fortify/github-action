const { spawn } = require("child_process");
const { appendFileSync } = require("fs");
const { EOL } = require("os");

function run(script) {
  if ( script ) {
      const cwd = process.env.INPUT_CWD || process.cwd;
      const subprocess = spawn(`bash -c -o pipefail -v ${script}`, { stdio: "inherit", shell: true,  cwd: cwd });
      subprocess.on("exit", (exitCode) => {
        process.exitCode = exitCode;
      });
  }
}

const key = process.env.INPUT_KEY.toUpperCase();

if ( process.env[`STATE_${key}`] !== undefined ) { // Are we in the 'post' step?
  run(process.env.INPUT_POST);
} else { // Otherwise, this is the main step
  appendFileSync(process.env.GITHUB_STATE, `${key}=true${EOL}`);
  run(process.env.INPUT_SCRIPT);
}
