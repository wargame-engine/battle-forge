import {
  faExclamationCircle
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BugReportIcon from '@mui/icons-material/BugReport';
import RefreshIcon from '@mui/icons-material/Refresh';
import UploadIcon from '@mui/icons-material/Upload';
import {
  Container
} from "@mui/material";
import Box from "@mui/material/Box";
import Popover from "@mui/material/Popover";
import { useTheme } from "@mui/material/styles";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import CustomCircularProgress from "components/CustomCircularProgress";
import { Dropdown } from "components/dropdown";
import { DataContext } from "hooks";
import useQueryParams from 'hooks/use-query-params';
import { get, omitBy } from "lodash";
import { set } from "lodash/fp";
import { useSnackbar } from "notistack";
import React, { useContext } from "react";
import { useParams } from "react-router";
import { DataAPI, mergeGlobalData } from "utils/data";
import { readFileContent } from "utils/files";
import { v4 as uuidv4 } from "uuid";
import { Factions } from "./factions";
import { MissionGenerator } from "./mission_generator";
import { Overview } from "./overview";
import { Rules } from "./rules";

const FactionsMain = () => {
  const { gameName } = useParams();
  const [
    {
      data: nope,
      coreData,
      fetchGame,
      setData,
      refreshData,
      isLoading,
      appState,
      setAppState,
      userPrefs,
    },
  ] = useContext(DataContext);
  const nameFilter = appState?.searchText;
  
  const fileDialog = React.useRef();
  // const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const handleClick = () => {
    fileDialog.current.click();
  };
  const game = get(nope, `gameData.games[${gameName}]`, {});
  const coreGame = get(coreData, `gameData.games[${gameName}]`, {});
  React.useEffect(() => {
    if (!game.factions || (!coreGame.factions && !isLoading)) {
      fetchGame(gameName);
    }
  }, [coreData, coreGame.factions, fetchGame, game.factions, gameName, isLoading]);
  // Default active tab!!!
  let [ activeTab, setActiveTab ] = useQueryParams("tab", 2);
  const globalData = mergeGlobalData(game, nope);
  const data = DataAPI(game, globalData);
  const { enqueueSnackbar } = useSnackbar();
  const lists = get(nope, `lists[${gameName}]`, []);
  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
    setAppState({ ...appState, factionTab: tab });
  };
  const uploadFile = (event) => {
    if (activeTab === 4) {
      uploadList(event);
    } else {
      uploadFaction(event);
    }
  };
  const uploadList = (event) => {
    event.preventDefault();
    const file = get(event, "target.files[0]");
    if (file) {
      readFileContent(file)
        .then((content) => {
          let listObject = {};
          try {
            listObject = JSON.parse(content);
          } catch (e) {
            return Promise.reject(e);
          }
          if (listObject.forces) {
            const newArmyData = {
              ...listObject,
            };
            const listName = listObject.name;
            const listId = uuidv4();
            setLists({
              ...lists,
              [listId]: {
                name: listName,
                ...newArmyData,
              },
            });
            enqueueSnackbar(`List successfully imported.`, {
              appearance: "success",
            });
          }
        })
        .catch((error) => {
          enqueueSnackbar(`List failed to import. ${error.message}`, {
            appearance: "error",
          });
        });
    }
    fileDialog.current.value = null;
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
          } else if (armyObject.factions) {
            const newData = set(
              `games[${gameName}]`,
              { ...get(nope, `customData.games[${gameName}]`), ...armyObject },
              get(nope, "customData", {})
            );
            setCustomData(newData);
            enqueueSnackbar(`Core data successfully imported.`, {
              appearance: "success",
            });
          } else if (armyObject.id) {
            const newData = set(
              `games[${gameName}].factions[${armyObject.id}]`,
              {
                ...get(`games[${gameName}].factions[${armyObject.id}]`, {}),
                ...armyObject,
              },
              get(nope, "customData", {})
            );
            setCustomData(newData);
            enqueueSnackbar(`${armyObject.name} successfully imported.`, {
              appearance: "success",
            });
          } else {
            enqueueSnackbar(`Faction failed to find data to import.`, {
              appearance: "error",
            });
          }
        })
        .catch((error) => {
          enqueueSnackbar(`Faction failed to import. ${error.message}`, {
            appearance: "error",
          });
        });
    }
    fileDialog.current.value = null;
  };
  const deleteFaction = (factionId) => {
    const newFactionList = omitBy(
      get(nope, `customData.games[${gameName}].factions`, {}),
      (faction) => faction.id === factionId
    );
    const armyData = {
      ...get(nope, "customData", {}),
      games: {
        ...get(nope, "customData.games", {}),
        [gameName]: {
          ...get(nope, `customData.games[${gameName}]`, {}),
          factions: newFactionList,
        },
      },
    };
    enqueueSnackbar(
      `${data.getFaction(factionId).name} successfully deleted.`,
      {
        appearance: "success",
      }
    );
    setCustomData(armyData);
  };
  const refreshFactions = () => {
    refreshData(gameName)
      .then(() => {
        enqueueSnackbar(`Game data successfully updated.`, {
          appearance: "success",
        });
      })
      .catch((error) => {
        enqueueSnackbar(`Game failed to fetch factions. ${error.message}`, {
          appearance: "error",
        });
      });
  };
  const setLists = (listData) => {
    const newGameData = {
      ...coreData,
      lists: {
        ...get(nope, "lists", {}),
        [gameName]: {
          ...listData,
        },
      },
    };
    setData(newGameData);
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
  React.useEffect(() => {
    setAppState({
      enableSearch: true,
      contextActions: [
        {
          name: 'Refresh',
          icon: <RefreshIcon />,
          onClick: () => refreshFactions()
        },
        ...(!!userPrefs.developerMode ? [
          {
            name: 'Import',
            icon: <UploadIcon />,
            onClick: () => handleClick()
          }
        ] : []),
        ...(!!game.reportUrl ? [
          {
            name: 'Report',
            icon: <BugReportIcon />,
            onClick: () => window.open(game.reportUrl, "_blank")
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
  if (!data) {
    return (
      <Box sx={{ textAlign: "center" }}>
        <CustomCircularProgress />
        <input
          id="file-Form.Control"
          type="file"
          name="name"
          multiple
          ref={fileDialog}
          onChange={uploadFile}
          style={{ height: "0px", overflow: "hidden" }}
        />
      </Box>
    );
  }
  let TABS = {
    Overview: <Overview data={data} game={game} />,
    Rules: (
      <Rules
        data={data}
        game={game}
        rawData={nope}
        gameName={gameName}
        nameFilter={nameFilter}
      />
    ),
    Factions: (
      <Factions
        data={data}
        game={game}
        gameName={gameName}
        setData={setData}
        rawData={nope}
        userPrefs={userPrefs}
        deleteFaction={deleteFaction}
        nameFilter={nameFilter}
      />
    ),
    Scenarios: (
      <MissionGenerator
        data={data}
        game={game}
        gameName={gameName}
        setData={setData}
        rawData={nope}
        nameFilter={nameFilter}
      />
    )
  };
  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }
  const handleChange = (event, newValue) => {
    toggle(newValue);
  };
  const isModified = Object.values(
    get(nope, `customData.games[${gameName}]`, {})
  ).length;
  return (
    <Container>
      <Typography variant="h3" align="center" sx={{ mb: 2 }}>
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
        {game.name}
        <small style={{ marginLeft: '5px', fontSize: '1rem' }}> {game.version ? `(${game.version})` : ""}</small>
      </Typography>
      <Box
        className="sticky"
        sx={{
          width: "100%",
          bgcolor: "background.paper",
          top: isMobile ? "56px" : "64px",
        }}
      >
        <Box sx={{ width: "100%", bgcolor: "background.paper", pb: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              variant="scrollable"
              value={parseInt(activeTab) || 0}
              onChange={handleChange}
            >
              {Object.keys(TABS).map((tab, index) => (
                <Tab
                  sx={{ textTransform: "none" }}
                  label={tab}
                  {...a11yProps(0)}
                />
              ))}
            </Tabs>
          </Box>
        </Box>
      </Box>
      <div>
        {Object.values(TABS)[activeTab]}
      </div>
      <input
        id="file-Form.Control"
        type="file"
        name="name"
        multiple
        ref={fileDialog}
        onChange={uploadFile}
        style={{ height: "0px", overflow: "hidden" }}
      />
    </Container>
  );
};

export default FactionsMain;
