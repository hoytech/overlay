import React from 'react';
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


async function lookupAddresses(addrs) {
    let abi = [ 'function lookup(address[] addrs) external view returns (bytes32[] memory)', ];
    let provider = ethers.getDefaultProvider('goerli');
    let contractAddress = '0x7b0343d9EEBEbA4D79bC07D49941998f8b8E1500';
    let contract = new ethers.Contract(contractAddress, abi, provider);

    let ret;

    try {
        ret = await contract.lookup(addrs);
    } catch(e) {
    }

    return ret;
}

let zoneHashCache = {};

async function getZone(wsClient, zoneHash) {
    if (zoneHashCache[zoneHash]) return zoneHashCache[zoneHash];
    let val = await wsClient.sendAsync({ cmd: 'get-zone', zoneHash, });
    zoneHashCache[zoneHash] = val.items;
    return zoneHashCache[zoneHash];
}



async function getZoneItems(wsClient, zoneHash) {
    let resolvedAddrs = {};

    let items = await getZoneItemsAux(wsClient, zoneHash, resolvedAddrs);

    items.sort((a, b) => a[0].localeCompare(b[0]));

    return items;
}

async function getZoneItemsAux(wsClient, zoneHash, resolvedAddrs) {
    let items = [];

    items = await getZone(wsClient, zoneHash);

    for (let item of (items || [])) {
      if (item[1].type === 'overlay') {
        let matches = item[1].val.match(/^(0x\w+)(.*)/);
        if (!matches) continue;

        let [, addr, path] = matches;

        if (!resolvedAddrs[addr]) {
           resolvedAddrs[addr] = (await lookupAddresses([addr]))[0];
           if (!resolvedAddrs[addr]) continue;
        }

        let subZone = await getZoneItemsAux(wsClient, resolvedAddrs[addr], resolvedAddrs);
        for (let subZoneItem of (subZone || [])) {
          if (!subZoneItem[0].startsWith(path)) continue;
          items.push([
              item[0] + subZoneItem[0].substr(path.length),
              subZoneItem[1],
              { zoneHash, addr, },
          ]);
        }
      }
    }

    return items;
}






export default function() {
    let storage = JSON.parse(window.localStorage.getItem('overlay') || "{}");

    let wsClient = useWSClient();
    let web3 = useWeb3({ defaultNetworkId: 5, }); // goerli
    let [currentTracking, setCurrentTracking] = React.useState(storage);
    let [displayedValue, setDisplayedValue] = React.useState(undefined);
    let [zoneData, setZoneData] = React.useState([]);

    let pollTrackingAddress = async () => {
        if (currentTracking.addr) {
          let zoneHashes = await lookupAddresses([currentTracking.addr]);
          if (!zoneHashes) return;
          setCurrentTracking({ addr: currentTracking.addr, zoneHash: zoneHashes[0], });
        }
    };

    let updateTracking = (tracking) => {
        window.localStorage.setItem('overlay', JSON.stringify(tracking));
        setCurrentTracking(tracking);
        setZoneData([]);
    };

    React.useEffect(() => {
        pollTrackingAddress();
        return () => {};
    }, [currentTracking.addr, currentTracking.zoneHash]);

    useInterval(pollTrackingAddress, 5000);



    let updateZoneData = async () => {
      if (!wsClient || !currentTracking.zoneHash) return;
      let items = await getZoneItems(wsClient, currentTracking.zoneHash);
      setZoneData(items);
    }

    React.useEffect(() => {
        updateZoneData();
    }, [wsClient, currentTracking.zoneHash]);



    return (
      <Context.Web3.Provider value={web3}>
      <Context.WSClientContext.Provider value={wsClient}>
      <Context.CurrentTracking.Provider value={{ curr: currentTracking, update: updateTracking, }}>
      <Context.DisplayedValue.Provider value={{ displayedValue, setDisplayedValue, }}>
      <Context.ZoneData.Provider value={zoneData}>

        <ThemeProvider theme={theme}>
          <Router history={browserHistory}>
            <Routes />
          </Router>
        </ThemeProvider>

      </Context.ZoneData.Provider>
      </Context.DisplayedValue.Provider>
      </Context.CurrentTracking.Provider>
      </Context.WSClientContext.Provider>
      </Context.Web3.Provider>
    );
};
