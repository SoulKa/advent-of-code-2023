import fs from "fs";
import path from "path";

type RunFunc = (input: string) => Promise<string>;

async function main() {
  for (const dir of fs.readdirSync(__dirname, { withFileTypes: true })) {
    const { name } = dir;
    if (dir.isDirectory() && /^[0-9]{2}(\.[0-9]+)?$/.test(name)) {
      const dirname = path.join(__dirname, name);
      const input = fs.readFileSync(path.join(dirname, "input.txt"), "utf8");
      const runFunc = (await import(dirname)).default as RunFunc;
      const output = await runFunc(input);

      // write output
      console.log(`Day ${dir.name}: ${dir.name.length === 2 ? "  " : ""}${output}`);
      fs.writeFileSync(path.join(dirname, "output.txt"), output);
    }
  }
}
main().catch(console.error);
