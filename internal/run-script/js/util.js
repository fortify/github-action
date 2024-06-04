const { spawn } = require("child_process");

exports.run = function(script) {
  if ( script ) {
      const scriptDir = process.env.INPUT_DIR;
      const subprocess = spawn(`bash -c -o pipefail -v 'export UTIL_DIR=${scriptDir}; ${scriptDir}/${script}'`, 
        { stdio: "inherit", shell: true });
      subprocess.on("exit", (exitCode) => {
        process.exitCode = exitCode;
      });
  }
}
