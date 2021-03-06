import { UserBase } from "./user";
import { Brick } from "./brick";
import { AssignmentStudent } from "./stats";

export enum ClassroomStatus {
  Disabled,
  Active,
  Deleted
}

export interface StudentStatus {
  studentId: number;
  status: number;
  numberOfAttempts: number;
  avgScore: number;
}

export interface Assignment {
  id: number;
  brick: Brick;
  deadline: string;
  assignedDate: string;

  studentStatus: StudentStatus[];
  byStatus: any;
  studentStatusCount: {
    0: number;
    1: number;
    2: number;
  }
}

export interface TeachStudent extends UserBase {
  studentResult: AssignmentStudent | undefined;
  studentStatus: StudentStatus | undefined;
}

export interface Classroom {
  id: number;
  name: string;
  created: Date;
  updated: Date;
  status: ClassroomStatus;
  students: TeachStudent[];
  teachers: UserBase[];
  creator: UserBase;
  assignments: Assignment[];
}

export interface StudentStatus {
  studentId: number;
  status: number;
}

export interface TeachClassroom extends Classroom {
  active: boolean;
  isClass?: boolean;
}
