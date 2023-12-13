import fs from "fs";
import path from "path";

type OptionArg = "in";
type RunFunc = (input: string) => Promise<string | number | undefined>;
let dayArg: number | undefined;
let inputFileName = "input.txt";

// parse arguments
for (let arg of process.argv.slice(2)) {
  if (!arg.startsWith("--")) {
    dayArg = Number.parseInt(arg);
    continue;
  }

  const [key, value] = arg.slice(2).split("=");
  console.log(key, value);
  switch (key as OptionArg) {
    case "in":
      inputFileName = value || "test-input.txt";
      break;
    default:
      throw new Error(`Unknown argument: --${arg}`);
  }
}

async function main() {
  console.log("Advent of Code 2023\n");

  // iterate over all riddles
  for (const dir of fs.readdirSync(__dirname, { withFileTypes: true })) {
    const { name } = dir;
    if (
      dir.isDirectory() &&
      /^[0-9]{2}(\.[0-9]+)?$/.test(name) &&
      (dayArg == null || Number.parseInt(name) === dayArg)
    ) {
      const dirPath = path.join(__dirname, name);
      const inputPath = path.join(dirPath, inputFileName);
      if (!fs.existsSync(inputPath)) {
        console.log(`Skipping day ${name} because input is missing`);
        continue;
      }
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
