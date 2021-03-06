import React, { Component } from "react";
import { Box, Grid, Hidden } from "@material-ui/core";
import { Category } from "./interface";
import { connect } from "react-redux";
import { Swiper, SwiperSlide } from "swiper/react";
import queryString from 'query-string';
import "swiper/swiper.scss";

import "./ViewAll.scss";
import { User } from "model/user";
import { Notification } from 'model/notifications';
import { Brick, BrickStatus } from "model/brick";
import { ReduxCombinedState } from "redux/reducers";
import { checkAdmin, getAssignmentIcon } from "components/services/brickService";
import { getCurrentUserBricks, getPublicBricks, getPublishedBricks, searchBricks, searchPublicBricks } from "services/axios/brick";
import { getSubjects } from "services/axios/subject";

import PageHeadWithMenu, { PageEnum } from "components/baseComponents/pageHeader/PageHeadWithMenu";
import FailedRequestDialog from "components/baseComponents/failedRequestDialog/FailedRequestDialog";
import DeleteBrickDialog from "components/baseComponents/deleteBrickDialog/DeleteBrickDialog";
import ShortBrickDescription from "components/baseComponents/ShortBrickDescription";
import ExpandedBrickDescription from "components/baseComponents/ExpandedBrickDescription";
import ExpandedMobileBrick from "components/baseComponents/ExpandedMobileBrickDescription";
import ViewAllFilter, { SortBy } from "./ViewAllFilter";
import ViewAllPagination from "./ViewAllPagination";
import PrivateCoreToggle from "components/baseComponents/PrivateCoreToggle";
import BrickBlock from "components/baseComponents/BrickBlock";
import SpriteIcon from "components/baseComponents/SpriteIcon";
import PageLoader from "components/baseComponents/loaders/pageLoader";


interface BricksListProps {
  user: User;
  notifications: Notification[] | null;
  history: any;
  location: any;
}

interface BricksListState {
  yourBricks: Array<Brick>;
  bricks: Array<Brick>;
  searchBricks: Array<Brick>;
  searchString: string;
  isSearching: boolean;
  sortBy: SortBy;
  subjects: any[];
  sortedIndex: number;
  finalBricks: Brick[];
  isLoading: boolean;

  dropdownShown: boolean;
  deleteDialogOpen: boolean;
  deleteBrickId: number;

  isClearFilter: any;
  failedRequest: boolean;
  pageSize: number;
  isAdmin: boolean;
  isCore: boolean;
  shown: boolean;
}

class ViewAllPage extends Component<BricksListProps, BricksListState> {
  constructor(props: BricksListProps) {
    super(props);

    let isAdmin = false;
    if (this.props.user) {
      isAdmin = checkAdmin(this.props.user.roles);
    }

    const values = queryString.parse(props.location.search)
    const searchString = values.searchString as string || '';

    this.state = {
      yourBricks: [],
      bricks: [],
      sortBy: SortBy.Date,
      subjects: [],
      sortedIndex: 0,
      deleteDialogOpen: false,
      deleteBrickId: -1,
      finalBricks: [],
      dropdownShown: false,
      searchBricks: [],
      searchString,
      isSearching: false,
      pageSize: 15,
      isLoading: true,

      isClearFilter: false,
      failedRequest: false,
      isAdmin,
      isCore: true,
      shown: false,
    };

    this.loadData(values);
  }

  // load bricks when notification come
  componentDidUpdate(prevProps: BricksListProps) {
    const {notifications} = this.props;
    const oldNotifications = prevProps.notifications;
    if (notifications && oldNotifications) {
      if (notifications.length > oldNotifications.length) {
        this.loadBricks();
      }
    }
  }

  async loadData(values: queryString.ParsedQuery<string>) {
    if (this.props.user) {
      await this.loadSubjects();
    }

    if (values.searchString) {
      this.search();
    } else if (this.props.user) {
      this.loadBricks();
    } else {
      this.setState({ ...this.state, failedRequest: true });
      // load bricks for unauthorized users
      const bricks = await getPublicBricks();
      if (bricks) {
        this.setState({ ...this.state, bricks, isLoading: false, finalBricks: bricks, shown: true });
      } else {
        this.setState({ ...this.state, isLoading: false, failedRequest: true });
      }
    }
  }

