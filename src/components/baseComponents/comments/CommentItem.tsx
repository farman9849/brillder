import React from 'react';
import { Grid, Card, CardContent, Box, Typography, SvgIcon } from '@material-ui/core';

import sprite from "assets/img/icons-sprite.svg";
import { withStyles } from '@material-ui/styles';

import moment from 'moment';

interface CommentItemProps {
    text: string;
    timestamp: Date;
}

const Stretch = withStyles({
    root: {
        flexGrow: 1
    }
})(Grid);

const CommentItem: React.FC<CommentItemProps> = ({ text, timestamp }) => {
    return (
    <Grid item>
        <Box marginX={2} marginY={2} padding={2} borderRadius={15} bgcolor="#ffffff">
            <Grid container direction="column">
                <Grid item container direction="row">
                    <Stretch item>
                        <h4><b>Editor</b></h4>
                    </Stretch>
                    <SvgIcon>
                        <svg className="svg active">
                            {/*eslint-disable-next-line*/}
                            <use href={sprite + "#cancel"} />
                        </svg>
                    </SvgIcon>
                    <SvgIcon>
                        <svg className="svg active">
                            {/*eslint-disable-next-line*/}
                            <use href={sprite + "#ok"} />
                        </svg>
                    </SvgIcon>
                </Grid>
                <Grid item>
                    <h5 style={{ marginBottom: "10px" }}>{moment(timestamp).format("H:mm D MMM")}</h5>
                </Grid>
                <Grid item>
                    <b>Comment: </b><i>{text}</i>
                </Grid>
            </Grid>
        </Box>
    </Grid>
    )
};

export default CommentItem;