import { Sync } from "@mui/icons-material";
import {
  Button, CardHeader, Checkbox, Divider, FormControlLabel, FormGroup, Grid, Typography, useTheme
} from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { getRandomItem, getRandomItems } from "utils/math";

export function MissionGenerator(props) {
  const { nameFilter, data } = props;
  const theme = useTheme();
  const missions = data
    .getMissionScenarios()
    .filter((mission) =>
      nameFilter
        ? mission.name.toLowerCase().includes(nameFilter.toLowerCase())
        : true
    );
  const weathers = data.getMissionWeather();
  const secondaries = data.getMissionSecondaries();
  const [randomMission, setRandomMission] = useState(getRandomItem(missions));
  const [randomWeather, setRandomWeather] = useState(getRandomItem(weathers));
  const [randomSecondary, setRandomSecondary] = useState(
    getRandomItems(secondaries, 3)
  );
  const [enableWeather, setEnableWeather] = useState(false);
  const generateNewMission = () => {
    setRandomMission(getRandomItem(missions));
    setRandomWeather(getRandomItem(weathers));
    setRandomSecondary(getRandomItems(secondaries, 3));
  };
  return (
    <>
      <Typography sx={{ my: 2 }} variant="h4" align="center">
        Scenarios
      </Typography>
      <Card
        sx={{
          border: `2px solid ${theme.palette.primary.main}`,
          mb: 2,
        }}
      >
        <CardHeader
          sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.getContrastText(theme.palette.primary.main), p: 1 }}
          title={
            <Typography variant="h5" component="div" align="center">
              Options
            </Typography>
          }
        />
        <CardContent>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={enableWeather}
                  onChange={() => setEnableWeather(!enableWeather)}
                />
              }
              label="Twist"
            />
          </FormGroup>
          {/* <FormGroup check inline>
          <Label style={{ display: 'inline' }}>
            <Input type="checkbox" title="" style={{ marginLeft: '5px' }} color="primary" checked={enableCondition} onChange={() => setEnableCondition(!enableCondition)} />
            {'Fighting Condition'}
          </Label>
        </FormGroup> */}
          <Button
            variant="contained"
            onClick={generateNewMission}
            startIcon={<Sync />}
          >
            New Scenario
          </Button>
        </CardContent>
      </Card>
      {!randomMission && (
        <>
          <div
            className="rule-card unit-card"
            style={{ marginBottom: "15px", borderColor: theme.palette.primary.main }}
          >
            <div
              className="unit-card-title"
              style={{ backgroundColor: theme.palette.primary.main, color: theme.palette.getContrastText(theme.palette.primary.main) }}
            >
              <h5>None Found</h5>
            </div>
            <div className="unit-card-body">
              No missions found. Try rengerating...
            </div>
          </div>
        </>
      )}
      {!!randomMission && (
        <>
          <Grid
            container
            spacing={{ xs: 2, md: 3 }}
            columns={{ xs: 4, sm: 8, md: 12 }}
          >
            <Grid item sx={{ mb: 2 }} md={6}>
              <Card
                sx={{
                  border: `2px solid ${theme.palette.primary.main}`,
                }}
              >
                <CardHeader
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.getContrastText(theme.palette.primary.main),
                    p: 1,
                  }}
                  title={
                    <Typography variant="h5" component="div" align="center">
                      {randomMission.name}
                    </Typography>
                  }
                />
                <CardMedia
                  component="img"
                  image={randomMission.map}
                  alt={randomMission.name}
                />
                <CardContent>
                  <Typography variant="body" color="text.primary">
                    <ReactMarkdown
                      className="rule-text"
                      style={{ breakInside: "avoid-column" }}
                      children={randomMission.victory_conditions}
                    />
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item sx={{ mb: 2 }} md={6}>
              <Card
                sx={{
                  border: `2px solid ${theme.palette.primary.main}`,
                }}
              >
                <CardHeader
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.getContrastText(theme.palette.primary.main),
                    p: 1,
                  }}
                  title={
                    <Typography variant="h5" component="div" align="center">
                      Secondary Objectives
                    </Typography>
                  }
                />
                <CardContent>
                  {randomSecondary.map((secondary) => (
                    <div className="width-100">
                      <Typography variant="h5" component="div" gutterBottom>
                        {secondary.name}
                      </Typography>
                      <div style={{ marginBottom: "0.5em" }}>
                        <ReactMarkdown
                          className="rule-text font-italic"
                          style={{ breakInside: "avoid-column" }}
                          children={secondary.description}
                        />
                      </div>
                      <ReactMarkdown
                        className="rule-text"
                        style={{ breakInside: "avoid-column" }}
                        children={secondary.rules}
                      />
                      <Divider />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </Grid>
            {!!enableWeather && (
              <Grid item sx={{ mb: 2 }} md={12}>
                <Card
                  sx={{
                    border: `2px solid ${theme.palette.primary.main}`,
                  }}
                >
                  <CardHeader
                    sx={{
                      backgroundColor: theme.palette.primary.main, color: theme.palette.getContrastText(theme.palette.primary.main),
                    }}
                    title={
                      <Typography variant="h5" component="div" align="center">
                        Twist
                      </Typography>
                    }
                  />
                  <CardContent>
                    <Typography variant="h5" component="div" gutterBottom>
                      {randomWeather.name}
                    </Typography>
                    <div style={{ marginBottom: "0.5em" }}>
                      <ReactMarkdown
                        className="rule-text font-italic"
                        style={{ breakInside: "avoid-column" }}
                        children={randomWeather.description}
                      />
                    </div>
                    <ReactMarkdown
                      className="rule-text"
                      style={{ breakInside: "avoid-column" }}
                      children={randomWeather.rules}
                    />
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </>
      )}
    </>
  );
}
