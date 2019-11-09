/* eslint-disable react/no-multi-comp */
/* eslint-disable react/display-name */
import React from 'react';
import { NavLink as RouterLink } from 'react-router-dom';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { List, ListItem, Button, colors } from '@material-ui/core';

import { Tree } from 'antd';
import * as Context from '../../../../../../helpers/Context.js';


const { TreeNode } = Tree;


/*
import { TreeView, TreeItem } from '@material-ui/lab';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
*/


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


const ZoneListing = props => {
  const { items, className, ...rest } = props;

  let wsClient = React.useContext(Context.WSClientContext);
  let zoneHash = React.useContext(Context.CurrentZoneHash);
  let displayedValue = React.useContext(Context.DisplayedValue);

  let [currItems, setCurrItems] = React.useState([]);

  React.useEffect(() => {
    if (!wsClient || !zoneHash.currentZoneHash) return;

    wsClient.send({ cmd: 'get-zone', zoneHash: zoneHash.currentZoneHash, }, (err, val) => {
      if (!err) setCurrItems(val.items);
    });
  }, [wsClient, zoneHash.currentZoneHash]);

  const classes = useStyles();

  let itemTree = convertListToTree(currItems);
  let componentTree = buildComponentTree(itemTree, []);

  let onSelect = (nodeId) => {
    let vals = [];

    for (let item of currItems) {
      if (nodeId[0] === item[0]) vals.push(item[1]);
    }

    let selection = {
      key: nodeId[0],
      vals,
    };

    displayedValue.setDisplayedValue(selection);
  };

  return (
    <Tree
      defaultExpandedKeys={['/']}
      onSelect={onSelect}
    >
      {componentTree}
    </Tree>
  );
};



function convertListToTree(items) {
    let tree = {};

    let setter; setter = (t, path, val) => {
        if (!t[path[0]]) {
            t[path[0]] = {
                children: {},
                vals: [],
            };
        }

        if (path.length > 1) {
            setter(t[path[0]].children, path.slice(1), val);
        } else {
            t[path[0]].vals.push(val);
        }
    };

    for (let item of items) {
        let path = item[0].split('/').filter(i => i !== '');
        setter(tree, path, item[1]);
    }

    return tree;
}

function buildComponentTree(tree, path) {
    let nodeId = path.join('/');

    let label = '';
    if (path.length) label = path[path.length - 1];
    if (Object.keys(tree).length) label += '/';

    return <TreeNode key={'/' + path.join('/')} title={label}>
        {Object.keys(tree).map(k => buildComponentTree(tree[k].children || {}, path.concat(k)))}
    </TreeNode>;
}



ZoneListing.propTypes = {
  className: PropTypes.string,
  items: PropTypes.array.isRequired
};

export default ZoneListing;
