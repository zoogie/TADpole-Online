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
