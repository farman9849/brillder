import React from "react";
import { RouteComponentProps, Switch } from "react-router-dom";
import { Route } from "react-router-dom";
import { Grid, Hidden } from "@material-ui/core";
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import update from "immutability-helper";
// @ts-ignore
import { connect } from "react-redux";

import "./investigationBuildPage.scss";
import BuildQuestionComponent from "./buildQuestions/buildQuestionComponent";
import QuestionTypePage from "./questionType/questionType";
import DragableTabs from "./dragTabs/dragableTabs";
import PhonePreview from "components/build/baseComponents/phonePreview/PhonePreview";
import {
  Question,
  QuestionTypeEnum,
  QuestionComponentTypeEnum,
  HintStatus
} from "components/model/question";
import actions from "../../../redux/actions/brickActions";

interface ApiQuestion {
  id?: number;
  contentBlocks: string;
  type: number;
}

interface InvestigationBuildProps extends RouteComponentProps<any> {
  brick: any;
  fetchBrick(brickId: number): void;
  saveBrick(brick: any): void;
}

const InvestigationBuildPage: React.FC<InvestigationBuildProps> = props => {
  const brickId = parseInt(props.match.params.brickId);

  if (!props.brick || props.brick.id !== brickId) {
    props.fetchBrick(brickId);
  }

  const { history } = props;
  const getNewQuestion = (type: number, active: boolean) => {
    return {
      type,
      active,
      hint: {
        value: "",
        list: [] as string[],
        status: HintStatus.None
      },
      components: [
        { type: 0 },
        { type: QuestionComponentTypeEnum.Component },
        { type: 0 }
      ]
    } as Question;
  };

  const [questions, setQuestions] = React.useState([
    getNewQuestion(QuestionTypeEnum.None, true)
  ] as Question[]);
  const [loaded, setStatus] = React.useState(false as boolean);
  const [locked, setLock] = React.useState(false as boolean);

  if (!props.brick) {
    return <div>...Loading...</div>;
  }

  const getQuestionIndex = (question: Question) => {
    return questions.indexOf(question);
  };

  let activeQuestion = questions.find(q => q.active === true) as Question;
  if (!activeQuestion) {
    console.log("Can`t find active question");
    activeQuestion = {} as Question;
  }

  const setPreviousQuestion = () => {
    const index = getQuestionIndex(activeQuestion);
    if (index >= 1) {
      const updatedQuestions = questions.slice();
      updatedQuestions.forEach(q => (q.active = false));
      updatedQuestions[index - 1].active = true;
      setQuestions(update(questions, { $set: updatedQuestions }));
    } else {
      history.push('/build/new-brick/proposal');
    }
  };

  const setNextQuestion = () => {
    const index = getQuestionIndex(activeQuestion);
    let lastIndex = questions.length - 1;
    if (index < lastIndex) {
      const updatedQuestions = questions.slice();
      updatedQuestions.forEach(q => (q.active = false));
      updatedQuestions[index + 1].active = true;
      setQuestions(update(questions, { $set: updatedQuestions }));
    } else {
      createNewQuestion();
    }
  };

  const createNewQuestion = () => {
    const updatedQuestions = questions.slice();
    updatedQuestions.forEach(q => (q.active = false));
    updatedQuestions.push(getNewQuestion(QuestionTypeEnum.None, true));
    setQuestions(update(questions, { $set: updatedQuestions }));
  };

  const setQuestionTypeAndMove = (type: QuestionTypeEnum) => {
    if (locked) { return; }
    setQuestionType(type);
    history.push(
      `/build/brick/${brickId}/build/investigation/question-component`
    );
  };

  const setQuestionType = (type: QuestionTypeEnum) => {
    if (locked) { return; }
    var index = getQuestionIndex(activeQuestion);
    setQuestions(
      update(questions, {
        [index]: { type: { $set: type } }
      })
    );
  };

  const chooseOneToChooseSeveral = (type: QuestionTypeEnum) => {
    const index = getQuestionIndex(activeQuestion);
    const component = activeQuestion.components.find(
      c => c.type === QuestionComponentTypeEnum.Component
    );
    for (const answer of component.list) {
      answer.checked = false;
    }
    activeQuestion.type = type;
    const question = Object.assign({}, activeQuestion);
    setQuestion(index, question);
  };

  const convertQuestionTypes = (type: QuestionTypeEnum) => {
    if (
      type === QuestionTypeEnum.ChooseOne ||
      type === QuestionTypeEnum.ChooseSeveral
    ) {
      chooseOneToChooseSeveral(type);
    } else if (type === QuestionTypeEnum.Sort) {
      const index = getQuestionIndex(activeQuestion);
      activeQuestion.type = type;
      const question = Object.assign({}, activeQuestion);
      question.hint = {
        status: HintStatus.All,
        value: question.hint.value,
        list: []
      };
      setQuestion(index, question);
    } else {
      setQuestionType(type);
    }
  };

  const removeQuestion = (index: number) => {
    if (locked) { return; }
    if (questions.length === 1) {
      alert("You can`t delete last question");
      return;
    }
    if (index !== 0) {
      setQuestions(
        update(questions, {
          $splice: [[index, 1]],
          0: { active: { $set: true } }
        })
      );
    } else {
      setQuestions(
        update(questions, {
          $splice: [[index, 1]],
          [questions.length - 1]: { active: { $set: true } }
        })
      );
    }
  };

  const selectQuestion = (index: number) => {
    const updatedQuestions = questions.slice();
    updatedQuestions.forEach(q => (q.active = false));

    let selectedQuestion = updatedQuestions[index];
    if (selectedQuestion) {
      selectedQuestion.active = true;

      setQuestions(
        update(questions, {
          $set: updatedQuestions
        })
      );
    }
  };

  const toggleLock = () => {
    setLock(!locked);
  };

  const setQuestion = (index: number, question: Question) => {
    if (locked) { return; }
    setQuestions(update(questions, { [index]: { $set: question } }));
  };

  const { brick } = props;

  if (brick.id !== brickId) {
    return <div>...Loading...</div>;
  }

  if (brick.questions && loaded === false) {
    const parsedQuestions: Question[] = [];
    for (const question of brick.questions) {
      try {
        const parsedQuestion = JSON.parse(question.contentBlocks);
        if (parsedQuestion.components) {
          let q = {
            id: question.id,
            type: question.type,
            hint: parsedQuestion.hint,
            components: parsedQuestion.components
          } as Question;
          parsedQuestions.push(q);
        }
      } catch (e) {}
    }
    if (parsedQuestions.length > 0) {
      parsedQuestions[0].active = true;
      setQuestions(update(questions, { $set: parsedQuestions }));
      setStatus(update(loaded, { $set: true }));
    }
  }

  const saveBrick = () => {
    brick.questions = [];
    for (let question of questions) {
      let questionObject = {
        components: question.components,
        hint: question.hint
      };
      let apiQuestion = {
        type: question.type,
        contentBlocks: JSON.stringify(questionObject)
      } as ApiQuestion;
      if (question.id) {
        apiQuestion.id = question.id;
        apiQuestion.type = question.type;
      }
      brick.questions.push(apiQuestion);
    }
    props.saveBrick(brick);
  };

  const updateComponents = (components: any[]) => {
    if (locked) { return; }
    const index = getQuestionIndex(activeQuestion);
    questions[index].components = components;
    setQuestions(questions);
  }

  const exitAndSave = () => {
    saveBrick();
    history.push('/build');
  }

  const renderBuildQuestion = () => {
    return (
      <BuildQuestionComponent
        brickId={brickId}
        history={history}
        question={activeQuestion}
        getQuestionIndex={getQuestionIndex}
        setQuestion={setQuestion}
        toggleLock={toggleLock}
        locked={locked}
        updateComponents={updateComponents}
        setQuestionType={convertQuestionTypes}
        setPreviousQuestion={setPreviousQuestion}
        nextOrNewQuestion={setNextQuestion}
        saveBrick={saveBrick}
      />
    );
  };

  const renderQuestionComponent = () => {
    return (
      <QuestionTypePage
        history={history}
        brickId={brickId}
        questionId={activeQuestion.id}
        setQuestionType={setQuestionTypeAndMove}
        setPreviousQuestion={setPreviousQuestion}
        questionType={activeQuestion.type}
      />
    );
  };

  return (
    <div className="investigation-build-page">
      <Hidden only={['xs', 'sm']}>
        <div className="exit-button" onClick={exitAndSave}>
          <div>
            <div className="exit-label">
              <div className="exit-arrow">
                <ArrowBackIosIcon/>
              </div>
              EXIT
            </div>
            <div className="small-label">SAVE</div>
            <div className="small-label">CHANGES</div>
          </div>
        </div>
      </Hidden>
      <Grid
        container direction="row"
        alignItems="center"
        style={{ height: "100%" }}
      >
        <Grid
          container
          item xs={12} sm={12} md={7} lg={8}
          alignItems="center"
          style={{ height: "100%" }}
          className="question-container"
        >
          <Grid
            container direction="row"
            justify="center" alignItems="center"
            style={{ height: "100%" }}
          >
            <Grid
              container
              item xs={12} sm={12} md={12} lg={9}
              style={{ height: "90%" }}
            >
              <DragableTabs
                setQuestions={setQuestions}
                questions={questions}
                createNewQuestion={createNewQuestion}
                selectQuestion={selectQuestion}
                removeQuestion={removeQuestion}
              />
              <Switch>
                <Route exac path="/build/brick/:brickId/build/investigation/question-component">
                  {renderBuildQuestion}
                </Route>
                <Route exac path="/build/brick/:brickId/build/investigation/question-component/:questionId">
                  {renderBuildQuestion}
                </Route>
                <Route exec path="/build/brick/:brickId/build/investigation/question/:questionId">
                  {renderQuestionComponent}
                </Route>
                <Route exec path="/build/brick/:brickId/build/investigation/question">
                  {renderQuestionComponent}
                </Route>
              </Switch>
            </Grid>
          </Grid>
        </Grid>
        <PhonePreview link={window.location.origin + "/logo-page"} />
      </Grid>
    </div>
  );
};

const mapState = (state: any) => {
  return {
    bricks: state.bricks.bricks,
    brick: state.brick.brick
  };
};

const mapDispatch = (dispatch: any) => {
  return {
    fetchBrick: (brickId: number) => dispatch(actions.fetchBrick(brickId)),
    saveBrick: (brick: any) => dispatch(actions.saveBrick(brick))
  };
};

const connector = connect(mapState, mapDispatch);

export default connector(InvestigationBuildPage);
