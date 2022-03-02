import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  CardHeader, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Menu,
  MenuItem, Typography
} from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { Dropdown } from "components/dropdown";
import { get, omit, sortBy } from "lodash";
import React from "react";
import { downloadFile } from "utils/files";

export function ForceBuilder(props) {
  const {
    nameFilter,
    setLists,
    lists = {},
    goToList,
    showModal,
  } = props;
  const listsWithId = Object.keys(lists).map((listKey) => ({
    ...lists[listKey],
    id: listKey,
  }));
  const filteredLists = sortBy(
    listsWithId.filter((list) =>
      nameFilter
        ? list.name.toLowerCase().includes(nameFilter.toLowerCase())
        : true
    ),
    "name"
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

  return (
    <>
      <Typography sx={{ my: 2 }} variant="h4" align="center">
        Rosters
      </Typography>
      <Card
        sx={{
          border: `2px solid ${theme.palette.primary.main}`,
          mb: 2,
        }}
      >
        <CardHeader
          sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.getContrastText(theme.palette.primary.main), p: 1 }}
          title={
            <Typography variant="h5" component="div">
              Manage Rosters
            </Typography>
          }
        />
        <CardContent
          style={{ padding: !!filteredLists.length ? 0 : undefined }}
        >
          <List>
            {!filteredLists.length && (
              <Typography>{"No lists found..."}</Typography>
            )}
            {filteredLists.map((list, index) => {
              const listKey = list.id;
              return (
                <>
                  <ListItem
                    key={index}
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
                                dense: false,
                                onClick: handleClose,
                                "aria-labelledby": "basic-button",
                              }}
                            >
                              <MenuItem onClick={() => goToList(listKey)}>
                                <ListItemIcon>
                                  <EditIcon />
                                </ListItemIcon>
                                <ListItemText>Edit</ListItemText>
                              </MenuItem>
                              <MenuItem
                                onClick={() => showModal({ listId: list.id })}
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
                              <MenuItem onClick={() => deleteList(listKey)}>
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
                      onClick={() => goToList(listKey)}
                    >
                      <ListItemText sx={{ wordBreak: 'break-all' }} id={list.id} primary={list.name} />
                    </ListItemButton>
                  </ListItem>
                </>
              );
            })}
          </List>
        </CardContent>
      </Card>
    </>
  );
}
