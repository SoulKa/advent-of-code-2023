declare type UnknownCondition = "?";
declare type KnownCondition = "#" | ".";
declare type Condition = UnknownCondition | KnownCondition;
declare type Arrangement<C = Condition> = C[];

export default async function run(input: string) {
  const possibilities = input
    .split("\n")
    .map((line) => line.split(" "))
    .map(([conditionsString, groupsString]) =>
      getArrangements(
        conditionsString.split("") as Condition[],
        groupsString.split(",").map((s) => Number.parseInt(s))
      )
    );
  const numPossibilities = possibilities.map((a) => a.length);
  return numPossibilities.reduce((sum, n) => sum + n, 0);
}

function getArrangements(initialArrangement: Arrangement<Condition>, groups: number[]) {
  const unknownIndices = [] as number[];
  initialArrangement.forEach((c, i) => c === "?" && unknownIndices.push(i));

  if (unknownIndices.length === 0) return [initialArrangement as Arrangement<KnownCondition>];
  const arrangements = [] as Arrangement<KnownCondition>[];
  for (let i = 0; i < Math.pow(2, unknownIndices.length); i++) {
    const replacements = intToArrangement(i, unknownIndices.length);
    const arrangement = initialArrangement.slice();
    for (let ui = 0; ui < unknownIndices.length; ui++) {
      arrangement[unknownIndices[ui]] = replacements[ui];
    }
    arrangements.push(arrangement as Arrangement<KnownCondition>);
  }
  return arrangements.filter((a) => isValidArrangement(a, groups));
}

function intToArrangement(n: number, length: number) {
  let binary = n.toString(2);
  binary = "0".repeat(length - binary.length) + binary;
  const arrangement = [] as Arrangement<KnownCondition>;
  if (binary.length !== length) throw new Error("Bug");

  for (let i = 0; i < length; i++) {
    arrangement.push((binary.charAt(i) as "0" | "1") === "0" ? "." : "#");
  }
  return arrangement;
}

function isValidArrangement(arrangement: Arrangement<KnownCondition>, groups: number[]) {
  const actualGroups = [] as number[];
  let groupSize = 0;
  arrangement.forEach((v, i) => {
    if (v === "#") groupSize++;
    if ((v === "." || i === arrangement.length - 1) && groupSize !== 0) {
      actualGroups.push(groupSize);
      groupSize = 0;
    }
  });
  return actualGroups.length === groups.length && actualGroups.every((v, i) => groups[i] === v);
}
