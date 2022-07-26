import {
  Box,
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
import QRious from "qrious";

const LIST_TYPES = [
  { label: "Competitive", value: "competitive" },
  { label: "Narrative", value: "narrative" },
  { label: "Campaign", value: "campaign" }
];

const SHARING_TYPES = [
  { label: "URL", value: "url" },
  { label: "QR Code", value: "qr" }
];

export const UpdateList = (props) => {
  const { hideModal, updateList, listId, lists } = props;
  const oldListName = get(lists, `[${listId}].name`, "");
  const oldPointValue = get(lists, `[${listId}].pointLimit`, "");
  const oldListType = get(lists, `[${listId}].type`, "");
  const [listName, setListName] = useState(oldListName);
  const [pointLimit, setPointLimit] = useState(oldPointValue || 0);
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
                <TextField
                  type="number"
                  size="small"
                  id="standard-basic"
                  label="Point Limit"
                  variant="outlined"
                  onChange={(value) => setPointLimit(value.target.value)}
                  value={pointLimit}
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
                  pointLimit
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
  const [ shareType, setShareType ] = React.useState('url');
  const url = `${window?.location?.origin?.toString()}/#/lists?share=${listData}`;
  const qr = React.useMemo(() => new QRious({
    size: 500,
    value: url
  }), [ url ]);
  const qrData = qr.toDataURL('image/jpeg');
  return (
    <>
      <Dialog open maxWidth="md" fullWidth onClose={hideModal}>
        <DialogTitle>
          Share Roster
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <FormControl>
              <FormLabel component="legend">Sharing Type</FormLabel>
              <RadioGroup
                row
                aria-label="gender"
                name="row-radio-buttons-group"
                onChange={(event) => setShareType(event.target.value)}
                value={shareType}
              >
                {SHARING_TYPES.map((type, index) => (
                  <FormControlLabel
                    key={index}
                    value={type.value}
                    control={<Radio />}
                    label={type.label}
                  />
                ))}
              </RadioGroup>
            </FormControl>
            {shareType === 'url' && <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
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
            </Stack>}
            {shareType === 'qr' &&
              <Box display="flex" alignItems="center" justifyContent="center"><img alt="qr code" style={{ maxWidth: '512px' }} src={qrData} /></Box>
            }
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
  const [pointLimit, setPointLimit] = useState(0);
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
                              <Stack direction="row" spacing={1}>
                                <Box style={{ width: '8px', background: org.color, flex: 'none' }} />
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
                              </Stack>
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
                  <TextField
                    type="number"
                    size="small"
                    id="standard-basic"
                    label="Point Limit"
                    variant="outlined"
                    onChange={(value) => setPointLimit(value.target.value)}
                    value={pointLimit}
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
                  addList(listName, { type: listType, gameId, pointLimit });
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