  async loadSubjects() {
    const subjects = await getSubjects();

    if(subjects) {
      subjects.sort((s1, s2) => s1.name.localeCompare(s2.name));
      this.setState({ ...this.state, subjects });
    } else {
      this.setState({ ...this.state, failedRequest: true });
    }
  }

  async loadBricks() {
    const currentBricks = await getCurrentUserBricks();
    if (currentBricks) {
      let yourBricks = currentBricks.filter(brick => brick.status === BrickStatus.Publish);
      yourBricks = yourBricks.sort((a, b) => (new Date(b.updated).getTime() < new Date(a.updated).getTime()) ? -1 : 1);
      this.setState({ ...this.state, yourBricks });
    } else {
      this.setState({ ...this.state, failedRequest: true });
    }

    const bricks = await getPublishedBricks();
    if (bricks) {
      let bs = bricks.sort((a, b) => (new Date(b.updated).getTime() < new Date(a.updated).getTime()) ? -1 : 1);
      bs = bs.sort((a, b) => (b.hasNotifications === true && new Date(b.updated).getTime() > new Date(a.updated).getTime()) ? -1 : 1);
      const finalBricks = this.filter(bs, this.state.isCore);
      this.setState({ ...this.state, bricks, isLoading: false, finalBricks, shown: true });
    } else {
      this.setState({ ...this.state, isLoading: false, failedRequest: true });
    }
  }

  delete(brickId: number) {
    let { bricks } = this.state;
    let brick = bricks.find(brick => brick.id === brickId);
    if (brick) {
      let index = bricks.indexOf(brick);
      bricks.splice(index, 1);
    }

    this.setState({ ...this.state, deleteDialogOpen: false });
  }

  move(brickId: number) {
    this.props.history.push(`/play/brick/${brickId}/intro`);
  }

  handleSortChange = (e: any) => {
    const { state } = this;
    const sortBy = parseInt(e.target.value) as SortBy;
    let { finalBricks } = this.state;
    if (sortBy === SortBy.Date) {
      finalBricks = finalBricks.sort((a, b) => {
        const createdA = new Date(a.created).getTime();
        const createdB = new Date(b.created).getTime();
        return createdA < createdB ? 1 : -1;
      });
    } else if (sortBy === SortBy.Popularity) {
      finalBricks = finalBricks.sort((a, b) =>
        a.attemptsCount > b.attemptsCount ? 1 : -1
      );
    }
    this.setState({ ...state, finalBricks, sortBy });
  };

  getCheckedSubjectIds() {
    const filterSubjects = [];
    const { state } = this;
    const { subjects } = state;
    for (let subject of subjects) {
      if (subject.checked) {
        filterSubjects.push(subject.id);
      }
    }
    return filterSubjects;
  }

  filterByCurretUser(bricks: Brick[]) {
    const userId = this.props.user.id;
    return bricks.filter(b => b.author.id === userId);
  }

  filterSearchBricks() {
    if (this.state.isCore) {
      return this.state.searchBricks.filter(b => b.isCore);
    } else {
      return this.state.searchBricks.filter(b => !b.isCore);
    }
  }

  filter(bricks: Brick[], isCore?: boolean) {
    if (this.state.isSearching) {
      bricks = this.filterSearchBricks();
    }
    let filtered: Brick[] = [];

    let filterSubjects = this.getCheckedSubjectIds();

    if (isCore) {
      bricks = bricks.filter(b => b.isCore === true);
    } else {
      bricks = bricks.filter(b => !b.isCore)
    }

    if (filterSubjects.length > 0) {
      for (let brick of bricks) {
        let res = filterSubjects.indexOf(brick.subjectId);
        if (res !== -1) {
          filtered.push(brick);
        }
      }
      return filtered;
    }
    return bricks;
  }

  //region Hide / Expand / Clear Filter
  isFilterClear() {
    return this.state.subjects.some(r => r.checked);
  }
  //endregion

