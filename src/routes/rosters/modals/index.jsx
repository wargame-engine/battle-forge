import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormLabel, ListItem, ListItemButton, ListItemText, ListSubheader, Paper, Radio, RadioGroup, Stack, TextField, Typography
} from "@mui/material";
import useTheme from "@mui/material/styles/useTheme";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  get, groupBy, sortBy
} from "lodash";
import React, {
  useState
} from "react";

const LIST_TYPES = [
  { label: "Competitive", value: "competitive" },
  { label: "Narrative", value: "narrative" },
  { label: "Campaign", value: "campaign" }
];
export const AddListOld = (props) => {
  const { hideModal, addList } = props;
  const [listName, setListName] = useState("");
  const [listType, setListType] = useState("competitive");
  return (
    <>
      <Dialog open maxWidth="md" fullWidth onClose={hideModal}>
        <DialogTitle closeButton>Create Roster</DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Paper sx={{ p: 2}} style={{ height: '100%', borderRadius: 0, overflowY: 'auto' }}>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <FormControl>
                <TextField
                  size="small"
                  id="standard-basic"
                  label="Force Name"
                  variant="outlined"
                  onChange={(value) => setListName(value.target.value)}
                  value={listName}
                />
              </FormControl>
              <FormControl>
                <FormLabel component="legend">List Type</FormLabel>
                <RadioGroup
                  row
                  aria-label="gender"
                  name="row-radio-buttons-group"
                  onChange={(event) => setListType(event.target.value)}
                  value={listType}
                >
                  {LIST_TYPES.map((type, index) => (
                    <FormControlLabel
                      key={index}
                      value={type.value}
                      control={<Radio />}
                      label={type.label}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Stack>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button color="secondary" onClick={hideModal}>
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={() => {
              if (listName) {
                addList(listName, { type: listType });
                hideModal();
              }
            }}
          >
            Create
          </Button>{" "}
        </DialogActions>
      </Dialog>
    </>
  );
};

export const UpdateList = (props) => {
  const { hideModal, updateList, listId, lists } = props;
  const oldListName = get(lists, `[${listId}].name`, "");
  const oldListType = get(lists, `[${listId}].type`, "");
  const [listName, setListName] = useState(oldListName);
  const [listType, setListType] = useState(oldListType || "competitive");
  return (
    <>
      <Dialog open maxWidth="md" fullWidth onClose={hideModal}>
        <DialogTitle>
          Edit Roster
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Paper sx={{ px: 3, py: 2 }} style={{ height: '100%', borderRadius: 0, overflowY: 'auto' }}>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <FormControl>
                <TextField
                  size="small"
                  id="standard-basic"
                  label="Force Name"
                  variant="outlined"
                  onChange={(value) => setListName(value.target.value)}
                  value={listName}
                />
              </FormControl>
              <FormControl>
                <FormLabel component="legend">List Type</FormLabel>
                <RadioGroup
                  row
                  aria-label="gender"
                  name="row-radio-buttons-group"
                  onChange={(event) => setListType(event.target.value)}
                  value={listType}
                >
                  {LIST_TYPES.map((type, index) => (
                    <FormControlLabel
                      key={index}
                      value={type.value}
                      control={<Radio />}
                      label={type.label}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Stack>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button color="secondary" onClick={hideModal}>
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={() => {
              if (listName) {
                updateList(listId, {
                  name: listName,
                  type: listType,
                });
                hideModal();
              }
            }}
          >
            Save
          </Button>{" "}
        </DialogActions>
      </Dialog>
    </>
  );
};

export const ShareList = (props) => {
  const { hideModal, listData, copyToClipboard } = props;
  const url = `${window?.location?.origin?.toString()}/lists?listShare=${listData}`;
  return (
    <>
      <Dialog open maxWidth="md" fullWidth onClose={hideModal}>
        <DialogTitle>
          Share Roster
        </DialogTitle>
        <DialogContent>
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <FormControl style={{ flexGrow: 1 }}>
              <TextField
                fullWidth
                id="standard-basic"
                label="Share Url"
                variant="outlined"
                value={url}
                
              />
            </FormControl>
            <Button onClick={() => copyToClipboard('Successfully copied url to clipboard.', url)}>Copy</Button>
            {/* <FormControl>
              <FormLabel component="legend">List Type</FormLabel>
              <RadioGroup
                row
                aria-label="gender"
                name="row-radio-buttons-group"
                onChange={(event) => setListType(event.target.value)}
                value={listType}
              >
                {LIST_TYPES.map((type, index) => (
                  <FormControlLabel
                    key={index}
                    value={type.value}
                    control={<Radio />}
                    label={type.label}
                  />
                ))}
              </RadioGroup>
            </FormControl> */}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={hideModal}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const AddList = (props) => {
  const { hideModal, userPrefs, addList, rawData } = props;
  const [listName, setListName] = useState("");
  const [listType, setListType] = useState("competitive");
  const [gameId, setGameId] = useState();
  const showBeta = userPrefs.showBeta;
  const gameTypesRaw = {
    ...get(rawData, "gameData.gameTypes", {}),
  };
  const gamesUnsorted = Object.values(get(rawData, `gameData.games`, {})).filter(
    (game) => (showBeta ? true : game.version && Number(game.version) >= 1)
  );
  const gameTypes = [
    ...Object.keys(gameTypesRaw).filter(
      (gameType) =>
        gamesUnsorted.filter((game) => game.gameType === gameType).length
    ),
  ];
  const unitCategories = groupBy(gamesUnsorted, "gameType");
  const categoryOrder = [...gameTypes, undefined].filter(
    (cat) => unitCategories[cat] && unitCategories[cat].length
  );
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <>
      <Dialog
        open
        fullScreen={fullScreen}
        fullWidth
        onClose={hideModal}
        maxWidth="lg"
      >
        {!gameId && (
          <>
            <DialogTitle closeButton>Choose Module</DialogTitle>
            <DialogContent style={{ padding: 0 }} sx={{ backgroundColor: 'background.paper' }}>
              <Paper style={{  height: '100%', borderRadius: 0, overflowY: 'auto' }}>
                {categoryOrder.map((allianceKey) => {
                  const theFactions = sortBy(
                    get(unitCategories, `[${allianceKey}]`, []),
                    "name"
                  );
                  const allianceData = gameTypesRaw[allianceKey];
                  return (
                    <>
                      <ListSubheader sx={{ flex: 1, color: 'inherit' }}>
                        <Typography
                          sx={{ py: 1 }}
                          fontWeight="bold"
                          variant="h5"
                        >
                          {allianceData.name || "Unaligned"}
                        </Typography>
                      </ListSubheader>
                      {Object.keys(theFactions).map((orgKey) => {
                        const org = theFactions[orgKey];
                        return (
                          <ListItem
                            disablePadding
                            // secondaryAction={
                            //   <IconButton
                            //     sx={{ color: "primary.main" }}
                            //     onClick={() => {
                            //       setGameId(org.id);
                            //     }}
                            //   >
                            //     <AddIcon />
                            //   </IconButton>
                            // }
                          >
                            <ListItemButton
                              onClick={() => {
                                setGameId(org.id);
                              }}
                            >
                              <ListItemText
                                primary={
                                  <Typography fontWeight="bold">
                                    {`${org.name}`}
                                    <small>
                                      {org.version ? ` (${org.version})` : ""}
                                    </small>
                                  </Typography>
                                }
                                secondary={<Typography variant="body2">{`${org.description || ""}`}</Typography>}
                              />
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                    </>
                  );
                })}
              </Paper>
            </DialogContent>
            <DialogActions>
              <Button color="primary" onClick={hideModal}>
                Cancel
              </Button>
            </DialogActions>
          </>
        )}
        {!!gameId && <><DialogTitle closeButton>Create Roster</DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            <Paper sx={{ px: 3, py: 2 }} style={{  height: '100%', borderRadius: 0, overflowY: 'auto' }}>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <FormControl>
                  <TextField
                    size="small"
                    id="standard-basic"
                    label="Force Name"
                    variant="outlined"
                    onChange={(value) => setListName(value.target.value)}
                    value={listName}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel component="legend">List Type</FormLabel>
                  <RadioGroup
                    row
                    aria-label="gender"
                    name="row-radio-buttons-group"
                    onChange={(event) => setListType(event.target.value)}
                    value={listType}
                  >
                    {LIST_TYPES.map((type, index) => (
                      <FormControlLabel
                        key={index}
                        value={type.value}
                        control={<Radio />}
                        label={type.label}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Stack>
            </Paper>
          </DialogContent>
          <DialogActions>
            <Button color="secondary" onClick={hideModal}>
              Cancel
            </Button>
            <Button
              color="primary"
              onClick={() => {
                if (listName) {
                  addList(listName, { type: listType, gameId });
                  hideModal();
                }
              }}
            >
              Create
            </Button>{" "}
          </DialogActions>
        </>}
      </Dialog>
    </>
  );
};
