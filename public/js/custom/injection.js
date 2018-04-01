function rebuildFooter(dsiwareData, ctcert) {
  let {
    banner,
    header,
    footer,
    other,
  } = dsiwareData;

  /* calc hashes */
  let hashBanner = sha256.array(banner);
  let hashHeader = sha256.array(header);
  let hashes = [];
  hashes[0] = hashBanner;
  hashes[1] = hashHeader;

  let names = constants.dsiwareContent;
  names.forEach((n, i) => {
    if (other[n]) hashes[i + 2] = sha256.array(other[n]);
    else hashes[i + 2] = new Uint8Array(32);
  });

  let hashesBlock = new Uint8Array(13 * 32);
  hashes.forEach((h, i) => hashesBlock.set(h, i * 0x20));

  /* inject hashesBlock */
  let footerNew = new Uint8Array(footer.length);
  footerNew = insertIntoArray(footer, hashesBlock, 0);

  /* inject ctcert */
  let ctcertNoPrivKey = sliceArr(ctcert, 0, 0x180);
  footerNew = insertIntoArray(footerNew, ctcertNoPrivKey, hashesBlock.length + 0x1BC);

  /* inject pubkey */
  let pubKey = sliceArr(ctcert, 0x108, 0x3C);
  footerNew = insertIntoArray(footerNew, pubKey, hashesBlock.length + 0x3C + 0x108);

  /* create & inject apcertIssuer */
  let issuer = getByteArray('Nintendo CA - G3_NintendoCTR2prod-'); // len: 0x22
  let keyId = sliceArr(ctcert, 0xC4, 0x1E); // len: 0x40-0x22=0x1E
  let apcertIssuer = new Uint8Array(0x40);
  apcertIssuer.set(issuer);
  apcertIssuer.set(keyId, issuer.length);
  footerNew = insertIntoArray(footerNew, apcertIssuer, hashesBlock.length + 0x3C + 0x80);

  /* update data */
  dsiwareData.footer = footerNew;
  dsiwareData.hashesBlock = hashesBlock;
  dsiwareData.apcert = sliceArr(footerNew, hashesBlock.length + 0x3C + 0x80, 0x100);

  return dsiwareData;
}

function injectSignatures(dsiwareData, sigHashesBlock, sigApcert) {
  let hashesBlock = dsiwareData.hashesBlock;
  let footer = dsiwareData.footer;
  let footerNew = new Uint8Array(footer.length);

  /* inject hashesBlock & apcert */
  footerNew = insertIntoArray(footer, sigHashesBlock, hashesBlock.length);
  footerNew = insertIntoArray(footerNew, sigApcert, hashesBlock.length + 0x3C + 0x4);

  dsiwareData.footer = footerNew;

  return dsiwareData;
}
