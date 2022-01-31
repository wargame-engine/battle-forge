import { Box, Typography } from "@mui/material";
import React from "react";
function EmptyState(props) {
  let variant;

  switch (props.size) {
    case "small":
      variant = "h6";
      break;

    case "medium":
      variant = "h6";
      break;

    case "large":
      variant = "h4";
      break;

    default:
      variant = "h5";
      break;
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
    >
      {props.image && (
        <Box display="flex" flex={1}>
          <img
            src={props.image}
            alt={props.title}
            mb={props.title || props.description ? 2 : 0}
            style={{ width: '100%' }}
          />
        </Box>
      )}

      {props.title && (
        <Box mb={!props.description && props.button ? 2 : 0.5}>
          <Typography sx={{ mt: 2 }} variant={variant}>{props.title}</Typography>
        </Box>
      )}

      {props.description && (
        <Box mb={props.button && 3}>
          <Typography variant="body1">{props.description}</Typography>
        </Box>
      )}

      {props.button && props.button}
    </Box>
  );
}

EmptyState.defaultProps = {
  type: "page",
  size: "medium",
  padding: 2,
};

export default EmptyState;
