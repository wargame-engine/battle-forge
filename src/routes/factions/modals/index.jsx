import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormLabel, Paper, Radio, RadioGroup, Stack, TextField
} from "@mui/material";
import {
  get
} from "lodash";
import React, {
  useState
} from "react";

const LIST_TYPES = [
  { label: "Competitive", value: "competitive" },
  { label: "Narrative", value: "narrative" },
  { label: "Campaign", value: "campaign" }
];
export const AddList = (props) => {
  const { hideModal, addList } = props;
  const [listName, setListName] = useState("");
  const [pointLimit, setPointLimit] = useState(0);
  const [listType, setListType] = useState("competitive");
  return (
    <>
      <Dialog open maxWidth="md" fullWidth onClose={hideModal}>
        <DialogTitle closeButton>Create Roster</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl>
              <TextField
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
