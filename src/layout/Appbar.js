import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  bigAvatar: {
    margin: 10,
    width: 120,
    height: 60,
  },

}));

export const YLabelAppbar =(props) => {
  const classes = useStyles();

  return (
      <AppBar position="static" className={props.rootClass}>

      
        <Toolbar>

          <Typography align="left" variant="h6" className={classes.title}>
            Why Label When You Can Search ? 
          </Typography>

        </Toolbar>
      </AppBar>
  );
}