  filterBySubject = (i: number) => {
    const { subjects } = this.state;
    subjects[i].checked = !subjects[i].checked;
    const finalBricks = this.filter(this.state.bricks, this.state.isCore);
    this.setState({ ...this.state, shown: false });
    setTimeout(() => {
      try {
        this.setState({ ...this.state, isClearFilter: this.isFilterClear(), finalBricks, shown: true });
      } catch {}
    }, 1400);
  };

  clearSubjects = () => {
    const { state } = this;
    const { subjects } = state;
    subjects.forEach((r: any) => (r.checked = false));
    this.setState({ ...state, isClearFilter: false });
  };

  moveAllBack() {
    let index = this.state.sortedIndex;
    if (index >= this.state.pageSize) {
      this.setState({ ...this.state, sortedIndex: index - this.state.pageSize });
    }
  }

  moveAllNext() {
    let index = this.state.sortedIndex;
    const { pageSize } = this.state;

    let bricks = this.state.bricks;
    if (this.state.isSearching) {
      bricks = this.filterSearchBricks();
    }

    if (index + pageSize <= bricks.length) {
      this.setState({ ...this.state, sortedIndex: index + this.state.pageSize });
    }
  }

  hideBricks() {
    const { finalBricks, yourBricks } = this.state;
    finalBricks.forEach(b => (b.expanded = false));
    yourBricks.forEach(b => (b.expanded = false));
  }

  yourBricksMouseHover(index: number) {
    try {
      let { yourBricks } = this.state;
      if (yourBricks[index] && yourBricks[index].expanded) return;
  
      this.hideBricks();
      this.setState({ ...this.state });
      setTimeout(() => {
        try {
          let { yourBricks } = this.state;
          this.hideBricks();
          if (!yourBricks[index].expandFinished) {
            yourBricks[index].expanded = true;
          }
          this.setState({ ...this.state });
        } catch {}
      }, 400);
    } catch {}
  }

  yourBricksMouseLeave(key: number) {
    try {
      let { yourBricks } = this.state;
      this.hideBricks();
      yourBricks[key].expandFinished = true;
      this.setState({ ...this.state });
      setTimeout(() => {
        try {
          yourBricks[key].expandFinished = false;
          this.setState({ ...this.state });
        } catch {}
      }, 400);
    } catch {}
  }

  handleMouseHover(index: number) {
    let { finalBricks } = this.state;
    if (finalBricks[index] && finalBricks[index].expanded) return;

    this.hideBricks();
    this.setState({ ...this.state });
    setTimeout(() => {
      try {
        let { finalBricks } = this.state;
        this.hideBricks();
        if (!finalBricks[index].expandFinished) {
          finalBricks[index].expanded = true;
        }
        this.setState({ ...this.state });
      } catch {}
    }, 400);
  }

  handleMobileClick(index: number) {
    let { finalBricks } = this.state;
    if (finalBricks[index].expanded === true) {
      this.hideBricks();
      this.setState({ ...this.state });
      return;
    }
    this.hideBricks();
    finalBricks[index].expanded = true;
    this.setState({ ...this.state });
  }

  handleYourMobileClick(brick: Brick) {
    this.hideBricks();
    brick.expanded = true;
    this.setState({ ...this.state });
  }

  handleMouseLeave(key: number) {
    try {
      let { finalBricks } = this.state;
      this.hideBricks();
      finalBricks[key].expandFinished = true;
      this.setState({ ...this.state });
      setTimeout(() => {
        try {
          finalBricks[key].expandFinished = false;
          this.setState({ ...this.state });
        } catch {}
      }, 400);
    } catch {}
  }

  handleDeleteOpen(deleteBrickId: number) {
    this.setState({ ...this.state, deleteDialogOpen: true, deleteBrickId });
  }

  handleDeleteClose() {
    this.setState({ ...this.state, deleteDialogOpen: false });
  }

  searching(searchString: string) {
    if (searchString.length === 0) {
      this.setState({
        ...this.state,
        searchString,
        finalBricks: this.state.bricks,
        isSearching: false,
      });
    } else {
      this.setState({ ...this.state, searchString });
    }
  }

  showDropdown() { this.setState({ ...this.state, dropdownShown: true }) }
  hideDropdown() { this.setState({ ...this.state, dropdownShown: false }) }

