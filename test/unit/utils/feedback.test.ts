import { validateFeedback } from '../../../lib/utils/feedback';

describe('Feedback', () => {
  let callUUD: string; let starRating: string; let note: string; let issues: string[]; let userName: string; let
    isLoggedIn: boolean;

  beforeAll(() => {
    callUUD = 'fb85a852-e7be-11ea-b940-5b5a84a8b39b';
    starRating = '4';
    note = 'Good';
    issues = ['audio_lag'];
    userName = 'testuser';
    isLoggedIn = true;
  });

  it('should check if the data is valid', () => {
    const expected = {
      overall: 4,
      comment: 'audio_lag Good',
    };
    return expect(validateFeedback(callUUD, starRating, note, issues, userName, isLoggedIn)).resolves.toStrictEqual(expected);
  });

  it('should fail with error for username', () => {
    const error = 'username not found';
    return expect(validateFeedback(callUUD, starRating, note, issues, null as any, isLoggedIn)).rejects.toMatch(error);
  });

  it('should fail with error for calluuid', () => {
    const error = 'callUUID is mandatory';
    return expect(validateFeedback(null as any, starRating, note, issues, userName, isLoggedIn)).rejects.toMatch(error);
  });

  it('should fail with error for invalid issues', () => {
    const error = 'Issues must be from the predefined list of issues';
    return expect(validateFeedback(callUUD, starRating, note, ['audio_delay'], userName, isLoggedIn)).rejects.toMatch(error);
  });

  it('should fail with error for no issues', () => {
    const error = 'Atleast one issue is mandatory for feedback';
    return expect(validateFeedback(callUUD, starRating, note, [], userName, isLoggedIn)).rejects.toMatch(error);
  });

  it('should fail with error when issues are null', () => {
    const error = 'Attribute issues should be an array';
    return expect(validateFeedback(callUUD, starRating, note, null as any, userName, isLoggedIn)).rejects.toMatch(error);
  });

  it('should resolve with no issues', () => {
    const expected = {
      overall: 5,
      comment: ' Good',
    };
    return expect(validateFeedback(callUUD, '5', note, ['audio_delay'], userName, isLoggedIn)).resolves.toStrictEqual(expected);
  });

  it('should fail with error when note is long', () => {
    const error = 'Maximum length for note is 280 charecters';
    return expect(validateFeedback(callUUD, starRating, repeat('test', 75), issues, userName, isLoggedIn)).rejects.toMatch(error);
  });

  it('should fail with error when star rating is null', () => {
    const error = 'Star rating is Mandatory';
    return expect(validateFeedback(callUUD, null as any, note, issues, userName, isLoggedIn)).rejects.toMatch(error);
  });

  it('should fail with error for star rating', () => {
    const error = 'score should be from 1-5 range';
    return expect(validateFeedback(callUUD, '6', note, issues, userName, isLoggedIn)).rejects.toMatch(error);
  });
});

const repeat = (str: string, count: number) => {
  const array = [];
  for (let i = 0; i <= count;) array[i++] = str as never;
  return array.join('');
};
