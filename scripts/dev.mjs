import chalk from "chalk";
import { $, execa } from "execa";

const urlRegx = /http:\/\/localhost:(\d+)/;
let startedMain = false;

const cmd = $`pnpm -F renderer start`;
for await (const line of cmd) {
    console.log(chalk.green(`[RENDERER]:`), line);

    if (!line.includes(" http://localhost:")) {
        continue;
    }

    const url = line.match(urlRegx)[0];

    startMain(url).catch(console.error);
}

async function startMain(url) {
    if (startedMain) {
        return;
    }

    startedMain = true;
    const cmd = execa({
        env: {
            RENDERER_URL: url,
        },
    })`pnpm -F subtitle-editor start`;
    for await (const line of cmd) {
        console.log(chalk.cyan(`[MAIN]: `), line);
    }
}
