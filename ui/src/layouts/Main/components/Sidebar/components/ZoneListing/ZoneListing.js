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
  let zoneData = React.useContext(Context.ZoneData);

  let itemTree = convertListToTree(zoneData);
  let componentTree = buildComponentTree(itemTree, []);

  let onSelect = (nodeId) => {
    let vals = [];

    for (let item of zoneData) {
      if (nodeId[0] === item[0]) vals.push({ val: item[1], source: item[2], });
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

    let setter; setter = (t, path, val, source) => {
        if (!t[path[0]]) {
            t[path[0]] = {
                children: {},
                val,
                source,
            };
        }

        if (path.length > 1) {
            setter(t[path[0]].children, path.slice(1), val, source);
        } else {
            //t[path[0]].vals.push({ val, source, });
        }
    };

    for (let item of (items || [])) {
        let path = item[0].split('/').filter(i => i !== '');
        setter(tree, path, item[1], item[2]);
    }

    return tree;
}

function buildComponentTree(tree, path, val, source) {
    let label = '';
    if (path.length) label = path[path.length - 1];
    if (Object.keys(tree).length) label += '/';

    let title = <span style={{ color: source ? 'red' : null, }}>
      {label}
    </span>;

    return <TreeNode key={'/' + path.join('/')} title={title}>
        {Object.keys(tree).map(k => buildComponentTree(tree[k].children || {}, path.concat(k), tree[k].val, tree[k].source))}
    </TreeNode>;
}



ZoneListing.propTypes = {
  className: PropTypes.string
};

export default ZoneListing;
