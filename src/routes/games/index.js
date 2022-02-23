import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BugReportIcon from '@mui/icons-material/BugReport';
import RefreshIcon from '@mui/icons-material/Refresh';
import UploadIcon from '@mui/icons-material/Upload';
import {
  Button, CardActionArea,
  CardActions, CardHeader, Chip
} from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
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
import { get, omit, sortBy } from "lodash";
import { useSnackbar } from "notistack";
import React from "react";
import { useNavigate } from 'react-router';
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
  let [activeTab, setActiveTab] = useQueryParams("tab", 0);
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
  }, [enqueueSnackbar, refreshAllData]);
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
  }, [userPrefs.developerMode]);
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
      <Box sx={{ mt: 2}} className="two-columns">
        {games.map((game, index) => {
          const factionColor = game.color;
          const isModified = Object.values(
            get(nope, `customData.games[${game.id}]`, {})
          ).length;
          return (
            <Box
              className="no-break"
              item
              sx={{ pb: 2 }}
              md={games.length > 1 ? "6" : "6"}
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
                        {/* {!isModified && (
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
                        )} */}
                        {game.name}
                        {/* <small style={{ marginLeft: '5px', fontSize: '1rem' }}>
                          {game.version ? `(${game.version})` : ""}
                        </small> */}
                      </Typography>
                    }
                  />
                  <CardContent sx={{ p: 0, display: 'flex', alignItems: 'end' }} style={{ background: `url(${!!game.image ? game.image : ''})`, backgroundSize: 'cover' }}>
                    <Box className={!!game.image ? "hover-fade" : ''} sx={{ p: 2 }} style={{ flex: 1, background: 'rgba(0,0,0, 0.75)' }}>
                      <Typography color="white" paragraph>
                        {game.description || " "}
                      </Typography>
                      {gameCategories[game.category]?.name && <Chip color="primary" label={gameCategories[game.category]?.name || ''} />}
                      {gameTypesRaw[gameTypes[parseInt(activeTab)]]?.name && <Chip color="primary" sx={{ ml: 1 }} label={gameTypesRaw[gameTypes[parseInt(activeTab)]]?.name || ''} />}
                      {Number(game.version) < 1 && <Chip color="warning" sx={{ ml: 1 }} label={(Number(game.version) < 1) ? 'Beta' : ''} />}
                    </Box>
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
            </Box>
          );
        })}
      </Box>
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
