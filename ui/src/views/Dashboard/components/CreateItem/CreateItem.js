import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import { Box, Button, Input, TextField } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {
    borderRadius: '4px',
    alignItems: 'center',
    padding: theme.spacing(2),
    margin: theme.spacing(1)
  },
  path_input: {
    flexGrow: 1,
    fontSize: '14px',
    lineHeight: '16px',
    letterSpacing: '-0.05px',
    margin: theme.spacing(1)
  },
  url_input: {
    flexGrow: 1,
    fontSize: '14px',
    lineHeight: '16px',
    letterSpacing: '-0.05px',
    margin: theme.spacing(1)
  },
  button: {
    margin: theme.spacing(2)
  }
}));

const CreateItem = props => {
  const { className, style, ...rest } = props;

  const classes = useStyles();

  return (
    <Box
      {...rest}
      className={clsx(classes.root, className)}
      style={style}
    >
      <TextField
        {...rest}
        className={classes.path_input}
        disableUnderline
        label="Path"
      />
      <TextField
        {...rest}
        className={classes.url_input}
        disableUnderline
        label="URL"
      />
      <Button
        {...rest}
        className={classes.button}
        variant="contained"
      >Create</Button>
    </Box>
  );
};

CreateItem.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object
};

export default CreateItem;
