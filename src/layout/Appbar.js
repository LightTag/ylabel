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

export const YLabelAppbar =() => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="static" >

      
        <Toolbar>
        <Avatar
          src={process.env.PUBLIC_URL + '/img/logo.png'}
          title="Paella dish"
          className={classes.bigAvatar} 
        />

          <Typography align="center" variant="h6" className={classes.title}>
          <Container>
          <SearchBar />
          </Container>
          </Typography>
          
          <ResetDBModal />

        </Toolbar>
      </AppBar>
    </div>
  );
}
