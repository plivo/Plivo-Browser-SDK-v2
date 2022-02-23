/* eslint func-names: ["error", "as-needed"] */
/**
 * Check if extra header key is valid.
 * @param {String} key - extra header key
 */
export const checkExtraHeaderKey = function (key: string): boolean {
  
  const keyUppercase = key.toUpperCase();
  
  if(keyUppercase.startsWith('X-PH') || keyUppercase.startsWith('X-PL')) {
    // key only contain [A-Z], [a-z] and [0-9], max length = 24
    // 19 = 24 - 5
    const keyRegex = /^([a-z0-9A-Z-]){1,19}$/; // - added to Customer headers key as per close.io request
    return keyRegex.test(key.substr(5)) !== false;
  }

  return false; 
};

/**
 * Check if extra header value is valid.
 * @param {String} key - extra header value
 */
export const checkExtraHeaderVal = function (value: string): boolean {
  // value only contain [A-Z], [a-z], [0-9] and '%', max length = 48
  const valRegex = /^([a-z0-9A-Z_\-+()%.]){1,500}$/; // +-_() added to Customer headers as per close.io request
  return valRegex.test(value) !== false;
};

/**
 * Extract extra headers from incoming call request.
 * @param {Any} request - call request
 * @param {Any} headers - all request headers
 */
export const receiveExtraHeader = function (request: any, headers: any): any {
  const cleanExtraHeaders = {};
  const keys = Object.keys(headers);
  keys.forEach((key) => {
    const val = request.getHeader(key);
    if (checkExtraHeaderKey(key) && checkExtraHeaderVal(val)) {
      cleanExtraHeaders[key] = val;
    }
  });
  return cleanExtraHeaders;
};
