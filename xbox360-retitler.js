class XBOX360Retitler {
  static readTitle(array) {
    let title = "";

    for (let i = 0x412; array[i] !== 0x00; i += 2) {

      if(array[i] === 0x22 && array[i - 1] === 0x21) {
        title += "™";
        continue;
      }

      title += String.fromCharCode(array[i]);

    }

    return title;
  }

  static changeTitle(array, title) {

    let i = 0x412;

    let check3rd = array[i + 0x800] !== 0x00;

    for (let j = 0; j < title.length; j++) {

      if(title.charCodeAt(j) === 0x2122) {
        array[i - 1] = 0x21;
        array[i] = 0x22;

        array[i + 0x1280 - 1] = 0x21;
        array[i + 0x1280] = 0x22;

        if(check3rd) {
          array[i + 0x800 - 1] = 0x21;
          array[i + 0x800] = 0x22;
        }
      }

      else {
        array[i] = title.charCodeAt(j);
        array[i + 0x1280] = title.charCodeAt(j);

        if(check3rd) {
          array[i + 0x800] = title.charCodeAt(j);
        }
      }

      i += 2;
    }

  }

  static readHash(array) {
    let sha1 = "";
    for (let i = 0; i < 20; i++) {
      sha1 += array[0x32c + i].toString(16).padStart(2, "0");
    }
    return sha1;
  }

  static writeHash(array) {
    let sha1 = SHA1Generator.calcSHA1FromByte(array.slice(0x344));
    for (let i = 0; i < 20; i++) {
      array[0x32c + i] = parseInt(sha1.substring(i * 2, i * 2 + 2), 16);
    }
  }

  static checkFile(array) {
    return (
      array.length === 45056 &&
      XBOX360Retitler.readHash(array) ===
        SHA1Generator.calcSHA1FromByte(array.slice(0x344))
    );
  }
}
