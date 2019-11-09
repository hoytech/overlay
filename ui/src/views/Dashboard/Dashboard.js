import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Box } from '@material-ui/core';
import { CreateItem, ViewItem } from './components';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2)
  }
}));


const Dashboard = props => {

  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Box>
        <CreateItem/>
        <ViewItem/>
      </Box>
    </div>
  );
};

export default Dashboard;
