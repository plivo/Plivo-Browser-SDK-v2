import {
  validateCallStats, getPreSignedS3URL, uploadConsoleLogsToBucket, PreSignedUrlRequest, PreSignedUrlResponse,
} from '../../../lib/stats/httpRequest';
import { FeedbackObject } from '../../../lib/utils/feedback';

describe('StatsRequest', () => {
  let preSignedURLBody: PreSignedUrlRequest; let preSignedURLReponse: PreSignedUrlResponse; let
    userFeedback: FeedbackObject;

  beforeAll(() => {
    preSignedURLBody = {
      username: 'testing',
      password: 'secret',
      domain: 'testDomain',
      calluuid: 'fb85a852-e7be-11ea-b940-5b5a84a8b39b',
      accessToken: ''
    };
    preSignedURLReponse = {
      data: 'https://dummy-bucket.s3.amazonaws.com/consolelogs/',
    };
    userFeedback = {
      overall: 4,
      comment: 'audio_lag Good',
    };
  });

  it('should fetch callstats key and validate plivo callstats', async () => {
    const fetchData = {
      data: 'fb85a852-e7be-11ea-b940-5b5a84a8b39b',
      is_rtp_enabled: true,
    };
    resolveGlobalFetch(true, JSON.stringify(fetchData));
    expect(validateCallStats('sip:testing', 'secret', false)).resolves.toStrictEqual(fetchData);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should reject with call insights is not enabled', async () => {
    resolveGlobalFetch(true, null);
    const error = 'Call insights is not enabled';
    expect(validateCallStats('sip:testing', 'secret', false)).rejects.toMatch(error);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should reject with incorrect response code', async () => {
    resolveGlobalFetch(false, null);
    const error = 'Incorrect response code';
    expect(validateCallStats('sip:testing', 'secret', false)).rejects.toMatch(error);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should reject with error in calling callstats', async () => {
    const error = 'Error in calling callstats';
    rejectGlobalFetch(error);
    expect(validateCallStats('sip:testing', 'secret', false)).rejects.toMatch(error);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should fetch pre-signed s3 url from plivo call stats', async () => {
    resolveGlobalFetch(true, JSON.stringify(preSignedURLReponse));
    expect(getPreSignedS3URL(preSignedURLBody, false)).resolves.toStrictEqual(preSignedURLReponse);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should reject with response is not valid', async () => {
    const error = 'Response is not valid';
    resolveGlobalFetch(true, null);
    expect(getPreSignedS3URL(preSignedURLBody, false)).rejects.toMatch(error);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should reject with bad response from server', async () => {
    const error = 'Bad response from server';
    resolveGlobalFetch(false, null);
    expect(getPreSignedS3URL(preSignedURLBody, false)).rejects.toMatch(error);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should reject with did not get s3 url to upload', async () => {
    const error = 'Did not get s3 url to upload';
    (window as any).fetch = jest.fn(() => Promise.resolve({
      ok: true,
      text: () => Promise.reject('Did not get s3 url to upload'),
    }));
    expect(getPreSignedS3URL(preSignedURLBody, false)).rejects.toMatch(error);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should reject when API server did not return presigned s3 Url', async () => {
    const error = 'API server did not return the presigned S3 Url for uploading call logs';
    rejectGlobalFetch(error);
    expect(getPreSignedS3URL(preSignedURLBody, false)).rejects.toMatch(error);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should upload console logs to s3 bucket', async () => {
    resolveGlobalFetch(true, null);
    expect(uploadConsoleLogsToBucket(preSignedURLReponse, userFeedback)).resolves.toBe('done');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should reject with log file was not uploaded to server', async () => {
    const error = 'Log file was not uploaded to server';
    rejectGlobalFetch(error);
    expect(uploadConsoleLogsToBucket(preSignedURLReponse, userFeedback)).rejects.toMatch(error);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

const resolveGlobalFetch = (isOK: boolean, data: any) => {
  (window as any).fetch = jest.fn(() => Promise.resolve({
    ok: isOK,
    text: () => Promise.resolve(data),
  }));
};

const rejectGlobalFetch = (error: string) => {
  (window as any).fetch = jest.fn(() => Promise.reject(error));
};
