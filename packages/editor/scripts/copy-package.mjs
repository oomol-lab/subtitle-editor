import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

async function copyPackage() {
    const __filename = fileURLToPath(import.meta.url);
    const editorPath = join(__filename, "..", "..");
    const packageContent = await readFile(join(editorPath, "package.json"), "utf-8");
    const packageJSON = JSON.parse(packageContent);
    delete packageJSON.module;
    packageJSON.main = "./lib/index.js";
    packageJSON.module = "./esm/index.js";
    packageJSON.scripts = {
        publish: "pnpm publish",
    };
    const targetPackageContent = JSON.stringify(packageJSON, null, 2);
    const targetPackagePath = join(editorPath, "dist", "package.json");
    await writeFile(targetPackagePath, targetPackageContent, "utf-8");
}

copyPackage().catch((err) => {
    console.error(err);
    // eslint-disable-next-line node/prefer-global/process
    process.exit(1);
});
