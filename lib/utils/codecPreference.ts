/* eslint func-names: ["error", "as-needed"] */
export type AvailableCodecs = 'OPUS' | 'G722' | 'PCMA' | 'PCMU' | 'ISAC' | 'CN';

/**
 * Get payload value for each preferred codec.
 * @param {String} codec - preferred codec
 * @param {String} sdp - rtcsession description
 * @returns Payload value
 */
const getPayloadValue = function (
  codec: string,
  sdp: string,
): false | RegExpMatchArray {
  const reg = new RegExp(`a=rtpmap:.* ${codec}(.*)`, 'ig');
  if (sdp.match(reg)) {
    const splitStr = sdp.match(reg) ? sdp.match(reg) : null;
    let splitStr2: any = [''];
    if (splitStr) {
      splitStr2 = splitStr[0].split(' ');
    }
    return splitStr2[0].match(/\d+/);
  }
  return false;
};

/**
 * Clear non preferred codecs information.
 * @param {String} totalList - list of all codecs
 * @param {String} sdp - rtcsession description
 * @returns SDP with preferred codecs
 */
const clearCodec = function (totalList: string[], sdp: string): string {
  let reg: RegExp;
  totalList.forEach((codec) => {
    const val = getPayloadValue(codec, sdp);
    // clear in rtpmap
    reg = new RegExp(`\na=rtpmap:.*${codec}/.*`, 'ig');
    // eslint-disable-next-line no-param-reassign
    sdp = sdp.replace(reg, '');
    // clear in fmtp
    reg = new RegExp(`\na=fmtp:${val} (.*)`, 'ig');
    // eslint-disable-next-line no-param-reassign
    sdp = sdp.replace(reg, '');
    // clear in rtcp
    reg = new RegExp(`\na=rtcp-fb:${val} (.*)`, 'ig');
    // eslint-disable-next-line no-param-reassign
    sdp = sdp.replace(reg, '');
  });
  return sdp;
};

/**
 * Update incoming call information.
 * @param {Array<AvailableCodecs>} prefCodecs - preferred codec list
 * @param {String} sdp - rtcsession description
 */
const codecPref = function (prefCodecs: AvailableCodecs[], sdp: string): string {
  if (prefCodecs.length > 0) {
    const totalList = ['OPUS', 'G722', 'PCMA', 'PCMU', 'ISAC', 'CN'];
    let codecListVal = '';
    prefCodecs.forEach((codec) => {
      const index = totalList.indexOf(codec);
      if (index > -1) {
        totalList.splice(index, 1);
      }
      const codecPayloadVal = getPayloadValue(codec, sdp);
      if (codecPayloadVal) codecListVal += `${codecPayloadVal} `;
    });
    codecListVal = codecListVal.slice(0, -1);
    const sdpAudio = sdp.match(/m=audio .*[a-z] (.*)/i);
    // eslint-disable-next-line no-param-reassign
    sdp = sdpAudio
      ? sdp.replace(sdpAudio[1], codecListVal)
      : sdp;
    // eslint-disable-next-line no-param-reassign
    sdp = clearCodec(totalList, sdp);
  }
  return sdp;
};

export default codecPref;
