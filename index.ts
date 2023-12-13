import fs from "fs";
import path from "path";

type RunFunc = (input: string) => Promise<string | number | undefined>;
const dayArg = process.argv[2];

async function main() {
  // iterate over all riddles
  for (const dir of fs.readdirSync(__dirname, { withFileTypes: true })) {
    const { name } = dir;
    if (dir.isDirectory() && /^[0-9]{2}(\.[0-9]+)?$/.test(name) && (dayArg == null || name === dayArg)) {
      const dirPath = path.join(__dirname, name);
      const inputPath = path.join(dirPath, "input.txt");
      if (!fs.existsSync(inputPath)) continue;
      console.log(`Day ${name}:`);

      // read input
      const input = fs.readFileSync(inputPath, "utf8");

      // run each part
      for (let i = 1; i <= 2; i++) {
        const tsFilePath = path.join(dirPath, i.toString() + ".ts");
        if (!fs.existsSync(tsFilePath)) continue;
        const runFunc = (await import(tsFilePath)).default as RunFunc;
        const output = await runFunc(input); // run script
        if (output != null) console.log(` - Part ${i}: ${output}`);
      }
    }
  }
}
main().catch(console.error);
