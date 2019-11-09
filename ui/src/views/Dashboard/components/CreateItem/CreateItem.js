import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import { Container, Button, Input, TextField, Select, MenuItem, InputLabel } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {
    borderRadius: '4px',
    alignItems: 'center',
    padding: theme.spacing(2),
    margin: theme.spacing(1),
    display: 'flex',
    alignItems: 'center'
  },
  path_input: {
    fontSize: '14px',
    lineHeight: '16px',
    letterSpacing: '-0.05px',
    margin: theme.spacing(1),
  },
  url_input: {
    fontSize: '14px',
    lineHeight: '16px',
    letterSpacing: '-0.05px',
    margin: theme.spacing(1)
  },
  select: {
    fontSize: '14px',
    lineHeight: '16px',
    letterSpacing: '-0.05px',
    height: '48px',
    margin: theme.spacing(3)
  },
  label: {
    fontSize: '14px',
    height: '48px',
    lineHeight: '64px',
    margin: theme.spacing(1)
  },
  button: {
    margin: theme.spacing(2)
  }
}));

const CreateItem = props => {
  const { className, onCreateItem, style, ...rest } = props;

  const classes = useStyles();

  let pathRef = React.createRef();
  let typeRef = React.createRef();
  let valueRef = React.createRef();

  function handleCreateItem() {
    let path = pathRef.current.value;
    let type = typeRef.current.value;
    let value = valueRef.current.value;

    onCreateItem(path, type, value);
  }

  return (
    <Container
      {...rest}
      className={clsx(classes.root, className)}
      style={style}
    >
      <TextField
        {...rest}
        className={classes.path_input}
        disableUnderline
        label="Path"
        inputRef={pathRef}
      />
      <InputLabel id="type-label" className={classes.label}>Type</InputLabel>
      <Select
        {...rest}
        className={classes.select}
        labelId="type-label"
        inputRef={typeRef}
      >
        <MenuItem value="url">URL</MenuItem>
        <MenuItem value="overlay">Overlay</MenuItem>
      </Select>
      <TextField
        {...rest}
        className={classes.url_input}
        disableUnderline
        label="Value"
        inputRef={valueRef}
      />
      <Button
        {...rest}
        className={classes.button}
        onClick={handleCreateItem}
        variant="contained"
      >Create</Button>
    </Container>
  );
};

CreateItem.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object
};

export default CreateItem;
