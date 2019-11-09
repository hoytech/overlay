/* eslint-disable react/no-multi-comp */
/* eslint-disable react/display-name */
import React, { forwardRef } from 'react';
import { NavLink as RouterLink } from 'react-router-dom';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { List, ListItem, Button, colors } from '@material-ui/core';
import { TreeView, TreeItem } from '@material-ui/lab';
import * as Context from '../../../../../../helpers/Context.js';


const useStyles = makeStyles(theme => ({
  root: {},
  item: {
    display: 'flex',
    paddingTop: 0,
    paddingBottom: 0
  },
  button: {
    color: colors.blueGrey[800],
    padding: '10px 8px',
    justifyContent: 'flex-start',
    textTransform: 'none',
    letterSpacing: 0,
    width: '100%',
    fontWeight: theme.typography.fontWeightMedium
  },
  icon: {
    color: theme.palette.icon,
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    marginRight: theme.spacing(1)
  },
  active: {
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightMedium,
    '& $icon': {
      color: theme.palette.primary.main
    }
  }
}));

const CustomRouterLink = forwardRef((props, ref) => (
  <div
    ref={ref}
    style={{ flexGrow: 1 }}
  >
    <RouterLink {...props} />
  </div>
));

const ZoneListing = props => {
  const { items, className, ...rest } = props;

  let wsClient = React.useContext(Context.WSClientContext);
  let [currItems, setCurrItems] = React.useState([]);

  React.useEffect(() => {
    if (!wsClient) return;

    wsClient.send({ cmd: 'get-zone', zoneHash: '0x295cc1fa96f15c81e8f70b6d5a7a5747a2e6b7bb9f6079fd23a81ef3d96df897', }, (err, val) => {
      if (!err) setCurrItems(val.items);
    });
  }, [wsClient]);

  const classes = useStyles();

console.log(currItems);
  return <div>
    {currItems.map(i => <div key={i[0]}>{i[0]}</div>)}
  </div>;

/*
  return (
    <TreeView
      className={clsx(classes.root, className)}
    >
      <TreeItem nodeId="1" label="Cats">
        <TreeItem nodeId="2" label="Persian" />
        <TreeItem nodeId="3" label="Tabby" />
      </TreeItem>
      <TreeItem nodeId="4" label="Guns">
        <TreeItem nodeId="5" label="Ruger" />
        <TreeItem nodeId="6" label="Colt" />
      </TreeItem>
    </TreeView>
  );
*/
};

ZoneListing.propTypes = {
  className: PropTypes.string,
  items: PropTypes.array.isRequired
};

export default ZoneListing;
