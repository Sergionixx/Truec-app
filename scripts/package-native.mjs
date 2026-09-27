import { mkdir, cp, readFile, writeFile } from "node:fs/promises";
import { localPhotos } from "./native-photos.ts";
const dest = "android-app/app/src/main/assets";
await mkdir(dest, { recursive: true });
await cp("dist-native", dest + "/web", { recursive: true });
const html = await readFile(dest + "/web/index.html", "utf8");
await writeFile(dest + "/web/index.html", html
  .replace(/, maximum-scale=1\.0, user-scalable=no/, "")
  .replace(/\s*<!-- Google Fonts Inter -->[\s\S]*?(?=\s*<script type="module")/, "\n"));
await writeFile(dest + "/native-seed.json", localPhotos(await readFile("server/data.json", "utf8")));
console.log("Victor HTML bundle and Room seed packaged into Android assets.");
