declare type Direction = "L" | "R";
declare type NodeId = string;
declare type Choice = [NodeId, NodeId];
declare type NodeMap = Map<NodeId, Choice>;

export default async function run(input: string) {
  const { directions, nodes } = parseInput(input);
  const startingNodes = getStartingNodes(nodes);
  const steps = startingNodes.map((start) => getSteps(nodes, directions, start));
  return lcm(...steps);
}

function getStartingNodes(nodes: NodeMap) {
  return Array.from(nodes.keys()).filter((id) => id.endsWith("A"));
}

function getSteps(nodes: NodeMap, directions: Direction[], start: NodeId) {
  let steps = 0;
  let currentNodeId = start;
  while (!currentNodeId.endsWith("Z")) {
    const nextDirection = directions[steps % directions.length];
    currentNodeId = nodes.get(currentNodeId)![directionToIndex(nextDirection)];
    steps++;
  }
  return steps;
}

function directionToIndex(direction: Direction) {
  return direction === "L" ? 0 : 1;
}

function parseInput(input: string) {
  const lines = input.split("\n");
  return {
    directions: lines[0].trim().split("") as Direction[],
    nodes: new Map(lines.slice(2).map(parseNode)),
  };
}

function parseNode(line: string) {
  const [id, targetString] = line.trim().split(" = ");
  return [id, targetString.slice(1, targetString.length - 1).split(", ")] as [NodeId, Choice];
}

function lcm(...numbers: number[]) {
  if (numbers.length === 0) return NaN;
  if (numbers.length === 1) return numbers[0];
  if (numbers.length === 2) {
    const [a, b] = numbers.sort();
    return (b / gcd(a, b)) * a;
  } else {
    return lcm(lcm(numbers[0], numbers[1]), ...numbers.slice(2));
  }
}

function gcd(a: number, b: number) {
  if (b === 0) {
    return a;
  } else {
    return gcd(b, a % b);
  }
}
