import {
  faCheckCircle, faExclamationCircle
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BugReportIcon from '@mui/icons-material/BugReport';
import RefreshIcon from '@mui/icons-material/Refresh';
import UploadIcon from '@mui/icons-material/Upload';
import {
  Button, CardActionArea,
  CardActions, CardHeader, Grid
} from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Container from "@mui/material/Container";
import Popover from "@mui/material/Popover";
import { useTheme } from "@mui/material/styles";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Dropdown } from "components/dropdown";
import { DataContext } from "hooks";
import useQueryParams from 'hooks/use-query-params';
import { get, groupBy, omit, sortBy } from "lodash";
import { useSnackbar } from "notistack";
import React from "react";
import { useNavigate } from 'react-router-dom';
import { readFileContent } from "utils/files";
import "./games.css";

const Games = (props) => {
  const [
    {
      data: nope,
      setData,
      coreData,
      refreshAllData,
      appState,
      setAppState,
      userPrefs
    },
  ] = React.useContext(DataContext);
  let [ activeTab, setActiveTab ] = useQueryParams("tab", 0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const nameFilter = appState?.searchText;
  
  const showBeta = userPrefs.showBeta;
  const gameTypesRaw = {
    all: { name: "All" },
    ...get(nope, "gameData.gameTypes", {}),
  };
  const gamesUnsorted = Object.values(get(nope, `gameData.games`, {})).filter(
    (game) => (showBeta ? true : game.version && Number(game.version) >= 1)
  );
  const gameTypes = [
    ...Object.keys(gameTypesRaw).filter(
      (gameType) =>
        gamesUnsorted.filter((game) => game.gameType === gameType).length
    ),
  ];
  const games = sortBy(
    Object.values(get(nope, `gameData.games`, {}))
      .filter((game) =>
        showBeta ? true : game.version && Number(game.version) >= 1
      )
      .filter((unit) =>
        nameFilter
          ? unit.name.toLowerCase().includes(nameFilter.toLowerCase())
          : true
      ),
    "name"
  ).filter((game) =>
    gameTypes[activeTab] === "all"
      ? true
      : game.gameType === gameTypes[activeTab]
  );
  const gameCategories = get(nope, "gameData.categories", {});
  const unitCategories = groupBy(games, "category");
  const categoryOrder = [...Object.keys(gameCategories), undefined].filter(
    (cat) => unitCategories[cat] && unitCategories[cat].length
  );
  const reportUrl = get(nope, "gameData.reportUrl");
  const fileDialog = React.useRef();

  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };
  const setCustomData = (passedData) => {
    const newGameData = {
      ...coreData,
      customData: {
        ...get(nope, "customData", {}),
        ...passedData,
      },
    };
    setData(newGameData);
  };
  const uploadFaction = (event) => {
    const file = get(event, "target.files[0]");
    if (file) {
      readFileContent(file)
        .then((content) => {
          let armyObject = {};
          try {
            armyObject = JSON.parse(content);
          } catch (e) {
            return Promise.reject(e);
          }
          if (armyObject.games) {
            const newArmyData = {
              ...armyObject,
            };
            setCustomData(newArmyData);
            enqueueSnackbar(`Core data successfully imported.`, {
              appearance: "success",
            });
          } else if (armyObject.id && armyObject.factions) {
            const newArmyData = {
              games: {
                ...get(nope, "customData.games", {}),
                [armyObject.id]: {
                  ...armyObject,
                },
              },
            };
            setCustomData(newArmyData);
            enqueueSnackbar(`${armyObject.name} successfully imported.`, {
              appearance: "success",
            });
          } else {
            enqueueSnackbar(`Game failed to find data to import.`, {
              appearance: "error",
            });
          }
        })
        .catch((error) => {
          enqueueSnackbar(`Core game data failed to import. ${error.message}`, {
            appearance: "error",
          });
        });
    }
    fileDialog.current.value = null;
  };
  const deleteGame = (gameId) => {
    const newArmyData = {
      ...get(nope, "customData", {}),
      games: {
        ...omit(get(nope, "customData.games", {}), gameId),
      },
    };
    enqueueSnackbar(
      `${get(
        nope,
        `customData.games[${gameId}].name`,
        {}
      )} successfully deleted.`,
      { appearance: "success" }
    );
    setCustomData(newArmyData);
  };
  const goToFaction = (faction) => navigate(`/games/${faction.id}`);
  const refreshFactions = React.useCallback(() => {
    refreshAllData(true)
      .then(() => {
        enqueueSnackbar(`All games data successfully updated.`, {
          appearance: "success",
        });
      })
      .catch((error) => {
        enqueueSnackbar(`All games data failed to fetch. ${error.message}`, {
          appearance: "error",
        });
      });
  }, [ enqueueSnackbar, refreshAllData ]);
  const handleClick = () => {
    fileDialog.current.click();
  };

  const handleChange = (event, newValue) => {
    toggle(newValue);
  };
  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }
  React.useEffect(() => {
    setAppState({
      enableSearch: true,
      contextActions: [
        {
          name: 'Refresh',
          icon: <RefreshIcon />,
          onClick: () => {
            refreshFactions()
          }
        },
        ...(!!userPrefs.developerMode ? [
          {
            name: 'Import',
            icon: <UploadIcon />,
            onClick: () => {
              handleClick();
            }
          }
        ] : []),
        ...(!!reportUrl ? [
          {
            name: 'Report',
            icon: <BugReportIcon />,
            onClick: () => window.open(reportUrl, "_blank")
          }
        ] : [])
      ]
    })
    return () => {
      setAppState({
        contextActions: []
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ userPrefs.developerMode ]);
  // const [dialOpen, setDialOpen] = React.useState(false);
  if (!games) {
    return (
      <p><input
        id="file-input"
        type="file"
        name="name"
        multiple
        ref={fileDialog}
        onChange={uploadFaction}
        style={{ height: "0px", overflow: "hidden" }}
      /></p>
    );
  }
  return (
    <Container>
      <Typography variant="h3" align="center" sx={{ mb: 2 }}>
        Games Modules
      </Typography>
      <Box
        className="sticky"
        sx={{
          width: "100%",
          bgcolor: "background.paper",
          top: isMobile ? "56px" : "64px",
        }}
      >
        {!!gameTypes && !!gameTypes.length && (
          <Box sx={{ width: "100%", bgcolor: "background.paper", pb: 0 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                variant="scrollable"
                value={parseInt(activeTab) || 0}
                onChange={handleChange}
                aria-label="basic tabs example"
              >
                {gameTypes.map((tab, index) => {
                  const gameTypeData = gameTypesRaw[tab];
                  return (
                    <Tab
                      key={index}
                      sx={{ textTransform: "none" }}
                      label={gameTypeData.name}
                      {...a11yProps(0)}
                    />
                  );
                })}
              </Tabs>
            </Box>
          </Box>
        )}
      </Box>
      <div id="gameList">
        {categoryOrder.map((gameKey, idx) => {
          const games = get(unitCategories, `[${gameKey}]`, []);
          const categoryData = get(nope, `gameData.categories[${gameKey}]`, {});
          return (
            <>
              <Typography variant="h4" gutterBottom align="center" sx={{ my: 2 }}>
                {categoryData.name || "No Category"}
              </Typography>
              <Grid
                container
                spacing={{ xs: 2, md: 3 }}
                key={idx}
              >
                {games.map((game, index) => {
                  const factionColor = game.color;
                  const isModified = Object.values(
                    get(nope, `customData.games[${game.id}]`, {})
                  ).length;
                  return (
                    <Grid
                      item
                      sx={{ pb: 2 }}
                      md={games.length > 1 ? "6" : "12"}
                      key={index}
                    >
                      <Card
                        sx={{
                          border: `2px solid ${factionColor}`,
                        }}
                      >
                        <CardActionArea onClick={() => goToFaction(game)}>
                          <CardHeader
                            sx={{
                              py: 1.25,
                              backgroundColor: factionColor,
                              color: "white",
                            }}
                            title={
                              <Typography
                                variant="h5"
                                component="div"
                                align="center"
                              >
                                {!!isModified && (
                                  <Dropdown>
                                    {({ handleClose, open, handleOpen, anchorElement }) => (
                                      <>
                                        <span
                                          aria-haspopup="true"
                                          onMouseEnter={handleOpen}
                                          onMouseLeave={handleClose} style={{ marginRight: '5px' }}>
                                          <FontAwesomeIcon
                                            size="sm"
                                            icon={faExclamationCircle}
                                          />
                                        </span>
                                        <Popover
                                          variant="warning"
                                          id="mouse-over-popover"
                                          sx={{
                                            pointerEvents: 'none',
                                          }}
                                          open={open}
                                          anchorEl={anchorElement}
                                          anchorOrigin={{
                                            vertical: 'top',
                                            horizontal: 'center',
                                          }}
                                          transformOrigin={{
                                            vertical: 'bottom',
                                            horizontal: 'center',
                                          }}
                                          onClose={handleClose}
                                          disableRestoreFocus
                                        >
                                          <Typography sx={{ p: 1 }}>Warning: Data Is Modified Locally</Typography>
                                        </Popover>
                                      </>
                                    )}
                                  </Dropdown>
                                )}
                                {!isModified && (
                                  <Dropdown>
                                    {({ handleClose, open, handleOpen, anchorElement }) => (
                                      <>
                                        <span
                                          aria-haspopup="true"
                                          onMouseEnter={handleOpen}
                                          onMouseLeave={handleClose} style={{ marginRight: '5px' }}>
                                          <FontAwesomeIcon size="sm" icon={faCheckCircle} />
                                        </span>
                                        <Popover
                                          variant="warning"
                                          id="mouse-over-popover"
                                          sx={{
                                            pointerEvents: 'none',
                                          }}
                                          open={open}
                                          anchorEl={anchorElement}
                                          anchorOrigin={{
                                            vertical: 'top',
                                            horizontal: 'center',
                                          }}
                                          transformOrigin={{
                                            vertical: 'bottom',
                                            horizontal: 'center',
                                          }}
                                          onClose={handleClose}
                                          disableRestoreFocus
                                        >
                                          <Typography sx={{ p: 1 }}>Official Game Module</Typography>
                                        </Popover>
                                      </>
                                    )}
                                  </Dropdown>
                                )}
                                {game.name}
                                <small style={{ marginLeft: '5px', fontSize: '1rem' }}>
                                  {game.version ? `(${game.version})` : ""}
                                </small>
                              </Typography>
                            }
                          />
                          {!!game.image && (
                            <CardMedia
                              component="img"
                              height="250"
                              image={game.image}
                              alt="green iguana"
                            />
                          )}
                          <CardContent sx={{ p: 1.5 }}>
                            <Typography>{game.description || " "}</Typography>
                          </CardContent>
                        </CardActionArea>
                        {!game.url && (
                          <CardActions>
                            <Button
                              size="small"
                              color="primary"
                              onClick={(event) => {
                                event.stopPropagation();
                                deleteGame(game.id);
                              }}
                            >
                              Delete
                            </Button>
                          </CardActions>
                        )}
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </>
          );
        })}
      </div>
      <input
        id="file-input"
        type="file"
        name="name"
        multiple
        ref={fileDialog}
        onChange={uploadFaction}
        style={{ height: "0px", overflow: "hidden" }}
      />
    </Container>
  );
};

export default Games;
