import CheckCodecPreference from '../../../lib/utils/codecPreference';

describe('CheckCodecPreference', () => {
  let inputSDP;

  beforeAll(() => {
    inputSDP = 'm=audio 26834 UDP/TLS/RTP/SAVPF 111\na=rtpmap:111 opus/48000/2';
  });

  it('should return output same as input', () => {
    expect(CheckCodecPreference([], '')).toBe('');
  });

  it('should extract preferred codecs from sdp', () => {
    const expected = 'm=audio 26834 UDP/TLS/RTP/SAVPF 111\na=rtpmap:111 opus/48000/2';
    expect(CheckCodecPreference(['OPUS', 'PCMU'], inputSDP)).toBe(expected);
  });

  it('should remove not preferred codecs from sdp', () => {
    const expected = 'm=audio 26834 UDP/TLS/RTP/SAVPF ';
    expect(CheckCodecPreference(['OPUS1'] as any, inputSDP)).toBe(expected);
  });
});