  async search() {
    const { searchString } = this.state;
    this.setState({shown: false});
    let bricks: Brick[] | null = [];
    if (this.props.user) {
      bricks = await searchBricks(searchString);
    } else {
      bricks = await searchPublicBricks(searchString);
    }

    setTimeout(() => {
      try {
        if (bricks) {
          this.hideBricks();
          const finalBricks = this.filter(bricks, this.state.isCore);
          this.setState({
            ...this.state,
            searchBricks: bricks,
            finalBricks,
            shown: true,
            isLoading: false,
            isSearching: true,
          });
        } else {
          this.setState({ ...this.state, isLoading: false, failedRequest: true });
        }
      } catch {
        this.setState({isLoading: false, failedRequest: true});
      }
    }, 1400);
  }

  getBrickColor(brick: Brick) {
    let color = "";

    if (!brick.subject) {
      color = "#B0B0AD";
    } else {
      color = brick.subject.color;
    }
    return color;
  }

  renderExpandedBrick(color: string, brick: Brick) {
    return (
      <ExpandedBrickDescription
        userId={this.props.user.id}
        isAdmin={this.state.isAdmin}
        searchString=""
        color={color}
        brick={brick}
        move={(brickId) => this.move(brickId)}
        onDelete={(brickId) => this.handleDeleteOpen(brickId)}
      />
    );
  }

  renderBrickContainer = (brick: Brick, key: number) => {
    let color = this.getBrickColor(brick);

    return (
      <div key={key} className="main-brick-container">
        <Box className="brick-container">
          <div
            className={`absolute-container brick-row-0 ${
              brick.expanded ? "brick-hover" : ""
              }`}
            onMouseEnter={() => this.yourBricksMouseHover(key)}
            onMouseLeave={() => this.yourBricksMouseLeave(key)}
          >
            {brick.expanded ? (
              this.renderExpandedBrick(color, brick)
            ) : (
                <ShortBrickDescription searchString="" brick={brick} />
              )}
          </div>
        </Box>
      </div>
    );
  };

  prepareVisibleBricks = (
    sortedIndex: number,
    pageSize: number,
    bricks: Brick[]
  ) => {
    let data: any[] = [];
    let count = 0;
    for (let i = 0 + sortedIndex; i < pageSize + sortedIndex; i++) {
      const brick = bricks[i];
      if (brick) {
        let row = Math.floor(count / 3);
        data.push({ brick, key: i, index: count, row });
        count++;
      }
    }
    return data;
  };

  renderSortedBricks = (bricks: Brick[]) => {
    let data = this.prepareVisibleBricks(
      this.state.sortedIndex,
      this.state.pageSize,
      bricks
    );
    return data.map(item => {
      let circleIcon = '';
      if (this.props.user) {
        circleIcon = getAssignmentIcon(item.brick);
        if (item.brick.editor?.id === this.props.user.id) {
          circleIcon = 'award';
        }
      }

      let searchString = ''
      if (this.state.isSearching) {
        searchString = this.state.searchString;
      }

      return (
        <BrickBlock
          brick={item.brick}
          index={item.index}
          row={item.row + 1}
          user={this.props.user}
          key={item.index}
          searchString={searchString}
          shown={this.state.shown}
          history={this.props.history}
          circleIcon={circleIcon}
          handleDeleteOpen={(brickId) => this.handleDeleteOpen(brickId)}
          handleMouseHover={() => this.handleMouseHover(item.key)}
          handleMouseLeave={() => this.handleMouseLeave(item.key)}
          isPlay={true}
        />
      );
    });
  };

  //region Mobile
  renderMobileExpandedBrick(brick: Brick) {
    let color = this.getBrickColor(brick);

    return (
      <ExpandedMobileBrick
        brick={brick}
        color={color}
        move={(brickId) => this.move(brickId)}
      />
    );
  }

  renderSortedMobileBrickContainer = (
    brick: Brick,
    key: number,
    row: any = 0
  ) => {
    const color = this.getBrickColor(brick);
    const circleIcon = getAssignmentIcon(brick);

    return (
      <div className="main-brick-container">
        <Box className="brick-container">
          <div
            className={`sorted-brick absolute-container brick-row-${row} ${
              brick.expanded ? "brick-hover" : ""
              }`}
            onClick={() => this.handleMobileClick(key)}
          >
            <ShortBrickDescription
              brick={brick}
              color={color}
              circleIcon={circleIcon}
              isMobile={true}
              searchString=""
              isExpanded={brick.expanded}
              move={() => this.move(brick.id)}
            />
          </div>
        </Box>
      </div>
    );
  };

