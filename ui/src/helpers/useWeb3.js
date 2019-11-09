import React from 'react';
import useInterval from 'react-useinterval';

export default function useWeb3(opts) {
    if (!opts) opts = {};

    let [state, setState] = React.useState({ status: 'LOADING', });
    let initedRef = React.useRef();

    let determineStatus; determineStatus = async () => {
        let getAccount = () => {
            let address = window.web3.eth.accounts[0].toLowerCase();
            return { address, };
        };

        let installState = (status, extra) => {
            let networkId = window.web3 && window.web3.version ? parseInt(window.web3.version.network) : undefined;
            if (isNaN(networkId)) networkId = opts.defaultNetworkId;

            if (status === 'READY') {
                let account = getAccount();
                if (status !== state.status || JSON.stringify(account) !== JSON.stringify(state.account)) {
                    setState({ status, networkId, account, ...extra, });
                }
            } else {
                if (status !== state.status) {
                    setState({ status, networkId, ...extra, });
                }
            }
        };

        if (!window.web3) return installState('NO_WEB3');

        if (window.web3.eth.accounts.length > 0) return installState('READY');

        if (window.ethereum) {
            let enable = async () => {
                try {
                    await window.ethereum.enable();
                } catch(e) {
                    if (opts.onEnableError) opts.onEnableError(e);
                    else console.log("Enable error: " + e);
                }

                determineStatus();
            };

            if (window.ethereum._metamask) {
                let isUnlocked = await window.ethereum._metamask.isUnlocked();
                if (!isUnlocked) return installState('LOCKED', { enable, });

                let isApproved = await window.ethereum._metamask.isApproved();
                if (!isApproved) return installState('NOT_APPROVED', { enable, });

                await enable();
            } else {
                // Non-metamask dApp browsers: assume LOCKED
                return installState('LOCKED', { enable, });
            }
        } else {
            // dApp browsers without window.ethereum, such as old versions of metamask: assume LOCKED
            return installState('LOCKED');
        }
    };

    if (!initedRef.current) {
        initedRef.current = true;
        determineStatus();
    }

    useInterval(determineStatus, opts.refreshInterval || 1000);

    return state;
}
