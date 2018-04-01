function loadFiles() {
  return new Promise((resolve, reject) => {
    let fileDsiware = document.getElementById("dsiware");
    let fileMovable = document.getElementById("movable");
    let fileGame = document.getElementById("game");
    let fileSave = document.getElementById("save");
    let fileCtcert = document.getElementById("ctcert");

    if (!fileDsiware.files.length || !fileMovable.files.length || !fileGame.files.length
      || !fileSave.files.length || !fileCtcert.files.length)
      return resolve('Not all files provided');

    let promises = [];
    promises.push(loadFile(fileDsiware));
    promises.push(loadFile(fileMovable));
    promises.push(loadFile(fileGame));
    promises.push(loadFile(fileSave));
    promises.push(loadFile(fileCtcert));
    Promise.all(promises).then(data => {
      resolve(data);
    });
  });
}

function loadFile(input) {
  return new Promise(resolve => {
    let reader = new FileReader();
    reader.onload = function () {
      resolve(new Uint8Array(reader.result));
    };
    reader.readAsArrayBuffer(input.files[0]);
  });
}

function download(dsiwareFinal) {
  let dsiwareName = $('#dsiware')[0].files[0].name || 'dsiware.bin';
  dsiwareName = dsiwareName.substr(0, dsiwareName.length - 4).substr(0, 25).concat('.bin');
  let a = window.document.createElement('a');
  a.href = window.URL.createObjectURL(new Blob([dsiwareFinal], { type: 'application/octet-stream' }));
  a.download = `${dsiwareName}.patched`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
