class Rando {
  seed: number

  constructor(initialSeed: number) {
    this.seed = initialSeed % 2147483647
    if (this.seed <= 0) {
      this.seed += 2147483646
    }
    this.next()
    this.next()
    this.next()
    this.next()
  }

  next(a = 0, b = 1) {
    this.seed = (this.seed * 16807) % 2147483647
    return (this.seed / 2147483647) * (b - a) + a
  }

  nextSymRange(range = 1) {
    return range * (this.next() - 0.5)
  }
}

export default Rando

//TODO maybe try this from https://github.com/bryc/code/blob/master/jshash/PRNGs.md#splitmix32

// function splitmix32(a) {
//   return function () {
//     a |= 0
//     a = (a + 0x9e3779b9) | 0
//     let t = a ^ (a >>> 16)
//     t = Math.imul(t, 0x21f0aaad)
//     t = t ^ (t >>> 15)
//     t = Math.imul(t, 0x735a2d97)
//     return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296
//   }
// }
