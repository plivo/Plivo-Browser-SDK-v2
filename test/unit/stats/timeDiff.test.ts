import { resolve } from 'path';
import { checkTimeDiff }  from '../../../lib/managers/util';

describe('TimeDiff', () => {

    it('should have no time difference ', () => {
        let timeDiff: number = checkTimeDiff(Date.now());
        expect(timeDiff).toBe(0)
    });

    it('should have SDK timestamp behind rambo ', () => {
        let ramboServerTs: number = Date.now() + 3600000
        let timeDiff: number = checkTimeDiff(ramboServerTs);
        expect(timeDiff).toBeGreaterThan(0);
    });

    it('should have SDK timestamp ahead of rambo ', () => {
        let ramboServerTs: number = Date.now() - 3600000
        let timeDiff: number = checkTimeDiff(ramboServerTs);
        expect(timeDiff).toBeLessThan(0);
    });
});



