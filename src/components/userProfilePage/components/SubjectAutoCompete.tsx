import React, { Component } from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import actions from 'redux/actions/requestFailed';
import { connect } from 'react-redux';

import { Subject } from 'model/brick';


interface SubjectAutoCompleteProps {
  subjects: Subject[];
  selected: Subject[];
  onSubjectChange(subjects: any[]): void;
  requestFailed(e: string): void;
}

interface SubjectAutoCompleteState {
  subjects: Subject[];
  selected: Subject[];
  autoCompleteOpen: boolean;
}

class SubjectAutoComplete extends Component<SubjectAutoCompleteProps, SubjectAutoCompleteState> {
  constructor(props: SubjectAutoCompleteProps) {
    super(props)
    let selectedSubjects:Subject[] = [];

    if (this.props.selected) {
      selectedSubjects = this.props.selected;
    }

    this.state = {
      subjects: props.subjects,
      selected: selectedSubjects,
      autoCompleteOpen: false,
    };
  }

  onSubjectChange(e: any, newValue: any[]) {
    this.setState({...this.state, selected: newValue});
    this.props.onSubjectChange(newValue);
  }

  onSubjectInput(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const {value} = event.target;

    if (value && value.length >= 2) {
      this.setState({...this.state, autoCompleteOpen: true});
    } else {
      this.setState({...this.state, autoCompleteOpen: false});
    }
  }

  hide() {
    this.setState({...this.state, autoCompleteOpen: false});
  }

  render() {
    return (
      <div className="big-input-container">
        <Autocomplete
          multiple
          open={this.state.autoCompleteOpen}
          value={this.state.selected}
          options={this.state.subjects}
          onChange={(e:any, v: any) => this.onSubjectChange(e, v)}
          getOptionLabel={(option:any) => option.name}
          renderInput={(params:any) => (
            <TextField
              onBlur={() => this.hide()}
              {...params}
              onChange={(e) => this.onSubjectInput(e)}
              variant="standard"
              label="Subjects: "
              placeholder="Subjects"
            />
          )}
        />
      </div>
    );
  }
}

const mapDispatch = (dispatch: any) => ({
  requestFailed: (e: string) => dispatch(actions.requestFailed(e)),
})

const connector = connect(null, mapDispatch);

export default connector(SubjectAutoComplete);
