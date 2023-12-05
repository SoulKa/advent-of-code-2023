class Mapping {
  constructor(public src: number, public dest: number, public length: number) {}

  get offset() {
    return this.dest - this.src;
  }
  get lastSrc() {
    return this.src + this.length - 1;
  }

  get lastDest() {
    return this.dest + this.length - 1;
  }

  get srcRange() {
    return new Range(this.src, this.lastSrc);
  }

  get destRange() {
    return new Range(this.dest, this.lastDest);
  }

  static fromOffset(src: number, offset: number, length: number) {
    return new Mapping(src, src + offset, length);
  }
}

export class Range {
  constructor(public start: number, public end: number) {}

  get length() {
    return this.end - this.start;
  }
}

export class SparseMap {
  private _mappings = [] as Mapping[];

  get mappings() {
    return this._mappings;
  }

  addMapping(src: number, dest: number, length: number) {
    this._mappings.push(new Mapping(src, dest, length));
  }

  get(src: number) {
    let dest = src;
    for (const mapping of this._mappings) {
      if (src >= mapping.src && src < mapping.src + mapping.length) {
        dest += mapping.offset;
        break;
      }
    }
    return dest;
  }

  clone() {
    const map = new SparseMap();
    map._mappings = this._mappings.slice();
    return map;
  }

  buildCombinedMap(destMap: SparseMap) {
    const map = new SparseMap();
    let worklist = this._mappings.slice();
    for (const destMapping of destMap._mappings) {
      for (let i = 0; i < worklist.length; i++) {
        const srcMapping = worklist[i];
        const { overlap, outliersA } = detectIntersections(srcMapping.destRange, destMapping.srcRange);

        // overlap gets new linked mapping
        if (overlap != null) {
          map.addMapping(overlap.start - srcMapping.offset, overlap.start + destMapping.offset, overlap.length);
        }

        // outliers keep the same offset (dest outliers can be ignored, since they have no seed)
        const outlierMappings = outliersA.map((range) =>
          Mapping.fromOffset(
            range.start - srcMapping.offset, // convert dest to src by removing offset
            srcMapping.offset, // offset stays the same since it does not overlap
            range.length // length is calculated by the range
          )
        );
        worklist = [...worklist.slice(0, i), ...outlierMappings, ...worklist.slice(i + 1)];
        i += outliersA.length - 1;
      }
    }
    map._mappings.push(...worklist);
    return map;
  }
}

export function detectIntersections(a: Range, b: Range) {
  const ranges: {
    overlap?: Range;
    outliersA: Range[];
    outliersB: Range[];
  } = {
    outliersA: [],
    outliersB: [],
  };

  // no overlap
  if (a.end < b.start || a.start > b.end) {
    ranges.outliersA.push(a);
    ranges.outliersB.push(b);
    return ranges;
  }

  // overlapping
  ranges.overlap = new Range(Math.max(a.start, b.start), Math.min(a.end, b.end));

  // left outliers
  if (a.start < b.start) {
    ranges.outliersA.push(new Range(a.start, b.start - 1));
  } else if (b.start < a.start) {
    ranges.outliersB.push(new Range(b.start, a.start - 1));
  }

  // right outliers
  if (b.end < a.end) {
    ranges.outliersA.push(new Range(b.end + 1, a.end));
  } else if (a.end < b.end) {
    ranges.outliersB.push(new Range(a.end + 1, b.end));
  }

  return ranges;
}
