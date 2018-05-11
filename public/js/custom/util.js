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

function checkBrowserVersion() {
  try {
    let browser = {
      all: ['chrome', 'firefox', 'opera', 'edge', 'safari'],
      good: { chrome: 60, firefox: 50 },
      maybe: { opera: 45, edge: 15, safari: 10 },
    };
    let version = getBrowserVersion();
    if (version.length !== 2) throw new Error('Failed to identify browser!');
    $('.p-browser-version').text((version.join(' ').replace('MSIE', 'Internet Explorer')));
    if (!browser.all.includes(version[0].toLowerCase())) throw new Error('Browser unsupported!');

    let reqBrowser = version[0].toLowerCase();
    let reqVersion = version[1];
    let b = browser.good[reqBrowser] || browser.maybe[reqBrowser];
    if (b > reqVersion) throw new Error('Browser version too old, please update!');
    // some bugged browsers have 3+ version digits so anything >100 should be fine to filter
    if (reqVersion > 100) throw new Error('Browser version unsupported!');

    $('.p-browser-version').css('color', 'green');
  } catch (e) {
    $('.p-browser-error').text(e.message || 'Unknown Error');
    $('.p-browser-error').css('color', 'red');
    $('.p-browser-version').css('color', 'red');
  }
}

function getBrowserVersion() {
  let ua = navigator.userAgent;
  let tem;
  let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    return 'IE ' + (tem[1] || '');
  }
  if (M[1] === 'Chrome') {
    tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
    if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
  }
  M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
  if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
  return M;
}
