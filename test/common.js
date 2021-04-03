const request = require('request');

// 请求
// eslint-disable-next-line sonarjs/cognitive-complexity
function ajax({
  url = '', formData = {}, tip = {},
  type = 'post', dataType = 'formData',
} = {}) {
  type = type.toLowerCase();
  let firstVal = '';
  let postVal;
  if (type === 'get') {
    for (let key in formData) {
      const chat = url.match(/\?/g) ? '&' : '?';
      let val = formData[key];
      if (typeof val === 'object' || val instanceof Array) {
        val = JSON.stringify(val);
      }
      url = `${url}${chat}${key}=${val}`;
    }
    firstVal = encodeURI(url);
  } else {
    postVal = { url, formData };
  }
  if (dataType === 'form') {
    postVal = {
      url,
      form: formData
    };
  } else if (dataType === 'body') {
    postVal = {
      url,
      json: formData
    };
  }
  return new Promise((resolve, reject) => {
    const callback = (err, httpResponse, body) => {
      if (
        err ||
        (
          typeof body === 'object' &&
          (
            (body.code !== undefined && body.code !== 200) ||
            (body.statusCode !== undefined && body.statusCode !== 200)
          )
        )
      ) {
        reject({ error: err || body, url });
        return console.error(tip.error, err ? err.message : body, url);
      }
      // console.info(tip.success, body);
      resolve(body);
    };
    type === 'get'
      ? request(firstVal, callback)
      : request.post(postVal, callback);
  });
}

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

module.exports = {
  ajax, delay,
};