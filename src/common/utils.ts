interface PortResultType {
  status: 'fail' | 'error' | 'success',
  message: string,
  code: 400 | 500 | 200,
  data: any,
}

export const portResult = {
  fail(msg = '', data: any = ''): PortResultType {
    return { status: 'fail', message: msg, code: 400, data };
  },
  success(msg = '', data: any = ''): PortResultType {
    return { status: 'success', message: msg, code: 200, data };
  },
  error(msg = '', data: any = ''): PortResultType {
    return { status: 'error', message: msg, code: 500, data };
  }
};

/**
 * 判断是否为对象
 * @param {Object} obj
 */
export function isObject(obj: any) {
  return obj !== null && obj instanceof Object;
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export function checkDataType(obj: { [key: string]: any }, arr: [string, string, boolean?][]) {
  if (!isObject(obj)) {
    throw new Error('第一个参数必须为对象');
  }
  if (!Array.isArray(arr)) {
    throw new Error('第二个参数必须为数组');
  }
  for (let i = 0, len = arr.length; i < len; i++) {
    if (!Array.isArray(arr[i])) {
      throw new Error('第二个参数必须为二维数组');
    }
    const [key, type, isRequire = true] = arr[i] || [];
    if (typeof type !== 'string') {
      throw new Error('类型必须为字符串');
    }
    const val = obj[String(key)];
    if (val === undefined) {
      if (isRequire) {
        return portResult.fail(`缺少参数${key}`);
      }
    } else {
      const types = type.split('|');
      const fail = types.reduce((r, t) => r && !isType(val, t), true);
      if (fail) {
        return portResult.fail(`参数${key}类型必须为${types.join('、')}`);
      }
    }
  }
  return portResult.success('');
}

function isType(val: any, type: string): boolean {
  const t = type.toLocaleLowerCase();
  if (t === 'object') {
    return isObject(val);
  } else if (t.indexOf('array') > -1) {
    // eslint-disable-next-line no-useless-escape
    const mat = t.match(/\[[^\[\]]*\]/g);
    const isA = Array.isArray(val);
    if (mat && isA) {
      const at = mat[0].replace(/\[|\]/g, '');
      return (val as []).every(v => isType(v, at));
    }
    return isA;
  } else if (t === 'boolean' && typeof val === 'string') {
    return val === 'true' || val === 'false';
  } else if (t === 'number' && typeof val === 'string') {
    return !isNaN(Number(val));
  }
  return typeof val === t;
}

export function delay(time: number) {
  return new Promise(resolve => setTimeout(resolve, time));
}
