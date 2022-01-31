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
import { DataContext, PointsCacheContext } from "hooks";
import { get, omitBy } from "lodash";
import { set } from "lodash/fp";
import { useSnackbar } from "notistack";
import React, { useContext, useState } from "react";
import Tour from "reactour";
import { DataAPI, mergeGlobalData } from "utils/data";
import { readFileContent } from "utils/files";
import { v4 as uuidv4 } from "uuid";
import { Factions } from "./factions";
import { MissionGenerator } from "./mission_generator";
import { Overview } from "./overview";
import { Rules } from "./rules";


const allSteps = [];
const steps = [
  [
    {
      selector: "#tab-0",
      content:
        "This is the module overview. This gives you background information and an overview of the game module.",
      stepInteraction: false,
    },
  ],
  [
    {
      selector: "#tab-1",
      content:
        "These are the game rules. This gives you the core rules of the game module.",
      stepInteraction: false,
    },
    {
      selector: ".terrain-card:first-of-type",
      content:
        "This is a piece of terrain. It contains a brief description of what it might look like and any assocaited rules.",
      stepInteraction: false,
    },
    {
      selector: ".mission-card:first-of-type",
      content:
        "This is a scenario. Each scenario has its own way to score victory points and deployment conditions.",
      stepInteraction: false,
    },
    {
      selector: ".secondary-card:first-of-type",
      content:
        "This is a secondary objective. Player can select one of these to be the secondary objective for the mission.",
      stepInteraction: false,
    },
    {
      selector: ".twist-card:first-of-type",
      content:
        "This is a twist. Player can select one of these to add an interesting twist to the mission.",
      stepInteraction: false,
    },
  ],
  [
    {
      selector: "#tab-4",
      content:
        "This is the factions list. This gives you a list of all factions in the module. Factions can sometimes be grouped into alliances.",
      stepInteraction: false,
    },
    {
      selector: ".faction-card:first-of-type",
      content:
        "This is a faction. It contains a brief description of the faction and clicking on it will bring you to the roster for that faction.",
      stepInteraction: false,
    },
  ],
  [
    {
      selector: "#tab-3",
      content:
        "This is the scenarios tab. It can give you a random scenario to play with optional parameters.",
      stepInteraction: false,
    },
    {
      selector: "#generateScenario",
      content:
        "Pressing this button will generate a new scenario for you to play with a random mission, secondary and optional twist.",
      stepInteraction: false,
    },
  ],
  [
    {
      selector: "#tab-4",
      content:
        "This is the rosters tab. It allows you to create rosters to play this game module.",
      stepInteraction: false,
    },
    {
      selector: "#createList",
      content:
        "Pressing this button will open the force creator and allow you to give the force a name and choose a type.",
      stepInteraction: false,
    },
    {
      selector: "#importList",
      content:
        "Pressing this button will allow you to import a force from a file into the force manager.",
      stepInteraction: false,
    },
    {
      selector: "#list-manager",
      content:
        "This is the force manager. It contains all your previously created lists. You can click on the name of a list to go to it or click the ellipses to edit or delete the list properties.",
      stepInteraction: false,
    },
  ],
];

