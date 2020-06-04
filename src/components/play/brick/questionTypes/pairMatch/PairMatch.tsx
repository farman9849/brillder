import React from 'react';
import { ReactSortable } from 'react-sortablejs';
import { Grid } from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import './PairMatch.scss';
import CompComponent from '../Comp';
import {ComponentAttempt} from 'components/play/brick/model/model';
import ReviewGlobalHint from '../../baseComponents/ReviewGlobalHint';
import DenimCrossRect from 'components/play/components/DenimCrossRect';
import DenimTickRect from 'components/play/components/DenimTickRect';
import {QuestionValueType} from 'components/build/investigationBuildPage/buildQuestions/questionTypes/types';
import {Answer} from 'components/build/investigationBuildPage/buildQuestions/questionTypes/pairMatchBuild/types';
import { PairMatchProps, PairMatchState } from './interface';
import {mark} from './service';
import MathInHtml from '../../baseComponents/MathInHtml';


class PairMatch extends CompComponent<PairMatchProps, PairMatchState> {
  constructor(props: PairMatchProps) {
    super(props);

    const {component} = props;
    if (props.isPreview === true) {
      this.state = {
        userAnswers: component.list ? component.list : [],
      };
    } else {
      this.state = {
        userAnswers: component.choices ? component.choices : [],
      };
    }
  }

  componentWillUpdate(props: PairMatchProps) {
    if (props.isPreview === true && props.component) {
      if (this.state.userAnswers !== props.component.list) {
        this.setState({userAnswers: props.component.list});
      }
    }
  }

  setUserAnswers(userAnswers: any[]) {
    this.setState({ userAnswers });
  }

  getAnswer(): any[] {
    return this.state.userAnswers;
  }

  getState(entry: number): number {
    if (this.props.attempt?.answer[entry]) {
      if (
        this.props.attempt.answer[entry].toLowerCase().replace(/ /g, '') ===
        this.props.component.list[entry].value.toLowerCase().replace(/ /g, '')
      ) {
        return 1;
      } else { return -1; }
    } else { return 0; }
  }

  mark(attempt: ComponentAttempt, prev: ComponentAttempt): ComponentAttempt {
    return mark(this.props.component.list, attempt, prev);
  }

  renderIcon(index: number) {
    if (this.props.attempt) {
      return (
        <ListItemIcon>
          {
            (this.props.attempt.answer[index].index === index) ? <DenimTickRect/> : <DenimCrossRect />
          }
        </ListItemIcon>
      );
    }
    return "";
  }

  renderOption(answer: Answer) {
    if (answer.optionType && answer.optionType === QuestionValueType.Image) {
      return <img alt="" src={`${process.env.REACT_APP_BACKEND_HOST}/files/${answer.optionFile}`} />;
    }
    return <MathInHtml value={answer.option} />;
  }

  renderAnswer(answer: Answer) {
    if (answer.answerType && answer.answerType === QuestionValueType.Image) {
      return <img alt="" src={`${process.env.REACT_APP_BACKEND_HOST}/files/${answer.valueFile}`} />;
    } else {
      return (
        <div
          className="MuiListItemText-root"
          style={{width: '100%', textAlign: 'center'}}
        >
          <MathInHtml value={answer.value} />
        </div>
      );
    }
  }

  render() {
    return (
      <div className="pair-match-play">
        <Grid container justify="center">
          <List style={{padding: 0}} className="answers-list">
          {
            this.props.component.list.map((item:any, i) => (
              <ListItem
                key={i}
                className={
                  `pair-match-play-option ${(item.optionType === QuestionValueType.Image || item.answerType === QuestionValueType.Image)
                    ? "pair-match-image-choice" : ""}`
                }
              >
                {this.renderIcon(i)}
                <div className="option-container">
                  <div className="MuiListItemText-root">
                    {this.renderOption(item as any)}
                  </div>
                </div>
              </ListItem>
            ))
          }
          </List>
          <ReactSortable
            list={this.state.userAnswers}
            animation={150}
            group={{ name: "cloning-group-name" }}
            className="answers-list"
            setList={(choices) => this.setUserAnswers(choices)}
          >
            {
              this.state.userAnswers.map((answer, i) => (
                <div key={i} className="pair-match-play-choice">
                  <div className="MuiListItem-root" style={{height: '100%', textAlign: 'center'}}>
                    {this.renderAnswer(answer)}
                  </div>
                </div>
              ))
            }
          </ReactSortable>
        </Grid>
        <ReviewGlobalHint
          attempt={this.props.attempt}
          isPhonePreview={this.props.isPreview}
          hint={this.props.question.hint}
        />
      </div>
    );
  }
}

export default PairMatch;
