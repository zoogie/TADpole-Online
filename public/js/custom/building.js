function buildDsiware(dsiwareData, len) {
  let content = constants.dsiwareContent;
  let data = [
    dsiwareData.banner,
    dsiwareData.header,
    dsiwareData.footer,
  ];
  content.forEach(c => {
    if (dsiwareData.other.hasOwnProperty(c)) data.push(dsiwareData.other[c]);;
  });

  let offset = 0;
  let dsiwareFinal = new Uint8Array(len);
  for (let i = 0; i < data.length; i++) {
    let d = data[i];
    let metaData = metaGen(d, dsiwareData.keys.movableKeyY);
    let iv = sliceArr(metaData, 0x10, 0x10);
    let key = dsiwareData.keys.normalKey;
    let encryptedData = new aesjs.ModeOfOperation.cbc(key, new Uint8Array(0x10)).encrypt(d);
    dsiwareFinal.set(encryptedData, offset);
    dsiwareFinal.set(metaData, offset + encryptedData.length);
    offset += (encryptedData.length + metaData.length)
  }

  return dsiwareFinal;
}

function metaGen(data, movableKeyY) {
  let dataHash = sha256.array(data);
  let normalKeyCmac = extractNormalKey(movableKeyY, constants.keys.cmac);
  let key = CryptoJS.enc.Hex.parse(byteArrToHexStr(normalKeyCmac));
  let msg = CryptoJS.enc.Hex.parse(byteArrToHexStr(dataHash));
  let enc = CryptoJS.CMAC(key, msg);
  let metaData = new Uint8Array(0x20);
  metaData.set(parseHexString(enc.toString()));
  return metaData;
}
