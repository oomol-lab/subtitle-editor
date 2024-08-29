import { fileURLToPath } from "url";
import { join } from "path";
import { readFile, writeFile } from "fs/promises";

async function copyPackage() {
  const __filename = fileURLToPath(import.meta.url);
  const editorPath = join(__filename, "..", "..");
  const packageContent = await readFile(join(editorPath, "package.json"), "utf-8");
  const packageJSON = JSON.parse(packageContent);
  delete packageJSON.module;
  packageJSON.main = "./lib/index.js";
  packageJSON.module = "./esm/index.js";
  packageJSON.scripts = {
    "publish": "pnpm publish",
  };
  const targetPackageContent = JSON.stringify(packageJSON, null, 2);
  const targetPackagePath = join(editorPath, "dist", "package.json");
  await writeFile(targetPackagePath, targetPackageContent, "utf-8");
}

copyPackage().catch(err => {
  console.error(err);
  process.exit(1);
});