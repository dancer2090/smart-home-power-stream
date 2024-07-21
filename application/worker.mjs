import { exec } from 'node:child_process';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

(async () => {
  let scan = true;
  setInterval(() => {
    if (!scan) return
    scan = false
    exec(`python3 ${__dirname}/../invertor-worker/app/server/worker_v3.py`, (err, stdout, stderr) => {
      scan = true
      if (err) {
        console.log(err)
        // node couldn't execute the command
        return;
      }
      // the *entire* stdout and stderr (buffered)
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    })
    
  }, 5000)
})()


