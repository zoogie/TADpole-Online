function start() {
  $('.btn-startInjection')[0].disabled = true;
  document.getElementById("p-error").innerHTML = '';
  loadFiles().then(data => {
    if (typeof data !== 'object') return abort(data);
    let dsiware = data[0];
    let movable = data[1];
    let game = data[2];
    let save = data[3];
    let ctcert = data[4];

    /* Validation */
    if (movable.length !== 0x140) return abort('movable.sed not valid');
    if (ctcert.length !== 0x19E) return abort('ctcert.bin not valid');

    let crcGame = getCrc(game);
    if (!constants.hashes.all.includes(crcGame)) return abort('game_XXX.app is not valid');
    let crcSave = getCrc(save);
    if (!constants.hashes.all.includes(crcSave)) return abort('public_XXX.sav is not valid');

    /* Data Extraction */
    let locC = constants.dataLocations.ctcert;
    let publicKeyR = sliceArr(ctcert, locC.publicKeyR.off, locC.publicKeyR.len);
    let publicKeyS = sliceArr(ctcert, locC.publicKeyS.off, locC.publicKeyS.len);
    let privateKey = sliceArr(ctcert, locC.privateKey.off, locC.privateKey.len);

    let locM = constants.dataLocations.movable;
    let movableKeyY = sliceArr(movable, locM.keyY.off, locM.keyY.len);
    let normalKey = extractNormalKey(movableKeyY, constants.keys.keyX);
    let dsiwareData = extractDsiware(dsiware, normalKey);
    if (!dsiwareData) return abort('Wrong movable.sed provided');

    /* msed_data extraction */
    let msedDataHex = extractMsedData(movable);
    let movableCrc = getCrc(movable);

    /* app replacing */
    let srl = dsiwareData.other['srl.nds'];
    if (game.length > srl.length) return abort('Game not compatible');
    let end = sliceArr(srl, game.length, srl.length - game.length);
    let newApp = new Uint8Array(game.length + end.length);
    newApp.set(game);
    newApp.set(end, game.length);

    /* sav replacing */
    let sav = dsiwareData.other['public.sav'];
    if (save.length > sav.length) return abort('Save not compatible with this game');
    end = sliceArr(sav, save.length, sav.length - save.length);
    let newSav = new Uint8Array(save.length + end.length);
    newSav.set(save);
    newSav.set(end, save.length);

    /* update data */
    dsiwareData.other['srl.nds'] = newApp;
    dsiwareData.other['public.sav'] = newSav;

    /* update footer hashes & add ctcert/pubkey */
    dsiwareData = rebuildFooter(dsiwareData, ctcert);

    /* signing */
    let body = {
      publicKeyR: byteArrToHexStr(publicKeyR),
      publicKeyS: byteArrToHexStr(publicKeyS),
      privateKey: byteArrToHexStr(privateKey),
      hashesBlock: byteArrToHexStr(sha256.array(dsiwareData.hashesBlock)),
      apcert: byteArrToHexStr(sha256.array(dsiwareData.apcert)),
      msedDataHex: msedDataHex,
      movableCrc: movableCrc,
    };
    $.post('https://tsign.jisagi.net/sign', body, data => {
      data = JSON.parse(data);
      if (data.error) return abort(`Signature Error: ${data.error}`);
      let { sigHashesBlock, sigApcert } = JSON.parse(data.response);

      sigHashesBlock = parseHexString(sigHashesBlock);
      sigApcert = parseHexString(sigApcert);

      /* inject signatures */
      dsiwareData = injectSignatures(dsiwareData, sigHashesBlock, sigApcert);

      /* rebuild dsiware */
      dsiwareData.keys = { movableKeyY: movableKeyY, normalKey: normalKey };
      let dsiwareFinal = buildDsiware(dsiwareData, dsiware.length);

      /* offer file to download */
      download(dsiwareFinal);

      /* End */
      console.log('Done');
    }).always(() => {
      $('.btn-startInjection')[0].disabled = false;
    });
  });
}
