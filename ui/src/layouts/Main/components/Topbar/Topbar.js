import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { AppBar, Toolbar, Hidden, IconButton, TextField } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import Blockies from 'react-blockies';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import CloudDoneIcon from '@material-ui/icons/CloudDone';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import {ethers} from 'ethers';

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
    width: 450,
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

  let doSave = async () => {
    if (web3.status === 'NO_WEB3') {
      setErrorMsg("Please install metamask");
    } else if (web3.status === 'NOT_APPROVED' || web3.status === 'LOCKED') {
      await web3.enable();
    } else if (web3.status === 'READY') {
      let abi = [ 'function register(bytes32 content)', ];
      let provider = new ethers.providers.Web3Provider(window.web3.currentProvider);
      let contractAddress = '0x7b0343d9EEBEbA4D79bC07D49941998f8b8E1500';
      let contract = new ethers.Contract(contractAddress, abi, provider.getSigner());

      tracking.update({ addr: web3.account.address, })

      let tx = await contract.register(tracking.curr.zoneHash);
      console.log("TX", tx);
      let txResult = await tx.wait();
      console.log("TXRESULT", txResult);
    }
  };


  let trackingIndicator;

  if (tracking.curr.addr) {
    let loadingStatus;

    if (tracking.curr.zoneHash) {
      loadingStatus = <span className="good"><CloudDoneIcon fontSize="large" /></span>;
    } else {
      loadingStatus = <span className="alert"><HourglassEmptyIcon fontSize="large" /></span>;
    }

    trackingIndicator = <div className="bar">{loadingStatus}<Blockies seed={tracking.curr.addr.toLowerCase()} size={10} scale={3} /></div>;
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

          <TextField className={classes.textField} label="Tracking Address" margin="normal" InputProps={{ className: classes.input }} variant="outlined" onChange={(e) => tracking.update({ addr: e.target.value, })} value={tracking.curr.addr || ''}>
          </TextField>
        </Hidden>
        <Hidden lgUp>
          <IconButton
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
