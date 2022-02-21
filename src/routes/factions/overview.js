import {
  CardHeader,
  Typography,
  useTheme
} from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import React from 'react';

export const Overview = (props) => {
  const { game } = props;
  const background = game.description;
  const theme = useTheme();
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
              border: `2px solid ${theme.palette.primary.main}`,
              mb: 2,
            }}
          >
            <CardHeader
              sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.getContrastText(theme.palette.primary.main), py: 1 }}
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