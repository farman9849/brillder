import React from 'react'
import DocumentWirisCKEditor from 'components/baseComponents/ckeditor/DocumentWirisEditor';

import './SynthesisPage.scss';
import { Grid } from '@material-ui/core';
import CommentPanel from 'components/baseComponents/comments/CommentPanel';
import { CommentLocation } from "model/comments";
import { ReduxCombinedState } from 'redux/reducers';
import { connect } from 'react-redux';
import { Brick } from 'model/brick';


export interface SynthesisProps {
  currentBrick: Brick;
  locked: boolean;
  editOnly: boolean;
  synthesis: string;
  onSynthesisChange(text: string): void
}

interface SynthesisState {
  synthesis: string;
}

class SynthesisPage extends React.Component<SynthesisProps, SynthesisState> {
  constructor(props: SynthesisProps) {
    super(props);
    this.state = {
      synthesis: props.synthesis
    }
  }

  UNSAFE_componentWillReceiveProps(props: SynthesisProps) {
    if (props.locked) {
      this.setState({ ...this.state, synthesis: props.synthesis });
    }
  }

  onSynthesisChange(text: string) {
    this.setState({ synthesis: text });
    this.props.onSynthesisChange(text);
  }

  render() {
    return (
      <div className="question-type synthesis-page">
        <div className="inner-question-type">
          <Grid container direction="row" alignItems="stretch">
            <Grid item xs className="synthesis-input-container">
              <DocumentWirisCKEditor
                disabled={this.props.locked}
                editOnly={this.props.editOnly}
                data={this.state.synthesis}
                placeholder=""
                toolbar={[
                  'bold', 'italic', 'fontColor',
                  'superscript', 'subscript', 'strikethrough',
                  'mathType', 'chemType', 'insertTable', 'alignment',
                  'bulletedList', 'numberedList', 'uploadImageCustom', 'addComment'
                ]}
                blockQuote={true}
                defaultAlignment="justify"
                onBlur={() => { }}
                onChange={this.onSynthesisChange.bind(this)}
              />
            </Grid>
            <Grid className="comment-panel-container" item>
              <CommentPanel
                currentLocation={CommentLocation.Synthesis}
                currentBrick={this.props.currentBrick}
              />
            </Grid>
          </Grid>
        </div>
      </div>
    );
  }
}

const mapState = (state: ReduxCombinedState) => ({
  currentBrick: state.brick.brick
});

const connector = connect(mapState);

export default connector(SynthesisPage);
