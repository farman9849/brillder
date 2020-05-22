import React, { useEffect } from "react";
import { Route } from 'react-router-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
// @ts-ignore
import { connect } from 'react-redux';

import actions from '../../../redux/actions/brickActions';
import './Proposal.scss';
import SubjectPage from './questionnaire/subject/Subject';
import BrickTitle from './questionnaire/brickTitle/brickTitle';
import OpenQuestion from './questionnaire/openQuestion/openQuestion';
import BrickLength, { BrickLengthEnum } from './questionnaire/brickLength/brickLength';
import Brief from './questionnaire/brief/brief';
import Prep from './questionnaire/prep/prep';
import ProposalReview from './questionnaire/proposalReview/ProposalReview';
import { Brick, Author } from "model/brick";
import { User } from "model/user";


interface ProposalProps {
  brick: Brick;
  user: User;
  saveBrick(brick: Brick): void;
  createBrick(brick: Brick): void;
  history: any;
}

const Proposal: React.FC<ProposalProps> = ({brick, history, ...props}) => {
  let subjectId = 0;
  if (props.user.subjects.length === 1) {
    subjectId = props.user.subjects[0].id;
  }
  let initState = {
    subjectId,
    brickLength: 0,
    topic: '',
    subTopic: '',
    alternativeTopics: '',
    title: '',
    openQuestion: '',
    brief: '',
    prep: '',
    synthesis: '',
    alternativeSubject: '',
  } as Brick;

  if (props.user) {
    initState.author = (props.user as any) as Author;
  }

  if (brick) {
    initState = brick;
  }

  const [state, setBrick] = React.useState(initState);
  const [saved, setSaved] = React.useState(false);

  useEffect(() => {
    if (brick) {
      if (!brick.author && state.author) {
        brick.author = state.author;
      }
      setBrick(brick);
    }
  }, [brick, state.author]);

  const setLocalProposal = (data: any) => {
    localStorage.setItem('proposal', JSON.stringify(data));
  }

  const saveLocalState = (data: any) => {
    setBrick(data);
    setLocalProposal(data);
  }

  const setSubject = (subjectId: number) => {
    saveLocalState({...state, subjectId});
  }

  const setTitles = (titles: any) => {
    saveLocalState({ ...state, ...titles });
  }

  const setOpenQuestion = (openQuestion: string) => {
    saveLocalState({ ...state, openQuestion } as Brick);
  }

  const setBrief = (brief: string) => {
    saveLocalState({ ...state, brief } as Brick)
  }

  const setPrep = (prep: string) => {
    saveLocalState({ ...state, prep } as Brick)
  }

  const setLength = (brickLength: BrickLengthEnum) => {
    let brick = { ...state, brickLength } as Brick;
    saveLocalState(brick);
    return brick;
  }

  const setLengthAndSave = (brickLength: number) => {
    let brick = setLength(brickLength);
    saveBrick(brick);
  }

  const saveBrick = (tempBrick: Brick) => {
    if (tempBrick.id) {
      props.saveBrick(tempBrick);
    } else if (brick && brick.id) {
      tempBrick.id = brick.id;
      props.saveBrick(tempBrick);
    } else {
      props.createBrick(tempBrick);
    }
  }

  const saveAndMove = () => {
    saveBrick(state);
    setSaved(true);
  }

  if (saved) {
    history.push(`/build/brick/${brick.id}/build/investigation/question`);
  }

  return (
    <MuiThemeProvider>
      <div style={{ width: '100%', height: '100%' }}>
        <Route path='/build/new-brick/subject'>
          <SubjectPage subjects={props.user.subjects} subjectId={''} saveSubject={setSubject} />
        </Route>
        <Route path='/build/new-brick/brick-title'>
          <BrickTitle parentState={state} saveTitles={setTitles} />
        </Route>
        <Route path='/build/new-brick/open-question'>
          <OpenQuestion selectedQuestion={state.openQuestion} saveOpenQuestion={setOpenQuestion} />
        </Route>
        <Route path='/build/new-brick/brief'>
          <Brief parentBrief={state.brief} saveBrief={setBrief} />
        </Route>
        <Route path='/build/new-brick/prep'>
          <Prep parentPrep={state.prep} savePrep={setPrep} />
        </Route>
        <Route path='/build/new-brick/length'>
          <BrickLength length={state.brickLength} saveLength={setLength} saveBrick={setLengthAndSave} />
        </Route>
        <Route path="/build/new-brick/proposal">
          <ProposalReview brick={state} user={props.user} saveBrick={saveAndMove} />
        </Route>
      </div>
    </MuiThemeProvider>
  );
}

const mapState = (state: any) => {
  return {
    user: state.user.user,
    brick: state.brick.brick,
  }
};

const mapDispatch = (dispatch: any) => {
  return {
    fetchBrick: (brickId: number) => dispatch(actions.fetchBrick(brickId)),
    saveBrick: (brick: any) => dispatch(actions.saveBrick(brick)),
    createBrick: (brick: any) => dispatch(actions.createBrick(brick)),
  }
};

const connector = connect(mapState, mapDispatch);

export default connector(Proposal);
