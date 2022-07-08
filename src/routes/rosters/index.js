import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RefreshIcon from '@mui/icons-material/Refresh';
import UploadIcon from '@mui/icons-material/Upload';
import ShareIcon from '@mui/icons-material/Share';
import {
  Card,
  CardContent,
  CardHeader,
  Container, IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Menu,
  MenuItem,
  useTheme
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CustomCircularProgress from "components/CustomCircularProgress";
import { Dropdown } from "components/dropdown";
import { DataContext, useModal } from "hooks";
import { get, groupBy, omit, sortBy } from "lodash";
import { useSnackbar } from "notistack";
import React from 'react';
import { useNavigate, useParams } from 'react-router';
import { useLocation } from "react-router";
import { AddList, UpdateList, ShareList } from 'routes/rosters/modals';
import { DataAPI, mergeGlobalData } from "utils/data";
import { downloadFile, readFileContent } from "utils/files";
import { v4 as uuidv4 } from "uuid";

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
  const fileDialog = React.useRef();
  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();
  const queryParams = React.useMemo(() => new URLSearchParams(location.search), [location.search]);
  const shareData = queryParams?.get("share");
    const game = get(nope, `gameData.games[${gameName}]`, {});
    const coreGame = get(coreData, `gameData.games[${gameName}]`, {});
    React.useEffect(() => {
      if (!game.factions || (!coreGame.factions && !isLoading)) {
        fetchGame(gameName);
      }
    }, [coreData, coreGame.factions, fetchGame, game.factions, gameName, isLoading]);
    const globalData = mergeGlobalData(game, nope);
    const data = DataAPI(game, globalData);
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
    queryParams.delete('share');
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

  const copyToClipboard = (message, text) => {
    navigator.clipboard.writeText(text).then(function() {
      enqueueSnackbar(message, {
        appearance: "success",
      });
    }, function(err) {
      enqueueSnackbar(`Failed to write to clipboard.`, {
        appearance: "error",
      });
    });
  }
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
  const [showShareList, hideShareList] = useModal(
    ({ extraProps }) => (
      <ShareList
        {...props}
        hideModal={hideShareList}
        copyToClipboard={copyToClipboard}
        {...extraProps}
      />
    ),
    [lists]
  );
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
  const shareList = (id) => {
    const list = get(lists, `[${id}]`);
    const listData = btoa(JSON.stringify(list));
    showShareList({ listData, listName: list?.name });
  };
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
  const factionColor = theme.palette.primary.main;
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
                <Typography fontSize="1.25rem" fontWeight="bold" component="div">
                  Manage Rosters
                </Typography>
              </>
            }
          />
          <CardContent
            style={{ padding: (filteredCategories.length) ? 0 : undefined }}
          >
            {!! filteredCategories.length && <>
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
                      disablePadding
                    >
                      <ListSubheader sx={{ flex: 1, backgroundColor: 'background.paper', color: 'inherit' }}>
                        <Typography
                            sx={{ py: 1.5 }}
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
                                      <IconButton sx={{ mr: -1 }} onClick={handleOpen}>
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
                                          dense: false,
                                          onClick: handleClose,
                                          "aria-labelledby": "basic-button",
                                        }}
                                      >
                                        <MenuItem onClick={() => showEditList({ listId: list.id })}>
                                          <ListItemIcon>
                                            <EditIcon />
                                          </ListItemIcon>
                                          <ListItemText>Edit</ListItemText>
                                        </MenuItem>
                                        <MenuItem onClick={() => downloadList(list.id)}>
                                          <ListItemIcon>
                                            <DownloadIcon />
                                          </ListItemIcon>
                                          <ListItemText>Download</ListItemText>
                                        </MenuItem>
                                        <MenuItem onClick={() => shareList(list.id)}>
                                          <ListItemIcon>
                                            <ShareIcon />
                                          </ListItemIcon>
                                          <ListItemText>Share</ListItemText>
                                        </MenuItem>
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
                                sx={{ py: 1.5 }}
                                onClick={() => goToList(list.id)}
                              >
                                {list.name}
                              </ListItemButton>
                            </ListItem>
                          </>
                        );
                      })}
                  </>
                );
              })}
            </>}
            {!filteredCategories.length && <>
              <Typography>No created lists. Click the <AddIcon /> Button in the top right to get started.</Typography>
            </>}
          </CardContent>
        </Card>
      </>
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
