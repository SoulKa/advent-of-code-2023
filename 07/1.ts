declare type Card = "A" | "K" | "Q" | "J" | "T" | "9" | "8" | "7" | "6" | "5" | "4" | "3" | "2";

declare type Range = Card[];
declare type Cut = [range: Range, remainder: Card[]];

declare type Play = {
  primary: Range[];
  secondary: Range;
  kind: Kind;
};
enum Kind {
  HIGH_CARD = 0,
  PAIR = 1,
  TWO_PAIR = 2,
  THREE_OF_A_KIND = 3,
  FULL_HOUSE = 4,
  FOUR_OF_A_KIND = 5,
  FIVE_OF_A_KIND = 6,
}

const PAIR_SIZE_MAP = {
  [Kind.HIGH_CARD]: 1,
  [Kind.PAIR]: 2,
  [Kind.THREE_OF_A_KIND]: 3,
  [Kind.FOUR_OF_A_KIND]: 4,
  [Kind.FIVE_OF_A_KIND]: 5,
};
const CARD_ORDER = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"] as Card[];
const CARD_TO_INDEX_MAP = new Map(CARD_ORDER.map((c, i) => [c, i]));
const KIND_ORDER = [
  Kind.FIVE_OF_A_KIND,
  Kind.FOUR_OF_A_KIND,
  Kind.FULL_HOUSE,
  Kind.THREE_OF_A_KIND,
  Kind.TWO_PAIR,
  Kind.PAIR,
  Kind.HIGH_CARD,
];

export default async function run(input: string) {
  const plays = input.split("\n").map((line) => {
    const [cardsString, bidString] = line.split(" ");
    const bid = Number.parseInt(bidString);
    const cards = cardsString.split("") as Card[];
    const hand = new Hand(cards.slice());
    return Object.assign(getHighestPlay(hand), { bid, cards });
  });

  // sort by highest kinds of plays (ascending)
  plays.sort((a, b) => {
    // compare kind
    if (a.kind !== b.kind) return a.kind - b.kind;
    let comp: number;

    // compare cards
    for (let i = 0; i < a.cards.length; i++) {
      comp = compareCards(b.cards[i], a.cards[i]);
      if (comp !== 0) return comp;
    }
    return 0;
  });
  return plays.map(({ bid }, i) => bid * (i + 1)).reduce((sum, v) => sum + v, 0);
}

function getHighestPlay(hand: Hand) {
  for (const kind of KIND_ORDER) {
    const play = getPlay(hand, kind);
    if (play != null)
      return {
        play,
        kind,
      };
  }
  throw new Error(`Bug in code: no kind has matched, not even "high card"`);
}

function getPlay(hand: Hand, kind: Kind): Play | undefined {
  switch (kind) {
    case Kind.HIGH_CARD:
    case Kind.PAIR:
    case Kind.THREE_OF_A_KIND:
    case Kind.FOUR_OF_A_KIND:
    case Kind.FIVE_OF_A_KIND:
      for (const [range, secondary] of hand.getCuts(PAIR_SIZE_MAP[kind])) {
        if (allCardsEqual(range)) return { primary: [range], secondary, kind };
      }
      break;
    case Kind.TWO_PAIR:
      // find all pairs
      let pairs = [] as Range[];
      let play: Play | undefined;
      do {
        play = getPlay(hand, Kind.PAIR);
        if (play == null) break;
        pairs.push(play.primary[0]);
        hand = new Hand(play.secondary);
      } while (true);

      // if two pairs ==> return
      if (pairs.length === 2) {
        return {
          primary: pairs,
          secondary: hand.cards,
          kind,
        };
      }
      break;
    case Kind.FULL_HOUSE:
      const highCut = hand.getCut(0, 3);
      const lowCut = hand.getCut(0, 2);
      if (allCardsEqual(highCut[0]) && allCardsEqual(highCut[1])) {
        return cutToPlay(highCut, kind);
      } else if (allCardsEqual(lowCut[0]) && allCardsEqual(lowCut[1])) {
        return cutToPlay([lowCut[1], lowCut[0]], kind);
      }
      break;
    default:
      throw new TypeError(`Invalid kind: ${kind}`);
  }
}

/**
 * Strongest cards will come first!
 */
function compareCards(a: Card, b: Card) {
  return CARD_TO_INDEX_MAP.get(a)! - CARD_TO_INDEX_MAP.get(b)!;
}

function allCardsEqual(range: Range) {
  const targetCard = range[0];
  return !range.some((card) => card !== targetCard);
}

function cutToPlay(range: Cut, kind: Kind): Play {
  return {
    primary: [range[0]],
    secondary: range[1],
    kind,
  };
}

class Hand {
  constructor(public cards: Card[]) {
    cards.sort(compareCards);
  }

  get size() {
    return this.cards.length;
  }

  get highest() {
    return this.cards[0];
  }

  get lowest() {
    return this.cards[this.size - 1];
  }

  getCut(index: number, length: number): Cut {
    return [
      this.cards.slice(index, index + length),
      [...this.cards.slice(0, index), ...this.cards.slice(index + length)],
    ];
  }

  getCuts(length: number) {
    const ranges = [] as Cut[];
    for (let i = 0; i <= this.size - length; i++) {
      ranges.push(this.getCut(i, length));
    }
    return ranges;
  }
}
