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
  let zoneHash = React.useContext(Context.CurrentZoneHash);

  const handleCreateItem = (path, type, value) => {
    if (!wsClient) return;

    console.log("Creating new item path=" + path + " type=" + type + " value=" + value);

    let args = { cmd: "add-zone", items: [{key: path, val: {type: value}}]};
    if (zoneHash.currentZoneHash) args.base = zoneHash.currentZoneHash;

    wsClient.send(args, (err, val) => {
      console.log(val);
      zoneHash.setCurrentZoneHash(val.zoneHash);
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
