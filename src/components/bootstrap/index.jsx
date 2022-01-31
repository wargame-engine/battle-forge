import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import { IconButton, Stack, TextField } from "@mui/material";
import { isNil, toNumber } from "lodash";
import React from "react";


export const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
  <span
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
  >
    {children}
  </span>
));

export const InputNumber = (props) => {
  const {
    onChange = () => {},
    value,
    max,
    min,
    style = {},
    defaultValue = 0,
    allowReset,
    disabled = false,
    label,
    fullWidth = false
  } = props;
  const changeValue = (newValue) => {
    if (!isNil(max) && newValue > max) {
      onChange(max);
      return;
    } else if (!isNil(min) && newValue < min) {
      onChange(min);
      return;
    }
    onChange(newValue);
  };
  return (
    <span style={style}>
      <Stack direction="row">
        {!!allowReset && (
          <IconButton
            variant="contained"
            disabled={disabled}
            size="small"
            sx={{ mr: 1, color: 'primary.main' }}
            onClick={() => changeValue(defaultValue)}
          >
            <RefreshIcon />
          </IconButton>
        )}
        <TextField
          fullWidth={fullWidth}
          label={label}
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
          size="small"
          type="number"
          sx={{ mr: 1 }}
          {...props}
          onChange={(event) => {
            changeValue(toNumber(event.target.value));
          }}
        />
        <IconButton
          variant="contained"
          sx={{ mr: 1, color: 'primary.main' }}
          disabled={disabled || value === min}
          size="small"
          onClick={() => changeValue(value - 1)}
        >
          <KeyboardArrowDownIcon />
        </IconButton>
        <IconButton
          sx={{ color: 'primary.main' }}
          variant="contained"
          disabled={disabled || value === max}
          size="small"
          onClick={() => changeValue(value + 1)}
        >
          <KeyboardArrowUpIcon />
        </IconButton>
      </Stack>
    </span>
  );
};
