import React, { Component } from 'react';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { Chart } from 'react-chartjs-2';
import { ThemeProvider } from '@material-ui/styles';
import validate from 'validate.js';

import WSClient from './helpers/WSClient';
import { chartjs } from './helpers';
import * as Context from './helpers/Context.js'; 
import theme from './theme';
import 'react-perfect-scrollbar/dist/css/styles.css';
import './assets/scss/index.scss';
import validators from './common/validators';
import Routes from './Routes';

const browserHistory = createBrowserHistory();

Chart.helpers.extend(Chart.elements.Rectangle.prototype, {
  draw: chartjs.draw
});

validate.validators = {
  ...validate.validators,
  ...validators
};



function useWSClient() {
    let endpoint = 'ws://172.31.204.110:9777';

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
    let client = useWSClient();

    return (
      <Context.WSClientContext.Provider value={client}>
        <ThemeProvider theme={theme}>
          <Router history={browserHistory}>
            <Routes />
          </Router>
        </ThemeProvider>
      </Context.WSClientContext.Provider>
    );
};
