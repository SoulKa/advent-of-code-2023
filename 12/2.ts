declare type UnknownCondition = "?";
declare type KnownCondition = "#" | ".";
declare type Condition = UnknownCondition | KnownCondition;
declare type GetNumArrangements = (
  arrangementIndex?: number,
  currentGroup?: number,
  groupIndex?: number,
  conditionOverride?: Condition
) => number;

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
    const getNumArrangements = withCache(function (
      arrangementIndex = 0,
      currentGroup = 0,
      groupIndex = 0,
      conditionOverride?: Condition
    ): number {
      if (arrangementIndex === arrangement.length) {
        return currentGroup === 0 && groupIndex === groups.length ? 1 : 0;
      }
      if (groupIndex === groups.length && currentGroup !== 0) {
        //console.log("too many groups", arrangement, currentGroup, groupIndex);
        return 0;
      }
      if (currentGroup > groups[groupIndex]) {
        //console.log("too many in group", arrangement, currentGroup, groupIndex);
        return 0;
      }

      const condition = conditionOverride || arrangement[arrangementIndex];
      const targetGroup = groups[groupIndex];
      switch (condition) {
        case "?":
          return (
            getNumArrangements(arrangementIndex, currentGroup, groupIndex, ".") +
            getNumArrangements(arrangementIndex, currentGroup, groupIndex, "#")
          );
        case "#":
          return getNumArrangements(arrangementIndex + 1, currentGroup + 1, groupIndex);
        case ".":
          if (currentGroup === 0) {
            return getNumArrangements(arrangementIndex + 1, 0, groupIndex);
          } else if (currentGroup === targetGroup) {
            return getNumArrangements(arrangementIndex + 1, 0, groupIndex + 1);
          } else {
            return 0;
          }
      }
    });

    sum += getNumArrangements();
  }
  return sum;
}

function withCache<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();
  return function (...args: Parameters<T>): ReturnType<T> {
    // Check if the result is already cached
    const cacheKey = generateCacheKey(...args);
    const cached = cache.get(cacheKey);
    if (cached !== undefined) return cached;

    // Not cached, call the original function
    const result = fn(...args);
    cache.set(cacheKey, result);
    return result;
  } as T;
}

function generateCacheKey<T extends (...args: any[]) => any>(...args: Parameters<T>) {
  const cacheKey = [] as any[];
  for (const arg of args) {
    if (Array.isArray(arg)) {
      cacheKey.push(...arg);
    } else if (typeof arg === "object") {
      cacheKey.push(JSON.stringify(arg));
    } else {
      cacheKey.push(arg);
    }
  }
  return cacheKey.join(",");
}
