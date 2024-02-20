class XBOX360Retitler {
    static readTitle(array) {
        let title = "";

        for (let i = 0x412; array[i] !== 0x00; i += 2) {

            if (array[i] === 0x22 && array[i - 1] === 0x21) {
                title += "™";
                continue;
            }

            title += String.fromCharCode(array[i]);
        }

        return title;
    }

    static changeTitle(array, title) {

        let i = 0x412;

        const offsets = [
            [array[i] !== 0x00, 0x00],
            [array[i + 0x100] !== 0x00, 0x100],
            [array[i + 0x200] !== 0x00, 0x200],
            [array[i + 0x300] !== 0x00, 0x300],
            [array[i + 0x400] !== 0x00, 0x400],
            [array[i + 0x500] !== 0x00, 0x500],
            [array[i + 0x600] !== 0x00, 0x600],
            [array[i + 0x700] !== 0x00, 0x700],
            [array[i + 0x800] !== 0x00, 0x800],
            [array[i + 0x1280] !== 0x00, 0x1280],
            [array[i + 0x5009] !== 0x00, 0x5009],
            [array[i + 0x5109] !== 0x00, 0x5109],
            [array[i + 0x5209] !== 0x00, 0x5209]
        ]

        for (let j = 0; j < title.length; j++) {

            if (title.charCodeAt(j) === 0x2122) {

                for (let k = 0; k < offsets.length; k++) {

                    if (offsets[k][0]) {
                        array[i + offsets[k][1] - 1] = 0x21;
                        array[i + offsets[k][1]] = 0x22;
                    }
                }

            } else {

                for (let k = 0; k < offsets.length; k++) {

                    if (offsets[k][0]) {
                        array[i + offsets[k][1]] = title.charCodeAt(j);
                    }
                }
            }

            i += 2;
        }


        for (; array[i] !== 0x00; i += 2) {
            for (let k = 0; k < offsets.length; k++) {
                array[i + offsets[k][1]] = 0x00;
            }
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
