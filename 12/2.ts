declare type UnknownCondition = "?";
declare type KnownCondition = "#" | ".";
declare type Condition = UnknownCondition | KnownCondition;
declare type GetNumArrangements = (
  arrangementIndex?: number,
  currentGroup?: number,
  groupIndex?: number,
  conditionOverride?: Condition
) => number;

const CACHE = new Map<string, number>();

export default async function run(input: string) {
  const tasks = input
    .split("\n")
    .map((line) => line.split(" "))
    .map(([conditionsString, groupsString]) => ({
      arrangement: (new Array(5).fill(conditionsString).join("?") + ".").split("") as Condition[],
      groups: new Array(5)
        .fill(groupsString)
        .join(",")
        .split(",")
        .map((s) => Number.parseInt(s)),
    }));

  let sum = 0;
  for (const { arrangement, groups } of tasks) {
    function getNumArrangements(
      arrangementIndex = 0,
      currentGroup = 0,
      groupIndex = 0,
      conditionOverride?: Condition
    ): number {
      const cacheKey = [arrangementIndex, currentGroup, groupIndex, conditionOverride].join(",");
      const cached = CACHE.get(cacheKey);
      if (cached !== undefined) return cached;

      if (arrangementIndex === arrangement.length) {
        return setCache(cacheKey, currentGroup === 0 && groupIndex === groups.length ? 1 : 0);
      }
      if (groupIndex === groups.length && currentGroup !== 0) {
        //console.log("too many groups", arrangement, currentGroup, groupIndex);
        return setCache(cacheKey, 0);
      }
      if (currentGroup > groups[groupIndex]) {
        //console.log("too many in group", arrangement, currentGroup, groupIndex);
        return setCache(cacheKey, 0);
      }

      const condition = conditionOverride || arrangement[arrangementIndex];
      const targetGroup = groups[groupIndex];
      switch (condition) {
        case "?":
          return setCache(
            cacheKey,
            getNumArrangements(arrangementIndex, currentGroup, groupIndex, ".") +
              getNumArrangements(arrangementIndex, currentGroup, groupIndex, "#")
          );
        case "#":
          return setCache(cacheKey, getNumArrangements(arrangementIndex + 1, currentGroup + 1, groupIndex));
        case ".":
          if (currentGroup === 0) {
            return setCache(cacheKey, getNumArrangements(arrangementIndex + 1, 0, groupIndex));
          } else if (currentGroup === targetGroup) {
            return setCache(cacheKey, getNumArrangements(arrangementIndex + 1, 0, groupIndex + 1));
          } else {
            return setCache(cacheKey, 0);
          }
      }
    }
    CACHE.clear();

    const numArrangements = getNumArrangements();
    console.log(numArrangements);
    sum += numArrangements;
  }
  return sum;
}

function setCache(key: string, value: number) {
  CACHE.set(key, value);
  return value;
}
