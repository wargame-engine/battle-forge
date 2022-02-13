import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import UploadIcon from '@mui/icons-material/Upload';
import {
  Card,
  CardContent,
  CardHeader,
  Container, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Menu,
  MenuItem
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CustomCircularProgress from "components/CustomCircularProgress";
import { Dropdown } from "components/dropdown";
import { DataContext, PointsCacheContext, useModal } from "hooks";
import { get, groupBy, omit, sortBy } from "lodash";
import { useSnackbar } from "notistack";
import React from 'react';
import { useNavigate, useParams } from 'react-router';
import { useLocation } from "react-router-dom";
import Tour from "reactour";
import { AddList, UpdateList } from 'routes/rosters/modals';
import { DataAPI, mergeGlobalData } from "utils/data";
import { downloadFile, readFileContent } from "utils/files";
import { v4 as uuidv4 } from "uuid";

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
      userPrefs,
      setAppState
    },
  ] = React.useContext(DataContext);
  const nameFilter = appState?.searchText;
  const [isTourOpen, setIsTourOpen] = React.useState(false);
  const fileDialog = React.useRef();
  const navigate = useNavigate();
  // const theme = useTheme();
  const location = useLocation();
  const queryParams = React.useMemo(() => new URLSearchParams(location.search), [location.search]);
  const shareData = queryParams?.get("listShare");
    // Default active tab!!!
    const [activeTab] = React.useState(get(appState, "factionTab", 2));
    const cache = React.useContext(PointsCacheContext);
    const game = get(nope, `gameData.games[${gameName}]`, {});
    const coreGame = get(coreData, `gameData.games[${gameName}]`, {});
    React.useEffect(() => {
      if (!game.factions || (!coreGame.factions && !isLoading)) {
        fetchGame(gameName);
      }
    }, [coreData, coreGame.factions, fetchGame, game.factions, gameName, isLoading]);
    const globalData = mergeGlobalData(game, nope);
    const data = DataAPI(game, cache, globalData);
    const gamesRaw = get(nope, `gameData.games`, {});
    const rawLists = get(nope, `lists`, []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const lists = {};
    Object.keys(rawLists).forEach((listId) => {
      const list = rawLists[listId];
      const gameId = list?.gameId;
      if (gameId && gamesRaw[gameId]) {
        lists[listId] = { ...list, id: listId };
      }
    });
    const listsByGame = groupBy(Object.values(lists), 'gameId');
  const { enqueueSnackbar } = useSnackbar();
  const setLists = React.useCallback((listData) => {
    const newGameData = {
      ...coreData,
      lists: {
        ...listData
      }
    };
    setData(newGameData);
  }, [coreData, setData]);
  const importList = React.useCallback((listObject) => {
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
      enqueueSnackbar(`List '${listName}' successfully imported.`, {
        appearance: "success",
      });
    }
  }, [enqueueSnackbar, lists, setLists])
  React.useEffect(() => {
    if (!shareData) {
      return;
    }
    let listObject = {};
    try {
      listObject = JSON.parse(atob(shareData));
    } catch (e) {
      return Promise.reject(e);
    }
    importList(listObject);
    queryParams.set('share', '');
    navigate({
      search: queryParams?.toString(),
    }, { replace: true });
  }, [navigate, importList, queryParams, shareData]);
  const addList = (listName, data) => {
    const listId = uuidv4();
    setLists({
      ...lists,
      [listId]: {
        name: listName,
        ...data,
      },
    });
    goToList(listId);
  };
  const updateList = (listId, newData) => {
    setLists({
      ...lists,
      [listId]: {
        ...get(lists, `[${listId}]`, {}),
        ...newData,
      },
    });
  };
  const goToList = (listId) =>
    navigate(`/lists/${listId}`);
  const handleClick = () => {
    fileDialog.current.click();
  };

  // const copyToClipboard = (message, text) => {
  //   navigator.clipboard.writeText(text).then(function() {
  //     enqueueSnackbar(message, {
  //       appearance: "success",
  //     });
  //   }, function(err) {
  //     enqueueSnackbar(`Failed to write to clipboard.`, {
  //       appearance: "error",
  //     });
  //   });
  // }
  const uploadFile = (event) => {
    uploadList(event);
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
          importList(listObject);
        })
        .catch((error) => {
          enqueueSnackbar(`List failed to import. ${error.message}`, {
            appearance: "error",
          });
        });
    }
    fileDialog.current.value = null;
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
  const [showAddList, hideAddList] = useModal(
    ({ extraProps }) => (
      <AddList
        {...props}
        rawData={nope}
        userPrefs={userPrefs}
        hideModal={hideAddList}
        lists={lists}
        data={data}
        addList={addList}
        {...extraProps}
      />
    ),
    [lists]
  );
  // const [showShareList, hideShareList] = useModal(
  //   ({ extraProps }) => (
  //     <ShareList
  //       {...props}
  //       hideModal={hideShareList}
  //       copyToClipboard={copyToClipboard}
  //       {...extraProps}
  //     />
  //   ),
  //   [lists]
  // );
  const [showEditList, hideEditList] = useModal(
    ({ extraProps }) => (
      <UpdateList
        {...props}
        hideModal={hideEditList}
        lists={lists}
        data={data}
        updateList={updateList}
        {...extraProps}
      />
    ),
    [lists]
  );

  const deleteList = (id) => {
    setLists(omit(lists, [id]));
  };
  const downloadList = (id) => {
    downloadFile(
      JSON.stringify(
        {
          ...get(lists, `[${id}]`),
        },
        null,
        2
      ),
      "data:text/json",
      `${get(lists, `[${id}].name`, id)}.json`
    );
  };
  // const shareList = (id) => {
  //   const list = get(lists, `[${id}]`);
  //   const listData = btoa(JSON.stringify(list));
  //   showShareList({ listData, listName: list?.name });
  // };
  React.useEffect(() => {
    setAppState({
      enableSearch: true,
      contextActions: [
        {
          name: 'Create',
          icon: <AddIcon />,
          onClick: () => {
            showAddList()
          }
        },
        {
          name: 'Import',
          icon: <UploadIcon />,
          onClick: () => {
            handleClick()
          }
        },
        {
          name: 'Refresh',
          icon: <RefreshIcon />,
          onClick: () => {
            refreshFactions()
          }
        }
      ]
    })
    return () => {
      setAppState({
        contextActions: []
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // const [dialOpen, setDialOpen] = React.useState(false);
  if (!data) {
    return (
      <Box sx={{ textAlign: "center" }}>
        <CustomCircularProgress />
      </Box>
    );
  }
  const factionColor = ' rgb(57, 110, 158)';
  const textColor = 'white';
  const filteredCategories = Object.keys(listsByGame);

  return (
    <Container>
      <>
        <Typography variant="h3" align="center" sx={{ mb: 2 }}>
          Rosters
        </Typography>
        <Card
          className="no-break"
          sx={{
            border: `2px solid ${factionColor}`,
            mb: 2,
          }}
        >
          <CardHeader
            sx={{ backgroundColor: factionColor, color: textColor, py: 1 }}
            title={
              <>
                <Typography variant="h5" component="div">
                  Manage Rosters
                </Typography>
              </>
            }
          // action={
          //   <Dropdown>
          //     {({ handleClose, open, handleOpen, anchorElement }) => (
          //       <>
          //         <IconButton sx={{ color: 'inherit', mr: 1 }} onClick={handleOpen}>
          //           <MoreVertIcon />
          //         </IconButton>
          //         <Menu
          //           anchorOrigin={{
          //             vertical: "bottom",
          //             horizontal: "right",
          //           }}
          //           transformOrigin={{
          //             vertical: "top",
          //             horizontal: "right",
          //           }}
          //           anchorEl={anchorElement}
          //           id="basic-menu"
          //           open={open}
          //           onClose={handleClose}
          //           MenuListProps={{
          //             dense: true,
          //             onClick: handleClose,
          //             "aria-labelledby": "basic-button",
          //           }}
          //         >


          //         </Menu>
          //       </>
          //     )}
          //   </Dropdown>

          // }
          />
          <CardContent
            style={{ padding: (filteredCategories.length) ? 0 : undefined }}
          >
            {!! filteredCategories.length && <List>
              {filteredCategories.map((catKey, catIndex) => {
                const category = gamesRaw[catKey];
                const categoryLists = listsByGame[catKey];
                const filteredLists = sortBy(
                  categoryLists.filter((list) =>
                    nameFilter
                      ? list.name.toLowerCase().includes(nameFilter.toLowerCase())
                      : true
                  ),
                  "name"
                );
                if (!category) {
                  return <></>;
                }
                return (
                  <>
                    <ListItem
                      key={catIndex}
                      // secondaryAction={
                      //   <>
                      //     {!!editMode && (
                      //       <IconButton
                      //         sx={{ color: "primary.main" }}
                      //         onClick={() => {}}
                      //       >
                      //         <AddIcon />
                      //       </IconButton>
                      //     )}
                      //   </>
                      // }
                      disablePadding
                    >
                      <ListSubheader sx={{ flex: 1, zIndex: 0, backgroundColor: 'background.paper' }}>
                        <Typography
                          sx={{ py: 1 }}
                          fontWeight="bold"
                          variant="h6"
                        >
                          {category.name}
                        </Typography>
                      </ListSubheader>
                    </ListItem>
                    {filteredLists
                      .map((list, unitIdx) => {
                        return (
                          <>
                            <ListItem
                              key={unitIdx}
                              secondaryAction={
                                <Dropdown>
                                  {({ handleClose, open, handleOpen, anchorElement }) => (
                                    <>
                                      <IconButton sx={{ color: 'primary.main' }} onClick={handleOpen}>
                                        <MoreVertIcon />
                                      </IconButton>
                                      <Menu
                                        anchorOrigin={{
                                          vertical: "bottom",
                                          horizontal: "right",
                                        }}
                                        transformOrigin={{
                                          vertical: "top",
                                          horizontal: "right",
                                        }}
                                        anchorEl={anchorElement}
                                        id="basic-menu"
                                        open={open}
                                        onClose={handleClose}
                                        MenuListProps={{
                                          dense: true,
                                          onClick: handleClose,
                                          "aria-labelledby": "basic-button",
                                        }}
                                      >
                                        <MenuItem onClick={() => goToList(list.id)}>
                                          <ListItemIcon>
                                            <EditIcon />
                                          </ListItemIcon>
                                          <ListItemText>Edit</ListItemText>
                                        </MenuItem>
                                        <MenuItem
                                          onClick={() => showEditList({ listId: list.id })}
                                        >
                                          <ListItemIcon>
                                            <SettingsIcon />
                                          </ListItemIcon>
                                          <ListItemText>Settings</ListItemText>
                                        </MenuItem>
                                        <MenuItem onClick={() => downloadList(list.id)}>
                                          <ListItemIcon>
                                            <DownloadIcon />
                                          </ListItemIcon>
                                          <ListItemText>Download</ListItemText>
                                        </MenuItem>
                                        {/* <MenuItem onClick={() => shareList(list.id)}>
                                          <ListItemIcon>
                                            <ShareIcon />
                                          </ListItemIcon>
                                          <ListItemText>Share</ListItemText>
                                        </MenuItem> */}
                                        <MenuItem onClick={() => deleteList(list.id)}>
                                          <ListItemIcon>
                                            <DeleteIcon />
                                          </ListItemIcon>
                                          <ListItemText>Delete</ListItemText>
                                        </MenuItem>
                                      </Menu>
                                    </>
                                  )}
                                </Dropdown>
                              }
                              disablePadding
                            >
                              <ListItemButton
                                onClick={() => goToList(list.id)}
                              >
                                <ListItemText
                                  primary={list.name}
                                />
                              </ListItemButton>
                            </ListItem>
                          </>
                        );
                      })}
                  </>
                );
              })}
            </List>}
            {!filteredCategories.length && <>
              <Typography>No created lists. Click the <AddIcon /> Button in the top right to get started.</Typography>
            </>}
          </CardContent>
        </Card>
      </>
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
