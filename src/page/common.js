/* eslint-disable sonarjs/cognitive-complexity */
function ajax({ url, data = null, type = 'get', errorCallback = () => { } } = {}) {
  const xhr = new XMLHttpRequest();
  type = type.toLocaleLowerCase();
  if (type === 'get') {
    url = getUrl(url, data);
    data = null;
  }
  const protocol = location.protocol === 'http:' ? 'http:' : 'https:';
  if (url.indexOf('http') === -1) {
    url = protocol + url;
  }
  return new Promise((resolve, reject) => {
    xhr.onreadystatechange = function () {
      if (parseInt(xhr.readyState) === 4) {
        if ((xhr.status >= 200 && xhr.status < 300) || parseInt(xhr.status) === 304) {
          resolve({ status: true, code: xhr.status, data: xhr.responseText, url });
        } else {
          reject({ status: false, code: xhr.status, url, statusText: xhr.statusText });
        }
      }
    };
    xhr.onerror = function (err) {
      if (typeof err === 'object') {
        console.error(`请求接口${url}时出错，出错信息为：${JSON.stringify(err.message)}`);
        const msg = { status: false, code: xhr.status, url, statusText: xhr.statusText, err };
        errorCallback(msg);
        reject(msg);
      }
    };
    console.log(type, url);
    xhr.open(type, url, true);
    if (type === 'post') {
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      // xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    }
    xhr.send(getFormData(data));
  });
}

function getUrl(url, data) {
  if (!data) {
    return url;
  }
  Object.keys(data).forEach((key) => {
    const f = url.indexOf('?') === -1 ? '?' : '&';
    let val = data[key];
    if (val instanceof Object) {
      val = JSON.stringify(val);
    }
    url += `${f}${encodeURIComponent(key)}=${encodeURIComponent(val)}`;
  });
  return url;
}

function getFormData(data) {
  let result = '';
  Object.keys(data).forEach(key => {
    result = `${result}${result ? '&' : ''}${key}=${data[key]}`;
  });
  return result;
}