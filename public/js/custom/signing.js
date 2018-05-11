function signData(postBody, dsiwareData) {
  return new Promise((resolve, reject) => {
    $.post('https://tsign.jisagi.net/sign', postBody, response => {
      let data = JSON.parse(response);
      if (data.error) return reject(`Signing Error: ${data.error}`);
      resolve({ signatures: JSON.parse(data.response), dsiwareData: dsiwareData });
    }).fail(() => {
      reject('Couldn\'t connect to the signing server. Please check your internet connection or try again later');
    });
  });
}
