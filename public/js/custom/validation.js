function validateDsiwareComponents(banner, header, footer) {
  let hashBanner = sha256.array(banner);
  let hashHeader = sha256.array(header);
  let correctHashBanner = sliceArr(footer, 0, 0x20);
  let correctHashHeader = sliceArr(footer, 0x20, 0x20);
  if (byteArrToHexStr(hashBanner) !== byteArrToHexStr(correctHashBanner)
    || byteArrToHexStr(hashHeader) !== byteArrToHexStr(correctHashHeader))
    return false;
  return true;
}

function validateDsiwareSrl(srl, app) {
  srl = Array.from(srl);
  app = Array.from(app);
  if (srl.length > app.length) srl.length = app.length;
  return compareArr(srl, app);
}

function validateDsiwareRegion(dsiwareData, game, crcGame, crcSave) {
  let sig = byteArrToHexStr(sliceArr(dsiwareData.other['tmd'], 0x0, 0x4));
  let sigOffset = constants.signatureTypes[sig];
  let titleId = sliceArr(dsiwareData.other['tmd'], 0x4 + sigOffset + 0x4C, 0x8);
  let titleIdLow = sliceArr(titleId, 0x4, 0x4);
  let tIdLowStr = byteArrToHexStr(titleIdLow);
  console.log(tIdLowStr);

  // jpn 4swords filter
  if (tIdLowStr !== '4B51394A' && validateDsiwareSrl(dsiwareData.other['srl.nds'], game))
    throw new Error('This dsiware.bin is already modified and cannot be used');

  let injectionRegion;
  let regions = constants.hashes.regions;
  if (regions.us.includes(crcGame) && regions.us.includes(crcSave)) injectionRegion = 'us';
  else if (regions.eu.includes(crcGame) && regions.eu.includes(crcSave)) injectionRegion = 'eu';
  else if (regions.jp.includes(crcGame) && regions.jp.includes(crcSave)) injectionRegion = 'jp';
  if (!injectionRegion) throw new Error('The game_XXX.app and public_XXX.sav don\'t have the same region');

  let dsiwareRegion;
  if (constants.compatibleGames.us.includes(tIdLowStr)) dsiwareRegion = 'us';
  else if (constants.compatibleGames.eu.includes(tIdLowStr)) dsiwareRegion = 'eu';
  else if (constants.compatibleGames.jp.includes(tIdLowStr)) dsiwareRegion = 'jp';
  if (!dsiwareRegion) throw new Error('The used dsiware game is not supported. '
    + 'If you think your game is supported, please contact us on the Nintendo Homebrew Discord.<br>'
    + `Used game: ${tIdLowStr}`);

  if (injectionRegion !== dsiwareRegion) throw new Error('dsiware and game_XXX.app+public_XXX.sav region don\'t match');
}
