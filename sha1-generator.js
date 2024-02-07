/* https://stackoverflow.com/questions/16832586/get-sha1-checksum-of-byte-array-in-javascript */

class SHA1Generator {
  static hex_chr = "0123456789abcdef";

  static hex(num) {
    let str = "";
    for (let j = 7; j >= 0; j--)
      str += this.hex_chr.charAt((num >> (j * 4)) & 0x0f);
    return str;
  }

  static str2blks_SHA1(str) {
    const nblk = ((str.length + 8) >> 6) + 1;
    const blks = new Array(nblk * 16).fill(0);
    for (let i = 0; i < str.length; i++)
      blks[i >> 2] |= str.charCodeAt(i) << (24 - (i % 4) * 8);
    blks[str.length >> 2] |= 0x80 << (24 - (str.length % 4) * 8);
    blks[nblk * 16 - 1] = str.length * 8;
    return blks;
  }

  static add(x, y) {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >>> 16) + (y >>> 16) + (lsw >>> 16);
    return (msw << 16) | (lsw & 0xffff);
  }

  static rol(num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt));
  }

  static ft(t, b, c, d) {
    if (t < 20) return (b & c) | (~b & d);
    if (t < 40) return b ^ c ^ d;
    if (t < 60) return (b & c) | (b & d) | (c & d);
    return b ^ c ^ d;
  }

  static kt(t) {
    return t < 20
      ? 1518500249
      : t < 40
      ? 1859775393
      : t < 60
      ? -1894007588
      : -899497514;
  }

  static calcSHA1FromByte(byteArr) {
    const str = String.fromCharCode(...byteArr);
    return this.calcSHA1(str);
  }

  static calcSHA1(str) {
    if (str !== "") {
      const x = this.str2blks_SHA1(str);
      const w = new Array(80);

      let a = 1732584193;
      let b = -271733879;
      let c = -1732584194;
      let d = 271733878;
      let e = -1009589776;

      for (let i = 0; i < x.length; i += 16) {
        let [olda, oldb, oldc, oldd, olde] = [a, b, c, d, e];

        for (let j = 0; j < 80; j++) {
          if (j < 16) w[j] = x[i + j];
          else w[j] = this.rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
          const t = this.add(
            this.add(this.rol(a, 5), this.ft(j, b, c, d)),
            this.add(this.add(e, w[j]), this.kt(j))
          );
          e = d;
          d = c;
          c = this.rol(b, 30);
          b = a;
          a = t;
        }

        a = this.add(a, olda);
        b = this.add(b, oldb);
        c = this.add(c, oldc);
        d = this.add(d, oldd);
        e = this.add(e, olde);
      }
      return `${this.hex(a)}${this.hex(b)}${this.hex(c)}${this.hex(
        d
      )}${this.hex(e)}`;
    } else {
      return "";
    }
  }
}
