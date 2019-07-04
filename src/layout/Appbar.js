import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { ResetDBModal } from '../data/components/input/resetDBModal';
import { CardMedia, Avatar, Container } from '@material-ui/core';
import { SearchBar } from '../data/components/searchBar';
import { DataInputDialog } from '../data/components/input/inputDialog';
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
          <DataInputDialog />
          <ResetDBModal />

        </Toolbar>
      </AppBar>
  );
}
