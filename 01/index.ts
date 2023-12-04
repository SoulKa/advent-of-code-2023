export default async function run(input: string) {
  let sum = 0;
  for (const line of input.split("\n")) {
    const results = [...line.matchAll(/[0-9]/g)];
    if (results.length >= 1) {
      const num = Number.parseInt(results[0][0] + results[results.length - 1][0]);
      sum += num;
    }
  }
  return sum;
}
