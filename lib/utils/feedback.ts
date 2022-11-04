/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable prefer-promise-reject-errors */
/* eslint func-names: ["error", "as-needed"] */
import * as C from '../constants';
// eslint-disable-next-line import/no-cycle
import { Logger } from '../logger';

export interface FeedbackObject {
  overall: number;
  comment: string;
}

const Plivo = { log: Logger };

/**
 * Check if feedback issues are from predefined list of issues.
 * @param {Function} resolve - return validated feedback information when fulfilled
 * @param {Function} reject - not fulfilled if feedback parameters are wrong
 * @param {String} note - Send any remarks
 * @param {Array<String>} issues - Provide suspected issues
 * @param {Number} score - Rate the call from 1 to 5
 */
const validateIssues = function (
  resolve: (value: FeedbackObject) => void,
  reject: (reason: any) => void,
  note: string,
  issues: string[] = [],
  score: number,
): void {
  const issuesEnum: string[] = [];
  if (!Array.isArray(issues)) {
    reject('Attribute issues should be an array');
    return;
  }
  if (score !== 5 && (!issues || issues.length < 1)) {
    Plivo.log.error(
      'submitCallQualityFeedback() Atleast one issue is mandatory for feedback',
    );
    reject('Atleast one issue is mandatory for feedback');
    return;
  }
  if (issues.length >= 1) {
    // extract enum for issue
    issues.forEach((issue) => {
      if (typeof issue === 'string') {
        const _issue = issue.trim().toUpperCase();
        const extractedIssue = C.DEFAULT_COMMENTS[_issue];
        if (extractedIssue) issuesEnum.push(extractedIssue);
      }
    });
    if (issuesEnum.length < 1) {
      const validIssues = Object.keys(C.DEFAULT_COMMENTS);
      if (score === 5) {
        // star rating can choose to send or not send issues
        Plivo.log.debug(
          `submitCallQualityFeedback() Feedback with full rating without any Issues or matches from predefined list of issues -${
            validIssues}`,
        );
      } else {
        // validate issues match the predefined issues list
        Plivo.log.error(
          `submitCallQualityFeedback() Issues must be from the predefined list of issues for feedback -${
            validIssues}`,
        );
        reject(
          `Issues must be from the predefined list of issues - ${validIssues}`,
        );
        return;
      }
    }
  }
  resolve({
    overall: score,
    comment: `${issuesEnum} ${note}` || '',
  });
};

/**
 * Check feedback information.
 * @param {String} callUUID - specify the CallUUID for which feedback needs to be sent
 * @param {String} starRating - Rate the call from 1 to 5
 * @param {String} note - Send any remarks
 * @param {Array<String>} issues - Provide suspected issues
 * @param {String} userName
 * @param {Boolean} isLoggedIn - Loggedin status
 */
export const validateFeedback = function (
  callUUID: string,
  starRating: string,
  note: string,
  issues: string[],
  userName: string,
  isLoggedIn: boolean,
): Promise<FeedbackObject> {
  return new Promise((resolve, reject) => {
    if (!userName) {
      Plivo.log.error(
        `submitCallQualityFeedback() username is null, isLoggedIn : ${
          isLoggedIn}`,
      );
      reject('username not found');
      return;
    }
    if (!callUUID) {
      Plivo.log.error('submitCallQualityFeedback() callUUID is mandatory');
      reject('callUUID is mandatory');
      return;
    }
    if (!starRating) {
      Plivo.log.error('submitCallQualityFeedback() starRating is not given ');
      reject('Star rating is Mandatory');
      return;
    }
    const starRatingNumber = Number(starRating);
    if (starRatingNumber <= 0 || starRatingNumber > 5) {
      Plivo.log.error(
        `submitCallQualityFeedback() starRating: ${
          starRatingNumber
        } , starRating should be from 1-5 range`,
      );
      reject('score should be from 1-5 range');
      return;
    }
    if (note && note.toString().length > 280) {
      Plivo.log.error(
        'submitCallQualityFeedback() max length for note is 280 characters',
      );
      reject('Maximum length for note is 280 charecters');
      return;
    }
    validateIssues(resolve, reject, note, issues, starRatingNumber);
  });
};
