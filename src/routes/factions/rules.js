import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { Grid, useTheme } from "@mui/material";
import Typography from "@mui/material/Typography";
import { DataContext } from 'hooks';
import { get, sortBy } from "lodash";
import React, { useContext } from "react";
import ReactMarkdown from "react-markdown";

export function Rules(props) {
  const { data, nameFilter } = props;
  const [
    {
      setAppState,
      userPrefs,
    },
  ] = useContext(DataContext);
  const theme = useTheme();
  // const gameType = get(game, "gameType", "battle");
//   const StyledRules = styled.div`
//   h1 {
//     font-size: 22pt;
//     font-weight: bold;
//     border-bottom: 4px solid ${theme.palette.primary.main};
//     padding-bottom: 0.25rem;
//   }
//   h2 {
//     font-size: 20pt;
//     border-bottom: 2px solid ${theme.palette.primary.main};
//     padding-bottom: 0.25rem;
//   }
//   h3 {
//     font-size: 16pt;
//   }
//   h4 {
//     font-weight: bold;
//     font-size: 12pt;
//   }
//   h5 {
//     font-weight: bold;
//     font-size: 12pt;
//   }
//   p {
//     break-inside: "avoid-column";
//     page-break-inside: avoid; /* For Firefox. */
//     -webkit-column-break-inside: avoid; /* For Chrome & friends. */
//     break-inside: avoid; /* For standard browsers like IE. :-) */
//   }
// `;
  // const gameTypeData = get(rawData, `gameData.gameTypes[${gameType}]`, {});
  // const gameTypeName = get(gameTypeData, "name", "Unknown Game");
  // const isSkirmish = isEqual(gameType, "battle");
  // const rules = isSkirmish ? gameRules : skirmishRules;
  // const mdRenderer = React.useMemo(() => MarkdownRenderer(), []);
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
  const scrollWithOffset = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  React.useEffect(() => {
    setAppState({
      enableSearch: false,
      contextActions: [
        {
          name: 'Top',
          icon: <ArrowUpwardIcon />,
          onClick: () => scrollWithOffset()
        }
      ]
    })
    return () => {
      setAppState({
        contextActions: []
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ userPrefs.developerMode ]);
  return (
    <>
      {/* <div
        style={{ marginBottom: "15px", borderColor: theme.palette.primary.main }}
      >
        <div>
          <StyledRules>
            <ReactMarkdown components={mdRenderer} children={rules}
              rehypePlugins={[[RehypeToc, { headings: ["h1", "h2", "h3"] }]]} />
          </StyledRules>
        </div>
      </div> */}
      <Typography sx={{ my: 2 }} variant="h4" align="center">Terrain Examples</Typography>
      <div className="two-columns">
        {terrains.map((terrain) => (
          <div
            className="unit-card terrain-card"
            style={{ marginBottom: "15px", borderColor: theme.palette.primary.main }}
          >
            <div
              className="unit-card-title"
              style={{ backgroundColor: theme.palette.primary.main, color: theme.palette.getContrastText(theme.palette.primary.main) }}
            >
              <Typography variant="h5" align="center">{terrain.name}</Typography>
            </div>
            <div style={{ padding: '0 15px' }}>
              <div>
                <Typography sx={{ my: 2 }} style={{ breakInside: "avoid-column", marginBottom: "0.5em" }}>
                  <i>{terrain.description}</i>
                </Typography>
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
        <Typography sx={{ my: 2 }} variant="h4" align="center">Scenarios</Typography>
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
                style={{ marginBottom: "15px", borderColor: theme.palette.primary.main }}
              >
                <div
                  className="unit-card-title"
                  style={{ backgroundColor: theme.palette.primary.main, color: theme.palette.getContrastText(theme.palette.primary.main) }}
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
      <Typography sx={{ my: 2 }} variant="h4" align="center">Secondary Objectives</Typography>
      <div className="two-columns">
        {secondaries.map((condition, index) => (
          <div key={index} style={{ breakInside: "avoid" }}>
            <div
              className="unit-card secondary-card"
              style={{
                marginBottom: "15px",
                borderColor: theme.palette.primary.main,
              }}
            >
              <div
                className="unit-card-title"
                style={{
                  backgroundColor: theme.palette.primary.main, color: theme.palette.getContrastText(theme.palette.primary.main)
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
      <Typography sx={{ my: 2 }} variant="h4" align="center">Twists</Typography>
      <div className="two-columns">
        {weathers.map((weather, index) => (
          <div key={index} style={{ breakInside: "avoid" }}>
            <div
              className="unit-card twist-card"
              style={{
                marginBottom: "15px",
                borderColor: theme.palette.primary.main,
              }}
            >
              <div
                className="unit-card-title"
                style={{
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.getContrastText(theme.palette.primary.main)
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
