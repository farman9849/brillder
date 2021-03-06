import mark from './PairMatchScoring';

import { PairMatchComponent, PairMatchAnswer, PairMatchChoice } from '../../questionTypes/pairMatch/interface';
import { ComponentAttempt } from 'components/play/model';

const mockComponent: PairMatchComponent = {
    type: 127,
    list: [
        { index: 0 } as PairMatchChoice,
        { index: 1 } as PairMatchChoice,
        { index: 2 } as PairMatchChoice,
        { index: 3 } as PairMatchChoice,
        { index: 4 } as PairMatchChoice,
    ]
} as PairMatchComponent;

describe("pair match scoring", () => {

    it("should mark a correct answer with n marks", () => {
        // arrange
        const mockAttempt: ComponentAttempt<PairMatchAnswer> = {
            answer: [
                { index: 0 },
                { index: 1 },
                { index: 2 },
                { index: 3 },
                { index: 4 }
            ]
        } as ComponentAttempt<PairMatchAnswer>;

        // act
        const result = mark(mockComponent, mockAttempt);

        // assert
        expect(result.marks).toStrictEqual(5);
        expect(result.maxMarks).toStrictEqual(5);
        expect(result.correct).toStrictEqual(true);
    });

    it("should mark incorrect answers with 0.25 each", () => {
        // arrange
        const mockAttempt: ComponentAttempt<PairMatchAnswer> = {
            answer: [
                { index: 1 },
                { index: 2 },
                { index: 3 },
                { index: 4 },
                { index: 0 }
            ]
        } as ComponentAttempt<PairMatchAnswer>;

        // act
        const result = mark(mockComponent, mockAttempt);

        // assert
        expect(result.marks).toStrictEqual(1.25);
        expect(result.maxMarks).toStrictEqual(5);
        expect(result.correct).toStrictEqual(false);
    });

});