const DIGIT_NAMES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];

export default async function run(input: string) {
  let sum = 0;
  for (const line of input.split("\n")) {
    let matches = [] as { index: number; match: string }[];

    // find digits
    for (const match of line.matchAll(/[0-9]/g)) {
      if (match.index === undefined) continue;
      matches.push({ index: match.index, match: match[0] });
    }

    // find words
    DIGIT_NAMES.forEach((name, num) => {
      let pos = line.indexOf(name);
      if (pos !== -1) {
        matches.push({ index: pos, match: num.toString() });
      }
      pos = line.lastIndexOf(name);
      if (pos !== -1) {
        matches.push({ index: pos, match: num.toString() });
      }
    });

    // sort
    matches = matches.sort((a, b) => a.index - b.index);

    // resolve
    if (matches.length >= 1) {
      const num = Number.parseInt(matches[0].match + matches[matches.length - 1].match);
      sum += num;
    }
  }
  return sum;
}
