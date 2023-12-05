import fs from "fs";
import path from "path";

let now = new Date();
if (now.getFullYear() > 2023 || now.getDate() > 24) now = new Date(2023, 11, 24);

for (let day = 1; day <= now.getDate(); day++) {
  const dirname = padZero(day);
  const dir = path.join(__dirname, dirname);
  if (fs.existsSync(dir)) continue;
  console.log(`Setting up day ${dirname}...`);
  fs.mkdirSync(dir);
  fs.writeFileSync(path.join(dir, "1.ts"), `export default async function run(input: string) {}\n`);
  fs.writeFileSync(path.join(dir, "input.txt"), "");
}

function padZero(n: number) {
  if (n < 10) return "0" + n;
  return n.toString();
}
