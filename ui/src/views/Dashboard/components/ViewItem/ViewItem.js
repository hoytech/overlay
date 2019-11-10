import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import { Box } from '@material-ui/core';
import Blockies from 'react-blockies';
import * as Context from '../../../../helpers/Context.js';

const useStyles = makeStyles(theme => ({
  root: {
    borderRadius: '4px',
    alignItems: 'center',
    padding: theme.spacing(2),
    margin: theme.spacing(1),
    display: 'flex'
  },
  list: {
    listStyleType: 'none',
  },
  eth_address: {
    lineHeight: '24px',
    fontSize: '20px',

  },
  blockie: {
    verticalAlign: 'middle',
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
  }
}));

const ViewItem = props => {
  const { className, style } = props;

  const classes = useStyles();

  let displayedValue = React.useContext(Context.DisplayedValue);
  let wsClient = React.useContext(Context.WSClientContext);
  let tracking = React.useContext(Context.CurrentTracking);

  let values = [];
  if (displayedValue.displayedValue && displayedValue.displayedValue.vals.length > 0) {
    for (let i = 0; i < displayedValue.displayedValue.vals.length; i++) {
      let item = displayedValue.displayedValue.vals[i].val;
      let source = displayedValue.displayedValue.vals[i].source;

      let doDelete = async () => {
        console.log("k = ", displayedValue.displayedValue.key);
        console.log("v = ", displayedValue.displayedValue.vals[i].val);
        let args = { cmd: "add-zone", items: [{key: displayedValue.displayedValue.key, val: displayedValue.displayedValue.vals[i].val, del: 1}]};

        if (tracking.curr.zoneHash) args.base = tracking.curr.zoneHash;

        wsClient.send(args, (err, val) => {
          tracking.update({ zoneHash: val.zoneHash, });
        });
      };

      if (source) {
        source = <Blockies className={classes.blockie} seed={source.addr} size={10} scale={3} />;
      } else {
        source = <button onClick={doDelete}>Delete</button>;
      }

      if (item.type === 'url') {
        values.push(<li key={i}><a href={item.val}>{item.val}</a>{source}</li>);
      } else if (item.type == 'eth_address') {
        values.push(<li className={classes.eth_address} key={i}><a href={"https://etherscan.io/address/" + item.val}><Blockies className={classes.blockie} seed={item.val} size={20} scale={3} />{item.val}</a>{source}</li>);
      } else {
        values.push(<li key={i}>{item.val}{source}</li>);
      }
    }
  }

  return (
    <Box
      className={clsx(classes.root, className)}
      style={style}
    >
    <ul className={classes.list}>
      {values}
    </ul>
    </Box>
  );
};

ViewItem.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object
};

export default ViewItem;
