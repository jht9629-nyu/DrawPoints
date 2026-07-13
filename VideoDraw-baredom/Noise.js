// Seeded Perlin noise implementation (improved Perlin noise).
// noise(x, y, z) returns a smooth value in [0, 1].

class Noise {
  constructor(seed = 0) {
    this.permutation = new Uint8Array(512);
    this.setSeed(seed);
  }

  setSeed(seed = 0) {
    const rand = this._mulberry32(this._normalizeSeed(seed));
    const base = new Uint8Array(256);
    for (let i = 0; i < 256; i += 1) {
      base[i] = i;
    }

    // Fisher-Yates shuffle to build a seed-dependent permutation table.
    for (let i = 255; i > 0; i -= 1) {
      const j = Math.floor(rand() * (i + 1));
      const tmp = base[i];
      base[i] = base[j];
      base[j] = tmp;
    }

    for (let i = 0; i < 512; i += 1) {
      this.permutation[i] = base[i & 255];
    }
  }

  noise(x, y = 0, z = 0) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;

    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const zf = z - Math.floor(z);

    const u = this._fade(xf);
    const v = this._fade(yf);
    const w = this._fade(zf);

    const p = this.permutation;

    const A = p[X] + Y;
    const AA = p[A] + Z;
    const AB = p[A + 1] + Z;
    const B = p[X + 1] + Y;
    const BA = p[B] + Z;
    const BB = p[B + 1] + Z;

    const n000 = this._grad(p[AA], xf, yf, zf);
    const n100 = this._grad(p[BA], xf - 1, yf, zf);
    const n010 = this._grad(p[AB], xf, yf - 1, zf);
    const n110 = this._grad(p[BB], xf - 1, yf - 1, zf);
    const n001 = this._grad(p[AA + 1], xf, yf, zf - 1);
    const n101 = this._grad(p[BA + 1], xf - 1, yf, zf - 1);
    const n011 = this._grad(p[AB + 1], xf, yf - 1, zf - 1);
    const n111 = this._grad(p[BB + 1], xf - 1, yf - 1, zf - 1);

    const x1 = this._lerp(n000, n100, u);
    const x2 = this._lerp(n010, n110, u);
    const y1 = this._lerp(x1, x2, v);

    const x3 = this._lerp(n001, n101, u);
    const x4 = this._lerp(n011, n111, u);
    const y2 = this._lerp(x3, x4, v);

    const value = this._lerp(y1, y2, w);
    return (value + 1) * 0.5;
  }

  _fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  _lerp(a, b, t) {
    return a + t * (b - a);
  }

  _grad(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  _normalizeSeed(seed) {
    if (typeof seed === "number" && Number.isFinite(seed)) {
      return seed >>> 0;
    }

    const str = String(seed);
    let h = 2166136261;
    for (let i = 0; i < str.length; i += 1) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  _mulberry32(seed) {
    let a = seed >>> 0;
    return function rand() {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
}

window.Noise = Noise;
