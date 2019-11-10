import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import { Box, List, ListItem, ListItemText, Link } from '@material-ui/core';
import Blockies from 'react-blockies';
import * as Context from '../../../../helpers/Context.js';

const useStyles = makeStyles(theme => ({
  root: {
    maxWidth: 360,
    alignItems: 'center',
    display: 'flex'
  },
  eth_address: {
    lineHeight: '24px',
    fontSize: '20px',

  },
  blockie: {
    verticalAlign: 'middle',
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
  },
  del: {
    marginLeft: theme.spacing(3),
  },
  item: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
    margin: theme.spacing(1),
    border: '1px solid gray',
    borderRadius: '10px',
  },
  itemText: {
  }
}));

const ViewItem = props => {
  const { className, style } = props;

  const classes = useStyles();

  let displayedValue = React.useContext(Context.DisplayedValue);
  let wsClient = React.useContext(Context.WSClientContext);
  let tracking = React.useContext(Context.CurrentTracking);

  function generate(element) {
    return [0, 1, 2].map(value =>
      React.cloneElement(element, {
        key: value,
      }),
    );
  }

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
        source = <button className={classes.del} onClick={doDelete}>Delete</button>;
      }



      if (item.type === 'url') {
        values.push(<ListItem className={classes.item}><Link href={item.val}><ListItemText className={classes.itemText} primary={item.val} /></Link>{source}</ListItem>);
      } else if (item.type == 'eth_address') {
        values.push(<ListItem className={classes.item}><Link href={"https://etherscan.io/address/" + item.val}><ListItemText className={classes.itemText} primary={item.val} /><Blockies className={classes.blockie} seed={item.val} size={20} scale={3} /></Link>{source}</ListItem>);
      } else {
        values.push(<ListItem className={classes.item}><ListItemText className={classes.itemText} primary={item.val}/>{source}</ListItem>);
      }
    }
  }

  return (
    <Box
      className={clsx(classes.root, className)}
      style={style}
    >
    <List dense={false}>
      {values}
    </List>
    </Box>
  );
};

ViewItem.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object
};

export default ViewItem;
