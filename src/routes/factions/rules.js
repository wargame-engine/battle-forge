import RehypeToc from '@jsdevtools/rehype-toc';
import { Grid } from "@mui/material";
import Typography from "@mui/material/Typography";
import { get, isEqual, sortBy } from "lodash";
import React from "react";
import ReactMarkdown from "react-markdown";
import styled from "styled-components";
import { MarkdownRenderer } from "utils/markdown";

const StyledRules = styled.div`
  h1 {
    font-size: 22pt;
    font-weight: bold;
    border-bottom: 4px solid rgb(57, 110, 158);
    padding-bottom: 0.25rem;
  }
  h2 {
    font-size: 20pt;
    border-bottom: 2px solid rgb(57, 110, 158);
    padding-bottom: 0.25rem;
  }
  h3 {
    font-size: 16pt;
  }
  h4 {
    font-weight: bold;
    font-size: 12pt;
  }
  h5 {
    font-weight: bold;
    font-size: 12pt;
  }
  p {
    break-inside: "avoid-column";
    page-break-inside: avoid; /* For Firefox. */
    -webkit-column-break-inside: avoid; /* For Chrome & friends. */
    break-inside: avoid; /* For standard browsers like IE. :-) */
  }
`;

export function Rules(props) {
  const { rawData, game, data, nameFilter } = props;
  const { gameRules, skirmishRules } = rawData;
  const gameType = get(game, "gameType", "battle");
  // const gameTypeData = get(rawData, `gameData.gameTypes[${gameType}]`, {});
  // const gameTypeName = get(gameTypeData, "name", "Unknown Game");
  const isSkirmish = isEqual(gameType, "battle");
  const rules = isSkirmish ? gameRules : skirmishRules;
  const mdRenderer = React.useMemo(() => MarkdownRenderer(), []);
  const missions = data
    .getMissionScenarios()
    .filter((mission) =>
      nameFilter
        ? mission.name.toLowerCase().includes(nameFilter.toLowerCase())
        : true
    );
  const weathers = data
    .getMissionWeather()
    .filter((mission) =>
      nameFilter
        ? mission.name.toLowerCase().includes(nameFilter.toLowerCase())
        : true
    );
  const secondaries = data
    .getMissionSecondaries()
    .filter((mission) =>
      nameFilter
        ? mission.name.toLowerCase().includes(nameFilter.toLowerCase())
        : true
    );
  const terrains = sortBy(
    data
      .getTerrain()
      .filter((mission) =>
        nameFilter
          ? mission.name.toLowerCase().includes(nameFilter.toLowerCase())
          : true
      ),
    "name"
  );
  return (
    <>
      <div
        style={{ marginBottom: "15px", borderColor: "rgb(57, 110, 158)" }}
      >
        <div>
          <StyledRules>
            <ReactMarkdown components={mdRenderer} children={rules}
              rehypePlugins={[[RehypeToc, { headings: ["h1", "h2", "h3"] }]]} />
          </StyledRules>
        </div>
      </div>
      <Typography variant="h4" align="center">Terrain Examples</Typography>
      <hr className="hr-blue" />
      <div className="two-columns">
        {terrains.map((terrain) => (
          <div
            className="unit-card terrain-card"
            style={{ marginBottom: "15px", borderColor: "rgb(57, 110, 158)" }}
          >
            <div
              className="unit-card-title"
              style={{ backgroundColor: "rgb(57, 110, 158)", color: "white" }}
            >
              <Typography variant="h5" align="center">{terrain.name}</Typography>
            </div>
            <div className="unit-card-body">
              <div>
                <p style={{ breakInside: "avoid-column", marginBottom: "0.5em" }}>
                  <i>{terrain.description}</i>
                </p>
                <ul className="ul-indent">
                  {get(terrain, "rules", []).map((rule) => (
                    <li>{rule}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
      <span id="scenario-h1">
        <Typography variant="h4" align="center">Scenarios</Typography>
        <hr className="hr-blue" />
        <Grid
          container
          rowSpacing={1}
          sx={{ mt: 2 }}
          columnSpacing={{ xs: 1, sm: 2, md: 3 }}
        >
          {missions.map((mission, index) => (

            <Grid item md={6} key={index}>
              <div
                className="unit-card mission-card"
                style={{ marginBottom: "15px", borderColor: "rgb(57, 110, 158)" }}
              >
                <div
                  className="unit-card-title"
                  style={{ backgroundColor: "rgb(57, 110, 158)", color: "white" }}
                >
                  <Typography variant="h5" align="center">{mission.name}</Typography>
                </div>
                <div className="unit-card-body">
                  <a href={mission.map} rel="noreferrer" target={"_blank"}>
                    <img
                      className={"d-block width-100 rules-image"}
                      style={{ marginBottom: "1rem" }}
                      src={mission.map}
                      alt={mission.name}
                    />
                  </a>
                  <div className="width-100">
                    <ReactMarkdown
                      className="rule-text"
                      style={{ breakInside: "avoid-column" }}
                      children={mission.victory_conditions}
                    />
                  </div>
                </div>
              </div>
            </Grid>
          ))}

        </Grid>
      </span>
      <Typography variant="h4" align="center">Secondary Objectives</Typography>
      <hr className="hr-blue" />
      <div className="two-columns">
        {secondaries.map((condition, index) => (
          <div key={index} style={{ breakInside: "avoid" }}>
            <div
              className="unit-card secondary-card"
              style={{
                marginBottom: "15px",
                borderColor: "rgb(57, 110, 158)",
              }}
            >
              <div
                className="unit-card-title"
                style={{
                  backgroundColor: "rgb(57, 110, 158)",
                  color: "white",
                }}
              >
                <h3 align="center">{condition.name}</h3>
              </div>
              <div className="unit-card-body">
                <div className="width-100">
                  <div style={{ marginBottom: "0.5em" }}>
                    <ReactMarkdown
                      className="rule-text  font-italic"
                      style={{ breakInside: "avoid-column" }}
                      children={condition.description}
                    />
                  </div>
                  <ReactMarkdown
                    className="rule-text"
                    style={{ breakInside: "avoid-column" }}
                    children={condition.rules}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Typography sx={{ pt: 2 }} variant="h4" align="center">Twists</Typography>
      <hr className="hr-blue" />
      <div className="two-columns">
        {weathers.map((weather, index) => (
          <div key={index} style={{ breakInside: "avoid" }}>
            <div
              className="unit-card twist-card"
              style={{
                marginBottom: "15px",
                borderColor: "rgb(57, 110, 158)",
              }}
            >
              <div
                className="unit-card-title"
                style={{
                  backgroundColor: "rgb(57, 110, 158)",
                  color: "white",
                }}
              >
                <h3 align="center">{weather.name}</h3>
              </div>
              <div className="unit-card-body">
                <div className="width-100">
                  <div style={{ marginBottom: "0.5em" }}>
                    <ReactMarkdown
                      className="rule-text  font-italic"
                      style={{ breakInside: "avoid-column" }}
                      children={weather.description}
                    />
                  </div>
                  <ReactMarkdown
                    className="rule-text"
                    style={{ breakInside: "avoid-column" }}
                    children={weather.rules}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
