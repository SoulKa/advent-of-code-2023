export default async function run(input: string) {
  let sum = 0;

  for (const line of input.trim().split("\n")) {
    const [winningString, numString] = line.split(":")[1].split("|");
    const winningSet = new Set(
      winningString
        .split(" ")
        .filter((s) => s !== "")
        .map((s) => Number.parseInt(s))
    );
    const numSet = new Set(
      numString
        .split(" ")
        .filter((s) => s !== "")
        .map((s) => Number.parseInt(s))
    );

    const wonSet = intersect(winningSet, numSet);
    if (wonSet.size !== 0) sum += 1 << (wonSet.size - 1);
  }

  return sum;
}

function intersect<T>(a: Set<T>, b: Set<T>) {
  return new Set([...a].filter((av) => b.has(av)));
}
