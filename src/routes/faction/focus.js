import {
  Box, Button,
  Card, CardContent, CardHeader, Typography
} from "@mui/material";
import React from "react";
import { getTextColor, hexToRgb } from "utils/colors";

export const Focus = (props) => {
  const {
    faction,
    subfactions: rawSubfactions,
    setSubfaction,
    subfaction,
  } = props;
  const subfactions = [
    {
      id: "none",
      name: "No Focus",
      description:
        "A generalist force which can take on many different enemies.",
    },
    ...rawSubfactions,
  ];
  const { color: factionColor } =
    faction;
  const textColor = factionColor
    ? getTextColor(hexToRgb(factionColor))
    : "white";
  return (
    <div>
      <Typography sx={{ my: 2 }} variant="h4" component="div" align="center">
        Focus
      </Typography>
      {!subfactions.length && <p>{"No subfactions found..."}</p>}
      <div className="two-columns">
        {subfactions.map((subfactionData, index) => {
          const background = subfactionData.description;
          return (
            <div style={{ breakInside: "avoid" }} key={index}>
              <Card
                className="no-break"
                sx={{
                  border: `2px solid ${factionColor}`,
                  mb: 2,
                }}
              >
                <CardHeader
                  sx={{
                    backgroundColor: factionColor,
                    color: textColor,
                    py: 1,
                  }}
                  title={
                    <Typography variant="h5" component="div">
                      {subfactionData.name}
                    </Typography>
                  }
                />
                <CardContent>
                  <Box
                    display="flex"
                    sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Box
                      display="flex"
                      sx={{ justifyContent: 'space-between', alignItems: 'center', mr: 1 }}
                    >
                      {!!background && (
                        <div>
                          <>{background}</>
                        </div>
                      )}
                      {/* {!!strengths && <div>
                        <>{strengths}</>
                      </div>}
                      {!!weaknesses && <div>
                        <>{weaknesses}</>
                      </div>} */}
                    </Box>
                    <Button
                      className="focus-select"
                      variant="contained"
                      disabled={subfaction === subfactionData.id}
                      onClick={() => setSubfaction(subfactionData.id)}
                    >{`Select`}</Button>
                  </Box>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};
