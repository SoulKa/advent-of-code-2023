export default class SparseMap {
  private _mappings = [] as { src: number; offset: number; length: number }[];

  addMapping(src: number, dest: number, length: number) {
    this._mappings.push({ src, offset: dest - src, length });
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
}
