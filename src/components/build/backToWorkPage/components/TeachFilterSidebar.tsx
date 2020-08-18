import React, { Component } from "react";
import { Grid, FormControlLabel, Radio } from "@material-ui/core";

import { TeachClassroom, } from "model/classroom";
import { SortBy, Filters, TeachFilters } from '../model';
import sprite from "assets/img/icons-sprite.svg";

enum TeachFilterFields {
  Assigned = 'assigned',
  Submitted = 'submitted',
  Completed = 'completed'
}

interface FilterSidebarProps {
  classrooms: TeachClassroom[];
  setActiveClassroom(id: number): void;
  filterChanged(filters: TeachFilters): void;
}

interface FilterSidebarState {
  activeClassroom: TeachClassroom | null;
  filterExpanded: boolean;
  filters: TeachFilters;
  isClearFilter: boolean;
}

class TeachFilterSidebar extends Component<FilterSidebarProps, FilterSidebarState> {
  constructor(props: FilterSidebarProps) {
    super(props);
    this.state = {
      activeClassroom: null,
      filterExpanded: true,
      isClearFilter: false,
      filters: {
        assigned: false,
        submitted: false,
        completed: false
      }
    };
  }

  hideFilter() { this.setState({ ...this.state, filterExpanded: false }); }
  expandFilter() { this.setState({ ...this.state, filterExpanded: true }); }

  clearStatus() {
    const { filters } = this.state;
    filters.assigned = false;
    filters.completed = false;
    filters.submitted = false;
    this.filterClear(filters);
    this.props.filterChanged(filters);
  }

  filterClear(filters: TeachFilters) {
    if (filters.assigned || filters.completed || filters.submitted) {
      this.setState({ isClearFilter: true, filters });
    } else {
      this.setState({ isClearFilter: false, filters });
    }
  }

  toggleFilter(filter: TeachFilterFields) {
    const { filters } = this.state;
    filters[filter] = !filters[filter];
    this.filterClear(filters);
    this.props.filterChanged(filters);
  }

  removeClassrooms() {
    const { classrooms } = this.props;
    for (let classroom of classrooms) {
      classroom.active = false;
    }
    this.setState({ activeClassroom: null });
  }

  activateClassroom(activeClassroom: TeachClassroom) {
    const { classrooms } = this.props;
    for (let classroom of classrooms) {
      classroom.active = false;
    }
    activeClassroom.active = true;
    this.setState({ activeClassroom });
  }

  renderClassroom(c: TeachClassroom, i: number) {
    return (
      <div key={i} className="classes-box">
        <div className={"index-box " + (c.active ? "active" : "")} onClick={() => this.activateClassroom(c)}>
          <span className="classroom-name">{c.name}</span>
          <svg className="svg active arrow-right">
            {/*eslint-disable-next-line*/}
            <use href={sprite + (c.active ? "#arrow-down" : "#arrow-right")} />
          </svg>
          <div className="right-index">
            {c.students.length}
            <svg className="svg active">
              {/*eslint-disable-next-line*/}
              <use href={sprite + "#users"} />
            </svg>
            <div className="white-box">
              {0}
            </div>
          </div>
        </div>
        {c.active ? c.students.map((s, i2) =>
          <div className="student-row" key={i2}><span className="student-name">{s.firstName} {s.lastName}</span></div>
        ) : ""}
      </div>
    );
  }

  renderClassesBox() {
    let totalCount = 0;
    for (let classroom of this.props.classrooms) {
      totalCount += classroom.students.length;
    }
    return (
      <div className="sort-box">
        <div className="filter-container sort-by-box" style={{ paddingTop: '4vh', paddingBottom: '0.5vh' }}>
          <div className="sort-header">CLASSES</div>
        </div>
        <div className="filter-container indexes-box classrooms-filter">
          <div
            className={"index-box " + (!this.state.activeClassroom ? "active" : "")}
            onClick={() => this.removeClassrooms()}
          >
            View All Classes
            <div className="right-index">
              {totalCount}
              <svg className="svg active">
                {/*eslint-disable-next-line*/}
                <use href={sprite + "#users"} />
              </svg>
              <div className="white-box">
                {0}
              </div>
            </div>
          </div>
          {this.props.classrooms.map(this.renderClassroom.bind(this))}
        </div>
      </div>
    );
  };

  renderFilterBox = () => {
    return (
      <div className="sort-box" style={{ marginTop: '1vh' }}>
        <div className="filter-header">
          Filter
          <button
            className={
              "btn-transparent filter-icon " +
              (this.state.filterExpanded
                ? this.state.isClearFilter
                  ? "arrow-cancel"
                  : "arrow-down"
                : "arrow-up")
            }
            onClick={() => {
              this.state.filterExpanded
                ? this.state.isClearFilter
                  ? this.clearStatus()
                  : (this.hideFilter())
                : (this.expandFilter())
            }}>
          </button>
        </div>
        {this.state.filterExpanded === true ? (
          <div className="filter-container subject-indexes-box" style={{ marginTop: '1vh' }}>
            <div className="index-box color1">
              <FormControlLabel
                checked={this.state.filters.assigned}
                control={<Radio onClick={() => this.toggleFilter(TeachFilterFields.Assigned)} className={"filter-radio custom-color"} />}
                label="Assigned to class or Student" />
              <div className="right-index">{0}</div>
            </div>
            <div className="index-box color2">
              <FormControlLabel
                checked={this.state.filters.submitted}
                control={
                  <Radio onClick={() => this.toggleFilter(TeachFilterFields.Submitted)} className={"filter-radio custom-color"} />
                }
                label="Submitted" />
              <div className="right-index">{0}</div>
            </div>
            <div className="index-box color4">
              <FormControlLabel
                checked={this.state.filters.completed}
                control={
                  <Radio onClick={e => this.toggleFilter(TeachFilterFields.Completed)} className={"filter-radio custom-color"} />
                }
                label="Completed" />
              <div className="right-index">{0}</div>
            </div>
          </div>
        ) : (
            ""
          )}
      </div>
    );
  };

  render() {
    return (
      <Grid container item xs={3} className="sort-and-filter-container">
        {this.renderClassesBox()}
        {this.renderFilterBox()}
      </Grid>
    );
  }
}

export default TeachFilterSidebar;
