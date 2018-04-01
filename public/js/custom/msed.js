function extractMsedData(movable) {
  let data = sliceArr(movable, 0x110, 0x10);
  let lfcs = new DataView(sliceArr(data, 0x0, 0x4).reverse().buffer).getUint32();
  let msed1 = new DataView(sliceArr(data, 0x4, 0x4).reverse().buffer).getUint32();
  let msed3 = new DataView(sliceArr(data, 0xC, 0x4).reverse().buffer).getUint32() & 0x7FFFFFFF;

  let est = Math.floor(lfcs / 5) - msed3;
  let isNew = Boolean(msed1) ? 1 : 0;
  lfcs = lfcs >> 12;

  let lfcsFinal = new Uint8Array(0x4);
  lfcsFinal.set(parseHexString(Number(lfcs).toString(16)).reverse());
  let estFinal = new Uint8Array(0x4);
  if (est < 0) est += (0xFFFFFFFF + 1);
  estFinal.set(parseHexString(Number(est).toString(16)).reverse());
  let isNewFinal = new Uint8Array(0x4);
  isNewFinal.set(parseHexString(`0${isNew}`).reverse());

  let msedDataHex = `${byteArrToHexStr(lfcsFinal)}${byteArrToHexStr(estFinal)}${byteArrToHexStr(isNewFinal)}`;

  return msedDataHex;
}
