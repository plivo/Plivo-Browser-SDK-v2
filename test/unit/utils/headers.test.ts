import { checkExtraHeaderKey, checkExtraHeaderVal, receiveExtraHeader } from '../../../lib/utils/headers';

describe('Headers', () => {
  let incomingRequest;
  let requestHeaders;

  beforeAll(() => {
    requestHeaders = {
      'X-CallUUID': 'fb85a852-e7be-11ea-b940-5b5a84a8b39b',
      'X-PH-value1': 'unit',
      'X-pH-value2': 'mock',
    };
    incomingRequest = {
      getHeader: (headerKey) => {
        if (headerKey) {
          return requestHeaders[headerKey];
        }
      },
    };
  });

  it('should pass when key is correct', () => {
    expect(checkExtraHeaderKey('X-PH-value')).toBeTruthy();
  });

  it('should fail when key is incorrect', () => {
    expect(checkExtraHeaderKey('X-1H-value')).toBeFalsy();
  });

  it('should pass when value is correct', () => {
    expect(checkExtraHeaderVal('testing')).toBeTruthy();
  });

  it('should fail when value is incorrect', () => {
    expect(checkExtraHeaderVal('te$@ting')).toBeFalsy();
  });

  it('should extract extra headers from incoming request', () => {
    const extraHeaders = {
      'X-PH-value1': 'unit',
      'X-pH-value2': 'mock',
    };
    expect(receiveExtraHeader(incomingRequest, requestHeaders)).toStrictEqual(extraHeaders);
  });
});
