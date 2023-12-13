import fs from "fs";
import path from "path";

const sessionToken = fs.readFileSync(path.join(__dirname, "session.txt"), "utf8").trim();
let now = new Date();
if (now.getFullYear() > 2023 || now.getDate() > 24) now = new Date(2023, 11, 24);

async function main() {
  for (let day = 1; day <= now.getDate(); day++) {
    const dirname = padZero(day);
    const dir = path.join(__dirname, dirname);
    const inputFilePath = path.join(dir, "input.txt");

    // created directory and first script
    if (!fs.existsSync(dir)) {
      console.log(`Setting up day ${dirname}...`);
      fs.mkdirSync(dir);
      fs.writeFileSync(path.join(dir, "1.ts"), `export default async function run(input: string) {}\n`);
    }

    // download input
    if (!fs.existsSync(inputFilePath)) await fetchInput(dirname, inputFilePath);
  }
}
main().catch(console.error);

function padZero(n: number) {
  if (n < 10) return "0" + n;
  return n.toString();
}

async function fetchInput(day: string, filePath: string) {
  console.log(`Fetching input for day ${day}...`);
  const url = `https://adventofcode.com/2023/day/${Number.parseInt(day)}/input`;
  const response = await fetch(url, { headers: { cookie: `session=${sessionToken}` } });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch input for day ${day} with ${response.status} ${response.statusText}: ${await response.text()}`
    );
  }

  // pipe to file
  if (response.body == null) throw new Error("Response body is null");
  const writeStream = fs.createWriteStream(filePath);
  const reader = response.body.getReader();

  let readResult;
  while (!(readResult = await reader.read()).done) writeStream.write(readResult.value);
  writeStream.close();
}
