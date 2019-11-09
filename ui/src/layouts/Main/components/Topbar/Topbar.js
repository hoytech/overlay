import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { AppBar, Toolbar, Badge, Hidden, IconButton, TextField } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import NotificationsIcon from '@material-ui/icons/NotificationsOutlined';
import InputIcon from '@material-ui/icons/Input';
import Blockies from 'react-blockies';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import CloudDoneIcon from '@material-ui/icons/CloudDone';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';

import * as Context from '../../../../helpers/Context.js';

const useStyles = makeStyles(theme => ({
  root: {
    boxShadow: 'none'
  },
  flexGrow: {
    flexGrow: 1
  },
  signOutButton: {
    marginLeft: theme.spacing(1)
  },
  textField: {
    color: 'white',
    width: 300,
  },
  input: {
    color: 'white',
    fontWeight: 'bold'
  }
}));

const Topbar = props => {
  let tracking = React.useContext(Context.CurrentTracking);
  let web3 = React.useContext(Context.Web3);

  let [errorMsg, setErrorMsg] = React.useState(undefined);

  const { className, onSidebarOpen, ...rest } = props;

  const classes = useStyles();

  const [notifications] = useState([]);


  let doSave = async () => {
    if (web3.status === 'NO_WEB3') {
      setErrorMsg("Please install metamask");
    } else if (web3.status === 'NOT_APPROVED' || web3.status === 'LOCKED') {
      await web3.enable();
    } else if (web3.status === 'READY') {
    }
  };


  let trackingIndicator;

  if (tracking.curr.addr) {
    let loadingStatus;

    if (tracking.curr.zoneHash) {
      loadingStatus = <span className="good"><CloudDoneIcon /></span>;
    } else {
      loadingStatus = <span className="alert"><HourglassEmptyIcon /></span>;
    }

    trackingIndicator = <div className="bar">{loadingStatus}<Blockies seed={tracking.curr.addr} size={10} scale={3} /></div>;
  } else {
    if (tracking.curr.zoneHash) {
      trackingIndicator = <div className="bar">
        <span className="alert">UNSAVED<br/>CHANGES</span>
        <Button style={{ backgroundColor: 'green', color: 'white', }} onClick={doSave}>Save</Button>
      </div>;
    } else {
      trackingIndicator = <span>none</span>;
    }
  }


  return (
    <AppBar
      {...rest}
      className={clsx(classes.root, className)}
    >
      <Toolbar>
        <RouterLink to="/">
          <h2 style={{ color: 'white' }}>Overlay Namespaces</h2>
        </RouterLink>
        <div className={classes.flexGrow} />
        <Hidden mdDown>

          <span className="tracking-indicator">{trackingIndicator}</span>

          <TextField className={classes.textField} label="Track Address" margin="normal" color="inherit" InputProps={{ className: classes.input }} variant="outlined" onChange={(e) => tracking.update({ addr: e.target.value, })} value={tracking.curr.addr || ''}>
          </TextField>
        </Hidden>
        <Hidden lgUp>
          <IconButton
            color="inherit"
            onClick={onSidebarOpen}
          >
            <MenuIcon />
          </IconButton>
        </Hidden>
      </Toolbar>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        key={`asdf`}
        open={!!errorMsg}
        onClose={() => setErrorMsg(undefined)}
        message={<span id="message-id">{errorMsg}</span>}
      />
    </AppBar>
  );
};

Topbar.propTypes = {
  className: PropTypes.string,
  onSidebarOpen: PropTypes.func
};

export default Topbar;