  renderSortedMobileBricks = () => {
    let { sortedIndex } = this.state;
    let bricksList = [];
    for (let i = 0 + sortedIndex; i < this.state.pageSize + sortedIndex; i++) {
      const { finalBricks } = this.state;
      if (finalBricks[i]) {
        let row = Math.floor(i / 3);
        bricksList.push(
          this.renderSortedMobileBrickContainer(finalBricks[i], i, row + 1)
        );
      }
    }
    return (
      <Swiper>
        {bricksList.map((b, i) => (
          <SwiperSlide key={i} style={{ width: "90vw" }}>
            {b}
          </SwiperSlide>
        ))}
      </Swiper>
    );
  };

  renderMobileUpperBricks() {
    let expandedBrick = this.state.yourBricks.find(b => b.expanded === true);

    if (expandedBrick) {
      return this.renderMobileExpandedBrick(expandedBrick);
    }

    expandedBrick = this.state.finalBricks.find(b => b.expanded === true);

    if (expandedBrick) {
      return this.renderMobileExpandedBrick(expandedBrick);
    }

    let bricksList = [];
    for (const brick of this.state.yourBricks) {
      bricksList.push(
        <ShortBrickDescription
          brick={brick}
          searchString=""
          onClick={() => this.handleYourMobileClick(brick)}
        />
      );
    }
    return (
      <Swiper slidesPerView={2}>
        {bricksList.map((b, i) => (
          <SwiperSlide key={i} style={{ width: "50vw" }}>
            {b}
          </SwiperSlide>
        ))}
      </Swiper>
    );
  }
  //region Mobile

  renderYourBrickRow = () => {
    let bricksList = [];
    let index = 0;
    for (let i = index; i < index + 3; i++) {
      const { yourBricks } = this.state;
      if (yourBricks[i]) {
        bricksList.push(this.renderBrickContainer(yourBricks[i], i));
      }
    }
    return bricksList;
  };

  renderEmptyCategory(name: string) {
    return (
      <div className="brick-row-title">
        <button className="btn btn-transparent svgOnHover">
          <span>{name}</span>
          <SpriteIcon name="arrow-right" className="active text-theme-dark-blue" />
        </button>
      </div>
    );
  }

  renderMobileGlassIcon() {
    return (
      <div className="page-navigation">
        <div className="btn btn-transparent glasses svgOnHover">
          <SpriteIcon name="glasses" className="w100 h100 active text-theme-dark-blue" />
        </div>
        <div className="breadcrumbs">All</div>
      </div>
    );
  }

  toggleCore() {
    const isCore = !this.state.isCore;
    this.setState({ isCore, shown: false, sortedIndex: 0 });
    setTimeout(() => {
      try {
        const finalBricks = this.filter(this.state.bricks, isCore);
        this.setState({ shown: true, finalBricks, sortedIndex: 0 });
      } catch {}
    }, 1400);
  }

  renderTitle() {
    const {length} = this.state.finalBricks;
    if (length === 1) {
      return '1 Brick found';
    }
    return length + ' Bricks found';
  }

  renderMainTitle(filterSubjects: number[]) {
    if (filterSubjects.length === 1) {
      const subjectId = filterSubjects[0];
      const subject = this.state.subjects.find(s => s.id === subjectId);
      return subject.name;
    } else if (filterSubjects.length > 1) {
      return "Filtered";
    }
    return "ALL BRICKS";
  }

  renderFirstRow(filterSubjects: number[]) {
    if (this.state.isSearching && this.state.searchBricks.length === 0) {
      return (
        <div className="main-brick-container">
          <div className="centered text-theme-dark-blue title no-found">
            Sorry, no bricks found
          </div>
          <div className="create-button">
            <SpriteIcon name="trowel" />
            Create One
          </div>
          <div className="recomend-button">
            <SpriteIcon name="user-plus"/>
            Recommend a Builder
          </div>
        </div>
      );
    }
    if (this.state.isSearching || filterSubjects.length !== 0) {
      return (
        <div className="main-brick-container">
          <div className="centered text-theme-dark-blue title">
            {this.renderTitle()}
          </div>
        </div>
      );
    }
    return <div className="bricks-list">{this.renderYourBrickRow()}</div>;
  }

