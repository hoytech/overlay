import React, { Component } from 'react';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { Chart } from 'react-chartjs-2';
import { ThemeProvider } from '@material-ui/styles';
import validate from 'validate.js';

import WSClient from './helpers/WSClient';
import useWeb3 from './helpers/useWeb3';
import { chartjs } from './helpers';
import * as Context from './helpers/Context.js'; 
import theme from './theme';
import 'react-perfect-scrollbar/dist/css/styles.css';
import './assets/scss/index.scss';
import validators from './common/validators';
import Routes from './Routes';
import useInterval from 'react-useinterval';
import {ethers} from 'ethers';

import 'antd/dist/antd.css';


const browserHistory = createBrowserHistory();

Chart.helpers.extend(Chart.elements.Rectangle.prototype, {
  draw: chartjs.draw
});

validate.validators = {
  ...validate.validators,
  ...validators
};



function useWSClient() {
    let endpoint = 'wss://logperiodic.com';

    let [client, setClient] = React.useState(null);

    React.useEffect(() => {
        if (endpoint === undefined) return;

        let o = new WSClient({ endpoint, WebSocket: window.WebSocket, });
        o.connect();
        setClient(o);

        return () => o.shutdown();
    }, [endpoint]);

    return client;
}





export default function() {
    let storage = JSON.parse(window.localStorage.getItem('overlay') || "{}");

    let client = useWSClient();
    let web3 = useWeb3({ defaultNetworkId: 5, }); // goerli
    let [currentTracking, setCurrentTracking] = React.useState(storage);
    let [displayedValue, setDisplayedValue] = React.useState(undefined);

    let pollAddress = async () => {
        if (currentTracking.addr) {
          let abi = [ 'function lookup(address[] addrs) external view returns (bytes32[] memory)', ];
          let provider = ethers.getDefaultProvider('goerli');
          let contractAddress = '0x7b0343d9EEBEbA4D79bC07D49941998f8b8E1500';
          let contract = new ethers.Contract(contractAddress, abi, provider);

          let res = await contract.lookup([currentTracking.addr]);

          setCurrentTracking({ addr: currentTracking.addr, zoneHash: res[0], });
        }
    };

    let updateTracking = (tracking) => {
        window.localStorage.setItem('overlay', JSON.stringify(tracking));
        setCurrentTracking(tracking);
    };

    React.useEffect(() => {
        pollAddress();
    }, [currentTracking.addr, currentTracking.zoneHash]);

    useInterval(pollAddress, 5000);

    return (
      <Context.Web3.Provider value={web3}>
      <Context.WSClientContext.Provider value={client}>
      <Context.CurrentTracking.Provider value={{ curr: currentTracking, update: updateTracking, }}>
      <Context.DisplayedValue.Provider value={{ displayedValue, setDisplayedValue, }}>

        <ThemeProvider theme={theme}>
          <Router history={browserHistory}>
            <Routes />
          </Router>
        </ThemeProvider>

      </Context.DisplayedValue.Provider>
      </Context.CurrentTracking.Provider>
      </Context.WSClientContext.Provider>
      </Context.Web3.Provider>
    );
};
