import { IPlayWordComponent } from "components/interfaces/word";
import { ComponentAttempt } from "components/play/model";

const mark = (component: IPlayWordComponent, attempt: ComponentAttempt<any>) => {
    attempt.correct = true;
    attempt.maxMarks = 6;

    component.words.forEach((word, index) => {
        const isChecked = attempt.answer.indexOf(index) !== -1;
        const shouldBeChecked = word.checked === true;
        if(isChecked !== shouldBeChecked) {
            attempt.correct = false;
        }
    });

    if(attempt.correct) {
        attempt.marks = attempt.maxMarks;
    } else {
        if (attempt.answer.length === 0) {
            attempt.marks = 0;
        } else {
            attempt.marks = 2;
        }
    }

    return attempt;
};

export default mark;