  render() {
    if (this.state.isLoading) {
      return <PageLoader content="...Getting Bricks..." />;
    }
    const filterSubjects = this.getCheckedSubjectIds();

    let bricks = this.state.finalBricks;
    if (this.state.isSearching) {
      bricks = this.filterSearchBricks();
    }
    const { history } = this.props;
    return (
      <div className="main-listing dashboard-page">
        {this.renderMobileGlassIcon()}
        <PageHeadWithMenu
          page={PageEnum.ViewAll}
          user={this.props.user}
          placeholder={"Search Ongoing Projects & Published Bricks…"}
          history={this.props.history}
          search={() => this.search()}
          searching={(v) => this.searching(v)}
        />
        <Hidden only={["sm", "md", "lg", "xl"]}>
          <div className="mobile-scroll-bricks">
            {this.renderMobileUpperBricks()}
          </div>
        </Hidden>
        <Grid container direction="row" className="sorted-row">
          <Grid container item xs={3} className="sort-and-filter-container">
            {this.props.user &&
            <ViewAllFilter
              sortBy={this.state.sortBy}
              subjects={this.state.subjects}
              isClearFilter={this.state.isClearFilter}
              handleSortChange={e => this.handleSortChange(e)}
              clearSubjects={() => this.clearSubjects()}
              filterBySubject={index => this.filterBySubject(index)}
            />}
          </Grid>
          <Grid item xs={9} className="brick-row-container">
            <Hidden only={["xs"]}>
              <div className="brick-row-title uppercase">
                {this.renderMainTitle(filterSubjects)}
              </div>
              {this.props.user &&
                <PrivateCoreToggle
                  isViewAll={true}
                  isCore={this.state.isCore}
                  onSwitch={() => this.toggleCore()}
                />}
            </Hidden>
            <Hidden only={["sm", "md", "lg", "xl"]}>
              <div
                className="brick-row-title"
                onClick={() => history.push(`/play/dashboard/${Category.New}`)}
              >
                <button className="btn btn-transparent svgOnHover">
                  <span>New</span>
                  <SpriteIcon name="arrow-right" className="active text-theme-dark-blue" />
                </button>
              </div>
            </Hidden>
            <div className="bricks-list-container bricks-container-mobile">
              <Hidden only={["xs"]}>
                {this.renderFirstRow(filterSubjects)}
                <div className="bricks-list">{this.renderSortedBricks(bricks)}</div>
              </Hidden>
              <Hidden only={["sm", "md", "lg", "xl"]}>
                <div className="bricks-list">{this.renderSortedMobileBricks()}</div>
              </Hidden>
            </div>
            <Hidden only={["sm", "md", "lg", "xl"]}>
              {this.renderEmptyCategory("Suggest")}
              {this.renderEmptyCategory("Top in Humanities")}
              {this.renderEmptyCategory("Top in Stem")}
            </Hidden>
            <ViewAllPagination
              pageSize={this.state.pageSize}
              sortedIndex={this.state.sortedIndex}
              bricksLength={bricks.length}
              moveAllNext={() => this.moveAllNext()}
              moveAllBack={() => this.moveAllBack()}
            />
          </Grid>
        </Grid>
        <DeleteBrickDialog
          isOpen={this.state.deleteDialogOpen}
          brickId={this.state.deleteBrickId}
          close={() => this.handleDeleteClose()}
          onDelete={(brickId) => this.delete(brickId)}
        />
        <FailedRequestDialog
          isOpen={this.state.failedRequest}
          close={() => this.setState({ ...this.state, failedRequest: false })}
        />
      </div>
    );
  }
}

const mapState = (state: ReduxCombinedState) => ({
  user: state.user.user,
  notifications: state.notifications.notifications
});

export default connect(mapState)(ViewAllPage);
