import {
  Question, QuestionTypeEnum, QuestionComponentTypeEnum, Hint, HintStatus
} from 'model/question';
import {QuestionValueType} from '../buildQuestions/questionTypes/types';
import { Answer } from '../buildQuestions/questionTypes/pairMatchBuild/types';
import { MissingChoice } from '../buildQuestions/questionTypes/missingWordBuild/MissingWordBuild';

const getUniqueComponent = (components: any[]) => {
  return components.find(c => c.type === QuestionComponentTypeEnum.Component);
}


export function getNonEmptyComponent(components: any[]) {
  return !components.find(c =>
    c.type === QuestionComponentTypeEnum.Text ||
    c.type === QuestionComponentTypeEnum.Image ||
    c.type === QuestionComponentTypeEnum.Quote ||
    c.type === QuestionComponentTypeEnum.Sound
  );
}

const validateHint = (hint: Hint) => {
  if (hint.status === HintStatus.Each) {
    const emptyHint = hint.list.some(h => h == null || h === "");
    return emptyHint;
  } else {
    return !hint.value;
  }
}

const validateNotEmptyAnswer = (comp: any) => {
  if (comp.list && comp.list.length >= 1) {
    let invalid = comp.list.find((a:any) => !a.value);
    if (invalid) {
      return false;
    }
    return true;
  }
  return false;
}

const getChecked = (list: any[]) => {
  return list.find((a:any) => a.checked === true);
}

const validateCheckedAnswer = (comp: any) => {
  if (comp.list && comp.list.length > 1) {
    let invalid = comp.list.find((a:any) => !a.value);
    if (invalid) {
      return false;
    }
    let checked = getChecked(comp.list);
    if (checked) {
      return true;
    }
  }
  return false;
}

const validateTwoCheckedAnswers = (comp: any) => {
  if (comp.list && comp.list.length > 1) {
    let invalid = comp.list.find((a:any) => !a.value);
    if (invalid) {
      return false;
    }

    let checkedCount = 0;
    for (let choice of comp.list) {
      if (choice.checked) {
        checkedCount++;
      }
    }
    if (checkedCount >= 2) {
      return true;
    }
  }
  return false;
}


const validatePairMatch = (comp: any) => {
  const validateChoice = (a: Answer) => {
    if (a.answerType === QuestionValueType.Image && !a.valueFile) {
      return false;
    } else if (a.answerType !== QuestionValueType.Image && !a.value) {
      return false;
    }
    return true;
  }

  const validateOption = (a: Answer) => {
    if (a.optionType === QuestionValueType.Image && !a.optionFile) {
      return false;
    } else if (a.optionType !== QuestionValueType.Image && !a.option) {
      return false;
    }
    return true;
  }

  const getInvalid = (a:Answer) => {
    if (!validateChoice(a)) {
      return true;
    }

    if (!validateOption(a)) {
      return true;
    }

    return false;
  }

  if (comp.list && comp.list.length > 1) {
    let invalid = comp.list.find(getInvalid);
    if (invalid) {
      return false;
    }
    return true;
  }
  return false;
}

const validateSort = (comp: any) => {
  if (comp.categories && comp.categories.length > 1) {
    const invalid = comp.categories.find((c:any) => {
      if (!c.name) {
        return true;
      }
      const invalid = c.answers.find((a:any) => !a.value);
      if (invalid) {
        return true;
      }
      return false;
    });
    if (invalid) {
      return false;
    }
    return true;
  }
  return false;
}

const validateWordHighlighting = (comp: any) => {
  if (comp.words && comp.words.length > 1) {
    const valid = comp.words.find((w:any) => w.checked);
    if (valid) {
      return true;
    }
  }
  return false;
}

const validateLineHighlighting = (comp: any) => {
  if (comp.lines && comp.lines.length > 1) {
    const valid = comp.lines.find((l:any) => l.checked);
    if (valid) {
      return true;
    }
  }
  return false;
}

const validateMissingWord = (comp: any) => {
  for (let choice of comp.choices as MissingChoice[]) {
    let invalid = choice.answers.find((a:any) => !a.value);

    if (invalid) {
      return false;
    }
   
    let checked = getChecked(choice.answers);
    if (!checked) {
      return false;
    }
  }
  return true;
}

export function validateQuestion(question: Question) {
  const {type, hint, components} = question;

  let noComponent = getNonEmptyComponent(components);
  if (noComponent) {
    return false;
  }

  let isHintInvalid = validateHint(hint);
  if (isHintInvalid) {
    return false;
  }

  const comp = getUniqueComponent(components);
  if (type === QuestionTypeEnum.ShortAnswer || type === QuestionTypeEnum.VerticalShuffle
    || type === QuestionTypeEnum.HorizontalShuffle)
  {
    return validateNotEmptyAnswer(comp);
  } else if (type === QuestionTypeEnum.ChooseOne) {
    return validateCheckedAnswer(comp);
  } else if (type === QuestionTypeEnum.ChooseSeveral) {
    return validateTwoCheckedAnswers(comp);
  } else if (type === QuestionTypeEnum.PairMatch) {
    return validatePairMatch(comp);
  } else if (type === QuestionTypeEnum.Sort) {
    return validateSort(comp);
  } else if (type === QuestionTypeEnum.WordHighlighting) {
    return validateWordHighlighting(comp);
  } else if (type === QuestionTypeEnum.LineHighlighting) {
    return validateLineHighlighting(comp);
  } else if (type === QuestionTypeEnum.MissingWord) {
    return validateMissingWord(comp);
  }
  return false;
};
