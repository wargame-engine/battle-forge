import {
  CardHeader,
  Typography
} from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import React from 'react';

export const Overview = (props) => {
  const { game } = props;
  const background = game.description;
  return (
    <div>
      <Typography sx={{ my: 2 }} variant="h4" align="center">Overview</Typography>
      {!background && (
        <div>
          <p>{`No information available...`}</p>
        </div>
      )}
      {!!background && (
        <>
          <Card
            sx={{
              border: `2px solid rgb(57, 110, 158)`,
              mb: 2,
            }}
          >
            <CardHeader
              sx={{ backgroundColor: "rgb(57, 110, 158)", color: "white", py: 1 }}
              title={
                <Typography variant="h5" component="div">
                  Background
                </Typography>
              }
            />
            <CardContent>
              <Typography>{background}</Typography>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}