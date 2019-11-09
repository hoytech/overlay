/* eslint-disable react/no-multi-comp */
/* eslint-disable react/display-name */
import React from 'react';
import PropTypes from 'prop-types';

import { Tree } from 'antd';

import * as Context from '../../../../../../helpers/Context.js';


const { TreeNode } = Tree;

const ZoneListing = props => {
  let wsClient = React.useContext(Context.WSClientContext);
  let tracking = React.useContext(Context.CurrentTracking);
  let displayedValue = React.useContext(Context.DisplayedValue);

  let [currItems, setCurrItems] = React.useState([]);

  React.useEffect(() => {
    if (!wsClient || !tracking.curr.zoneHash) return;

    wsClient.send({ cmd: 'get-zone', zoneHash: tracking.curr.zoneHash, }, (err, val) => {
      if (!err) setCurrItems(val.items);
    });
  }, [wsClient, tracking.curr.zoneHash]);

  //const classes = useStyles();

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

    for (let item of (items || [])) {
        let path = item[0].split('/').filter(i => i !== '');
        setter(tree, path, item[1]);
    }

    return tree;
}

function buildComponentTree(tree, path) {
    let label = '';
    if (path.length) label = path[path.length - 1];
    if (Object.keys(tree).length) label += '/';

    return <TreeNode key={'/' + path.join('/')} title={label}>
        {Object.keys(tree).map(k => buildComponentTree(tree[k].children || {}, path.concat(k)))}
    </TreeNode>;
}



ZoneListing.propTypes = {
  className: PropTypes.string
};

export default ZoneListing;
