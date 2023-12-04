let MAP = [] as string[];

export default async function run(input: string) {
  MAP = input.trim().split("\n");
  let sum = 0;

  for (let y = 0; y < getHeight(); y++) {
    for (let x = 0; x < getWidth(); x++) {
      const c = getCharValueAt(x, y)!;
      if (isNumber(c)) {
        const partNum = getNumberAt(x, y);
        if (isAdjacentToSymbol(x, y, partNum.length)) {
          sum += Number.parseInt(partNum);
        }
        x += partNum.length - 1; // do not count same number multiple times
      }
    }
  }

  return sum;
}

function isAdjacentToSymbol(x: number, y: number, length: number) {
  for (let _y = y - 1; _y <= y + 1; _y++) {
    for (let _x = x - 1; _x <= x + length; _x++) {
      const c = getCharValueAt(_x, _y);
      if (c !== undefined && isSymbol(c)) return true;
    }
  }
  return false;
}

function getNumberAt(x: number, y: number) {
  let num = "";
  let c: number | undefined;
  while ((c = getCharValueAt(x, y)) !== undefined && isNumber(c)) {
    num += getValueAt(x, y)!;
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
