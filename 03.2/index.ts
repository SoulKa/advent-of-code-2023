let MAP = [] as string[];

export default async function run(input: string) {
  MAP = input.trim().split("\n");
  let sum = 0;

  for (let y = 0; y < getHeight(); y++) {
    for (let x = 0; x < getWidth(); x++) {
      const c = getValueAt(x, y)!;
      if (c === "*") {
        const nums = getNumbersAround(x, y).map((s) => Number.parseInt(s));
        if (nums.length == 2) {
          sum += nums[0] * nums[1];
        }
      }
    }
  }

  return sum;
}

function getNumbersAround(x: number, y: number) {
  const nums = [] as string[];
  for (let _y = y - 1; _y <= y + 1; _y++) {
    for (let _x = x - 1; _x <= x + 1; _x++) {
      const c = getCharValueAt(_x, _y);
      if (c !== undefined && isNumber(c)) {
        _x = findBeginningOfNumber(_x, _y);
        const num = getNumberAt(_x, _y);
        _x += num.length - 1;
        nums.push(num);
      }
    }
  }
  return nums;
}

function findBeginningOfNumber(x: number, y: number) {
  let c: number | undefined;
  while ((c = getCharValueAt(x - 1, y)) !== undefined && isNumber(c)) {
    x--;
  }
  return x;
}

function getNumberAt(x: number, y: number) {
  let num = "";
  let c: number | undefined;
  while ((c = getCharValueAt(x, y)) !== undefined && isNumber(c)) {
    num += String.fromCharCode(c);
    x++;
  }
  return num;
}

function isNumber(char: number) {
  return char >= 48 && char <= 57;
}

function isSymbol(char: number) {
  return !isNumber(char) && char !== 46;
}

function getHeight() {
  return MAP.length;
}

function getWidth() {
  return MAP[0].length;
}

function isValid(x: number, y: number) {
  return x >= 0 && x < getWidth() && y >= 0 && y < getHeight();
}

function getCharValueAt(x: number, y: number) {
  return getValueAt(x, y)?.charCodeAt(0);
}

function getValueAt(x: number, y: number) {
  if (!isValid(x, y)) return;
  return MAP[y][x];
}
