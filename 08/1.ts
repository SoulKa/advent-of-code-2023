declare type Direction = "L" | "R";
declare type NodeId = string;
declare type Choice = [NodeId, NodeId];

export default async function run(input: string) {
  const { directions, nodes } = parseInput(input.trim());
  return getSteps(nodes, directions, "AAA");
}

function getSteps(nodes: Map<NodeId, Choice>, directions: Direction[], start: NodeId) {
  let steps = 0;
  let currentNodeId = start;
  while (currentNodeId !== "ZZZ") {
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
