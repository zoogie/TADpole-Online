function sliceArr(arr, offset, length) {
  return arr.slice(offset, offset + length);
}

function getCrc(buffer) {
  return (CRC32.buf(buffer) >>> 0).toString(16).padStart(8, '0').toUpperCase();
}

function abort(message = 'Error') {
  $('.btn-startInjection')[0].disabled = false;
  document.getElementById("p-error").innerHTML = message;
}

function getByteArray(text) {
  let arr = [];
  for (let i = 0; i < text.length; i++) { arr[i] = text.charCodeAt(i); }
  return arr;
}

function byteArrToHexStr(byteArr) {
  return Array.from(byteArr, b => `0${(b & 0xFF).toString(16)}`.slice(-2)).join('').toUpperCase();
}

function parseHexString(str) {
  if (str.length % 2 !== 0) str = `0${str}`;
  var result = [];
  while (str.length >= 2) {
    result.push(parseInt(str.substring(0, 2), 16));
    str = str.substring(2, str.length);
  }
  return new Uint8Array(result);
}

function insertIntoArray(originalArr, toInsert, offset) {
  // Uint8Array conversion to JS Array
  let orig = Array.from(originalArr);
  let insert = Array.from(toInsert);
  orig.splice(offset, insert.length, ...insert);
  return new Uint8Array(orig);
}
