import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import { Container, Button, TextField, Select, MenuItem, InputLabel, Typography } from '@material-ui/core';
import * as Context from '../../../../helpers/Context.js';

const useStyles = makeStyles(theme => ({
  root: {
    borderRadius: '4px',
    alignItems: 'center',
    padding: theme.spacing(2),
    margin: theme.spacing(1),
    display: 'flex'
  },
  type: {
    marginTop: theme.spacing(2),
    marginRight: theme.spacing(5),
    fontSize: '20px'
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

  let [selectedType, setSelectedType] = React.useState("url");

  const classes = useStyles();

  let pathRef = React.createRef();
  let typeRef = React.createRef();
  let valueRef = React.createRef();

  let wsClient = React.useContext(Context.WSClientContext);
  let tracking = React.useContext(Context.CurrentTracking);

  const handleCreateItem = () => {
    if (!wsClient) return;

    let path = pathRef.current.value;
    let type = typeRef.current.value;
    let value = valueRef.current.value;

    if (!path || !type || !value) {
      throw new Error("Invalid item");
    }

    if (!path.startsWith("/")) {
      path = "/" + path;
    }

    console.log("Creating new item path=" + path + " type=" + type + " value=" + value);

    let args = { cmd: "add-zone", items: [{key: path, val: {type: type, val: value}}]};

    if (tracking.curr.zoneHash) args.base = tracking.curr.zoneHash;

    wsClient.send(args, (err, val) => {
      tracking.update({ zoneHash: val.zoneHash, });
    });
  };

  return (
    <Container
      {...rest}
      className={clsx(classes.root, className)}
      style={style}
    >
      <Typography className={classes.type}>Create item</Typography>
      <TextField
        {...rest}
        className={classes.path_input}
        label="Path"
        inputRef={pathRef}
      />
      <InputLabel id="type-label" className={classes.label}>Type</InputLabel>
      <Select
        {...rest}
        className={classes.select}
        labelId="type-label"
        inputRef={typeRef}
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value) }
      >
        <MenuItem value="url">URL</MenuItem>
        <MenuItem value="overlay">Overlay</MenuItem>
      </Select>
      <TextField
        {...rest}
        className={classes.url_input}
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
