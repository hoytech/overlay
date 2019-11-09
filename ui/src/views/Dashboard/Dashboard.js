import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Box } from '@material-ui/core';
import { CreateItem } from './components';
import * as Context from '../../helpers/Context.js';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2)
  }
}));


const Dashboard = props => {

  const classes = useStyles();

  let wsClient = React.useContext(Context.WSClientContext);

  const handleCreateItem = (path, url) => {
    if (!wsClient) return;

    console.log("Creating new item path=" + path + " url=" + url);

    wsClient.send({ cmd: "add-zone", items: [{key: path, val: {url}}]}, (err, val) => {
      console.log(val);
    });
  };


  return (
    <div className={classes.root}>
      <Box>
        <CreateItem onCreateItem={handleCreateItem}/>
      </Box>
    </div>
  );
};

export default Dashboard;