export default React.memo((props) => {
  const { gameName } = props.match.params;
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
  const [isTourOpen, setIsTourOpen] = useState(false);
  const fileDialog = React.useRef();
  // const history = useHistory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  // const addList = (listName, data) => {
  //   const listId = uuidv4();
  //   setLists({
  //     ...lists,
  //     [listId]: {
  //       name: listName,
  //       ...data,
  //     },
  //   });
  //   goToList(listId);
  // };
  // const goToList = (listId) =>
  //   history.push(`/games/${gameName}/lists/${listId}`);
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
  const [activeTab, setActiveTab] = useState(get(appState, "factionTab", 2));
  const cache = useContext(PointsCacheContext);
  const globalData = mergeGlobalData(game, nope);
  const data = DataAPI(game, cache, globalData);
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
            cache.resetCache();
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
        cache.resetCache();
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
  // const [showAddList, hideAddList] = useModal(
  //   ({ extraProps }) => (
  //     <AddList
  //       {...props}
  //       hideModal={hideAddList}
  //       lists={lists}
  //       data={data}
  //       addList={addList}
  //       {...extraProps}
  //     />
  //   ),
  //   [lists]
  // );
//   <SpeedDial
//   ariaLabel="SpeedDial tooltip example"
//   sx={{ position: "fixed", bottom: 16, right: 16 }}
//   icon={<SpeedDialIcon />}
//   onClose={(event) => {
//     if (event.type === 'click' || event.type === 'blur') {
//       setDialOpen(false);
//     }
//   }}
//   onOpen={(event) => {
//     if (event.type === 'click') {
//       setDialOpen(true);
//     }
//   }}
//   open={dialOpen && show}
//   hidden={!show}
// >
//   {/* {activeTab === 4 && <> <Button id="addFaction" title="Add new faction." style={{ marginRight: '5px', width: '42px' }} color="primary" onClick={() => { showAddList() }}><FontAwesomeIcon icon={faPlus} /></Button></>} */}
//   {activeTab === 4 && (
//     <SpeedDialAction
//       tooltipOpen
//       FabProps={{
//         sx: {
//           backgroundColor: theme.palette.primary.main,
//           color: theme.palette.getContrastText(theme.palette.primary.main)
//         }
//       }}
//       id="createList"
//       tooltipTitle="Create"
//       onClick={() => {
//         showAddList();
//       }}
//       icon={<AddIcon />}
//     />
//   )}
//   {activeTab === 4 && (
//     <SpeedDialAction
//       tooltipOpen
//       FabProps={{
//         sx: {
//           backgroundColor: theme.palette.primary.main,
//           color: theme.palette.getContrastText(theme.palette.primary.main)
//         }
//       }}
//       tooltipTitle="Import"
//       id="importList"
//       onClick={handleClick}
//       icon={<UploadIcon />}
//     />
//   )}
//   {activeTab !== 4 && (
//     <SpeedDialAction
//       tooltipOpen
//       FabProps={{
//         sx: {
//           backgroundColor: theme.palette.primary.main,
//           color: theme.palette.getContrastText(theme.palette.primary.main)
//         }
//       }}
//       id="refreshFactions"
//       tooltipTitle="Refresh"
//       onClick={refreshFactions}
//       icon={<RefreshIcon />}
//     />
//   )}
//   {userPrefs.developerMode && activeTab !== 4 && (
//     <SpeedDialAction
//       tooltipOpen
//       FabProps={{
//         sx: {
//           backgroundColor: theme.palette.primary.main,
//           color: theme.palette.getContrastText(theme.palette.primary.main)
//         }
//       }}
//       id="importFaction"
//       tooltipTitle="Import"
//       onClick={handleClick}
//       icon={<UploadIcon />}
//     />
//   )}
//   {!!game.reportUrl && (
//     <SpeedDialAction
//       tooltipOpen
//       FabProps={{
//         sx: {
//           backgroundColor: theme.palette.primary.main,
//           color: theme.palette.getContrastText(theme.palette.primary.main)
//         }
//       }}
//       id="reportModuleIssue"
//       tooltipTitle="Issue"
//       onClick={() => window.open(game.reportUrl, "_blank")}
//       icon={<BugReportIcon />}
//     />
//   )}
//   <SpeedDialAction
//     tooltipOpen
//     FabProps={{
//       sx: {
//         backgroundColor: theme.palette.primary.main,
//         color: theme.palette.getContrastText(theme.palette.primary.main)
//       }
//     }}
//     tooltipTitle="Top"
//     color="primary"
//     onClick={scrollToTop}
//     icon={<KeyboardArrowUpIcon />}
//   />
// </SpeedDial>
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
    ),
    // Rosters: (
    //   <ForceBuilder
    //     data={data}
    //     game={game}
    //     gameName={gameName}
    //     lists={lists}
    //     setLists={setLists}
    //     goToList={goToList}
    //     showModal={showEditList}
    //     nameFilter={nameFilter}
    //   />
    // ),
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
      {/* {!bannerHidden && (
        <Alert sx={{ mb: 2 }} severity="info" variant="filled" onClose={hideBanner}> <Link onClick={() => {
          setActiveTab(4);
          hideBanner();
        }} color="inherit">Click here to try the new Roster creator to create a list.</Link>
        </Alert>
      )} */}
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
        {/* {!!game.author && (
          <Dropdown>
            {({ handleClose, open, handleOpen, anchorElement }) => (
              <>
                <IconButton
                  aria-haspopup="true"
                  onClick={handleOpen}
                  onMouseEnter={handleOpen}
                  onMouseLeave={handleClose} style={{ marginRight: '5px' }}>
                  <PersonIcon />
                </IconButton>
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
                  <Typography sx={{ p: 1 }}>{`Written by ${game.author}`}</Typography>
                </Popover>
              </>
            )}
          </Dropdown>
        )} */}
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
              value={activeTab}
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
      {/* <HideOnScroll>
        {({ show }) => (
          <SpeedDial
            ariaLabel="SpeedDial tooltip example"
            sx={{ position: "fixed", bottom: 16, right: 16 }}
            icon={<SpeedDialIcon />}
            onClose={(event) => {
              if (event.type === 'click' || event.type === 'blur') {
                setDialOpen(false);
              }
            }}
            onOpen={(event) => {
              if (event.type === 'click') {
                setDialOpen(true);
              }
            }}
            open={dialOpen && show}
            hidden={!show}
          >
            {activeTab === 4 && <> <Button id="addFaction" title="Add new faction." style={{ marginRight: '5px', width: '42px' }} color="primary" onClick={() => { showAddList() }}><FontAwesomeIcon icon={faPlus} /></Button></>}
            {activeTab === 4 && (
              <SpeedDialAction
                tooltipOpen
                FabProps={{
                  sx: {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.getContrastText(theme.palette.primary.main)
                  }
                }}
                id="createList"
                tooltipTitle="Create"
                onClick={() => {
                  showAddList();
                }}
                icon={<AddIcon />}
              />
            )}
            {activeTab === 4 && (
              <SpeedDialAction
                tooltipOpen
                FabProps={{
                  sx: {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.getContrastText(theme.palette.primary.main)
                  }
                }}
                tooltipTitle="Import"
                id="importList"
                onClick={handleClick}
                icon={<UploadIcon />}
              />
            )}
            {activeTab !== 4 && (
              <SpeedDialAction
                tooltipOpen
                FabProps={{
                  sx: {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.getContrastText(theme.palette.primary.main)
                  }
                }}
                id="refreshFactions"
                tooltipTitle="Refresh"
                onClick={refreshFactions}
                icon={<RefreshIcon />}
              />
            )}
            {userPrefs.developerMode && activeTab !== 4 && (
              <SpeedDialAction
                tooltipOpen
                FabProps={{
                  sx: {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.getContrastText(theme.palette.primary.main)
                  }
                }}
                id="importFaction"
                tooltipTitle="Import"
                onClick={handleClick}
                icon={<UploadIcon />}
              />
            )}
            {!!game.reportUrl && (
              <SpeedDialAction
                tooltipOpen
                FabProps={{
                  sx: {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.getContrastText(theme.palette.primary.main)
                  }
                }}
                id="reportModuleIssue"
                tooltipTitle="Issue"
                onClick={() => window.open(game.reportUrl, "_blank")}
                icon={<BugReportIcon />}
              />
            )}
            <SpeedDialAction
              tooltipOpen
              FabProps={{
                sx: {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.getContrastText(theme.palette.primary.main)
                }
              }}
              tooltipTitle="Top"
              color="primary"
              onClick={scrollToTop}
              icon={<KeyboardArrowUpIcon />}
            />
          </SpeedDial>
        )}
      </HideOnScroll> */}
      <div>
        {/* {Object.values(TABS).map((pane, index) => (
          <div
            id={`tab-${index}`}
            tabId={index}
            style={{ display: activeTab === index ? "" : "none" }}
          >
            {pane}
          </div>
        ))} */}
        {Object.values(TABS)[activeTab]}
      </div>
      <Tour
        accentColor={`rgb(57, 110, 158)`}
        className="tour"
        key={activeTab}
        steps={[...allSteps, ...(steps[activeTab] || [])]}
        isOpen={isTourOpen}
        onRequestClose={() => {
          setIsTourOpen(false);
        }}
        rounded={5}
        onAfterOpen={(target) => (document.body.style.overflowY = "hidden")}
        onBeforeClose={(target) => (document.body.style.overflowY = "auto")}
      />
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
});
