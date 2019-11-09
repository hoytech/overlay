import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import { Box } from '@material-ui/core';
import * as Context from '../../../../helpers/Context.js';

const useStyles = makeStyles(theme => ({
  root: {
    borderRadius: '4px',
    alignItems: 'center',
    padding: theme.spacing(2),
    margin: theme.spacing(1),
    display: 'flex',
    alignItems: 'center'
  },
}));

const ViewItem = props => {
  const { className, onViewItem, style, ...rest } = props;

  const classes = useStyles();

  let displayedValue = React.useContext(Context.DisplayedValue);

  let values = [];
  if (displayedValue.displayedValue && displayedValue.displayedValue.vals.length > 0) {
    values = displayedValue.displayedValue.vals;
  }

  values = values.map((item, i) =>
    <li key={i}>{item.val}</li>
  );

  return (
    <Box
      className={clsx(classes.root, className)}
      style={style}
    >
    <ul>
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
