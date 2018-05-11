function extractNormalKey(movableKeyY, keyXHex) {
  let keyX = bigInt(keyXHex, 0x10);
  let c = bigInt(constants.keys.c, 0x10);
  let f128 = bigInt('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF', 0x10);
  let keyY = bigInt(byteArrToHexStr(movableKeyY), 0x10);
  let n = keyX.shiftLeft(2).or(keyX.shiftRight(128 - 2)).and(f128);
  n = n.xor(keyY).add(c).and(f128);
  n = n.shiftLeft(87).or(n.shiftRight(128 - 87)).and(f128);
  let arr = n.toArray(256).value;
  while (arr.length < 16) arr = [0].concat(arr);
  return arr;
}

function extractDsiware(dsiware, normalKey) {
  /* banner/header/footer extr & decrypt */
  let locB = constants.dataLocations.dsiware.banner;
  let locH = constants.dataLocations.dsiware.header;
  let locF = constants.dataLocations.dsiware.footer;
  let banner = dump(dsiware, normalKey, locB.off, locB.len);
  let header = dump(dsiware, normalKey, locH.off, locH.len);
  let footer = dump(dsiware, normalKey, locF.off, locF.len);

  /* hash check */
  if (!validateDsiwareComponents(banner, header, footer)) return;

  /* content list extr & decrypt */
  let buffer = sliceArr(header, 0x48, 0x2C).buffer;
  let sizes = new Int32Array(buffer);
  sizes.forEach((s, i) => { if (s === 0xB34) sizes[i] = 0xB40 });

  let other = {};
  let offset = constants.dataLocations.dsiware.other.off;
  let otherNames = constants.dsiwareContent;
  for (let i = 0; i < 11; i++) {
    if (sizes[i] === 0) continue;
    other[otherNames[i]] = dump(dsiware, normalKey, offset, sizes[i]);
    offset += sizes[i] + 0x20;
  }

  return {
    banner: banner,
    header: header,
    footer: footer,
    other: other,
  };
}

function dump(dsiware, normalKey, off, len) {
  let encrypted = sliceArr(dsiware, off, len);
  let iv = sliceArr(dsiware, off + len + 0x10, 0x10);
  let aesCbc = new aesjs.ModeOfOperation.cbc(normalKey, iv);
  let decryptedBytes = aesCbc.decrypt(encrypted);
  return decryptedBytes;
}
