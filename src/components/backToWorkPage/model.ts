import { Brick } from "model/brick";
import { AssignmentBrick } from "model/assignment";


export enum ThreeColumnNames {
  Red = "red",
  Yellow = "yellow",
  Green = "green",
};

export interface BricksContent {
  rawBricks: Brick[];
  finalBricks: Brick[];
}

export interface ThreeColumns {
  red: BricksContent;
  yellow: BricksContent;
  green: BricksContent;
}

export interface AssignmentContent {
  rawAssignments: AssignmentBrick[];
  finalAssignments: AssignmentBrick[];
}

export interface ThreeAssignmentColumns {
  red: AssignmentContent;
  yellow: AssignmentContent;
  green: AssignmentContent;
}

export enum SortBy {
  None,
  Date,
  Popularity,
  Status,
}

export interface Filters {
  viewAll: boolean;
  buildAll: boolean;
  editAll: boolean;

  draft: boolean;
  review: boolean;
  publish: boolean;

  isCore: boolean;
}

export interface PlayFilters {
  completed: boolean;
  submitted: boolean;
  checked: boolean;
}

export interface TeachFilters {
  assigned: boolean;
  submitted: boolean;
  completed: boolean;
}