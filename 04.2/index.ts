export default async function run(input: string) {
  const lines = input.split("\n");
  const cardCount = {} as { [cardId: number]: number };
  for (let i = 1; i <= lines.length; i++) cardCount[i] = 1;

  for (const line of lines) {
    const cardId = Number.parseInt(line.substring(5, 8).trim());
    const [winningString, numString] = line.substring(9).split("|");
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
    for (let i = cardId + 1; i <= Math.min(cardId + wonSet.size, lines.length); i++) {
      cardCount[i] += cardCount[cardId];
    }
  }

  return Object.values(cardCount).reduce((sum, count) => sum + count, 0);
}

function intersect<T>(a: Set<T>, b: Set<T>) {
  return new Set([...a].filter((av) => b.has(av)));
}
