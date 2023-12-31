declare type Sequence = number[];

export default async function run(input: string) {
  const sequences = input
    .trim()
    .split("\n")
    .map((line) => line.split(" ").map((s) => Number.parseInt(s)));
  return sequences
    .map((sequence) => {
      const history = History.fromSequence(sequence);
      return history.firstValueOfFirstSequence;
    })
    .reduce((sum, n) => sum + n, 0);
}

class History {
  private _history: Sequence[];

  private get lastSequence() {
    return this._history[this._history.length - 1];
  }

  public get lastValueOfFirstSequence() {
    return this._history[0][this._history[0].length - 1];
  }

  public get firstValueOfFirstSequence() {
    return this._history[0][0];
  }

  constructor(history: Sequence[]) {
    this._history = history;
  }

  static fromSequence(sequence: Sequence) {
    const history = new History([sequence]);
    history.intrapolate();
    history.extrapolateLeft();
    return history;
  }

  private intrapolate() {
    while (!allZero(this.lastSequence)) {
      const slices = getSlices(this.lastSequence, 2);
      this._history.push([]);
      for (const slice of slices) {
        this.lastSequence.push(slice[1] - slice[0]);
      }
    }
  }

  private extrapolateRigth() {
    for (let i = this._history.length - 1; i >= 0; i--) {
      const sequence = this._history[i];
      if (i === this._history.length - 1) {
        sequence.push(0);
      } else {
        const parentSequence = this._history[i + 1];
        sequence.push(sequence[sequence.length - 1] + parentSequence[parentSequence.length - 1]);
      }
    }
  }

  private extrapolateLeft() {
    for (let i = this._history.length - 1; i >= 0; i--) {
      const sequence = this._history[i];
      if (i === this._history.length - 1) {
        sequence.splice(0, 0, 0);
      } else {
        const parentSequence = this._history[i + 1];
        sequence.splice(0, 0, sequence[0] - parentSequence[0]);
      }
    }
  }

  log() {
    console.log(this._history);
  }
}

function getSlices(sequence: Sequence, length: number) {
  const slices = [] as Sequence[];
  for (let i = 0; i <= sequence.length - length; i++) {
    slices.push(sequence.slice(i, i + length));
  }
  return slices;
}

function allZero(sequence: Sequence) {
  if (sequence.length === 0) return true;
  return !sequence.some((n) => n !== 0);
}
