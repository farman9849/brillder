import { storiesOf } from '@storybook/react';
import * as React from 'react';
import Equation from "./Equation";

storiesOf("QuestionComponent", module)
  .add("Equation", () => <Equation  index={1} data={null} updateComponent={() => {}} />);
