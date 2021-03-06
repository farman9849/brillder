import React from "react";

import { Brick } from "model/brick";
import { Grid } from "@material-ui/core";

interface TitlePageProps {
  brick: Brick;
  color: string;
}

const TitlePage: React.FC<TitlePageProps> = ({brick, color}) => {
  return (
    <div className="page1">
      <div className="flipped-page">
        <Grid container justify="center">
          <div className="circle-icon" style={{ background: color }} />
        </Grid>
        <div className="proposal-titles">
          <div className="title">{brick.title}</div>
          <div>{brick.subTopic}</div>
          <div>{brick.alternativeTopics}</div>
        </div>
      </div>
    </div>
  );
}

export default TitlePage;
