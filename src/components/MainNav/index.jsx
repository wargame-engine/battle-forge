import { Home } from '@mui/icons-material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FeaturedPlayListIcon from '@mui/icons-material/FeaturedPlayList';
import MenuIcon from '@mui/icons-material/Menu';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import { Menu, MenuItem } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { alpha, styled, useTheme } from '@mui/material/styles';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import useMediaQuery from "@mui/material/useMediaQuery";
import IGR from "assets/battleforged_anvil.png";
import { Dropdown } from "components/dropdown";
import { DataContext, useModal } from "hooks";
import Dice6 from 'mdi-material-ui/Dice6';
import Discord from 'mdi-material-ui/Discord';
import Github from 'mdi-material-ui/Github';
import Newspaper from 'mdi-material-ui/Newspaper';
import React from "react";
import { useHistory } from "react-router-dom";
import { UserPreferences } from "routes/modals";

const drawerWidth = 250;

const navItems = [
  {
    id: 'home',
    name: 'Home',
    icon: <Home />,
    to: '/'
  },
  {
    id: 'games',
    name: 'Games',
    icon: <Dice6 />,
    to: '/games'
  },
  {
    id: 'lists',
    name: 'Rosters',
    icon: <FeaturedPlayListIcon />,
    to: '/lists'
  },
  {
    id: 'rules',
    name: 'Rules',
    icon: <MenuBookIcon />,
    to: '/rules'
  },
  {
    id: 'news',
    name: 'Updates',
    icon: <Newspaper />,
    to: '/updates'
  },
  {
    id: 'divider'
  },
  {
    id: 'github',
    name: 'Github',
    icon: <Github />,
    toAbs: 'https://github.com/wargame-engine'
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: <Discord />,
    toAbs: 'https://discord.com/invite/M9sets4'
  }
];

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  // marginLeft: theme.spacing(3),
  // width: 'auto',
  // [theme.breakpoints.up('sm')]: {

  // },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

export const MainNav = (props) => {
  // const locationTitle = usePageTitle();
  const [searchMode, setSearchMode] = React.useState(false);
  const [{ userPrefs, setUserPrefs, appState, setAppState }] = React.useContext(DataContext);
  const { contextActions } = appState;
  const history = useHistory();
  const [showUserPreferences, hideUserPreferences] = useModal(
    ({ extraProps }) => (
      <UserPreferences
        {...props}
        hideModal={hideUserPreferences}
        setUserPrefs={setUserPrefs}
        userPrefs={userPrefs}
        {...extraProps}
      />
    ),
    [userPrefs]
  );
  // const [showSignUpDialog, hideSignUpDialog] = useModal(
  //   ({ extraProps }) => (
  //     <SignUpDialog
  //       {...props}
  //       hideModal={hideSignUpDialog}
  //       setUserPrefs={setUserPrefs}
  //       userPrefs={userPrefs}
  //       {...extraProps}
  //     />
  //   ),
  //   [userPrefs]
  // );
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  // const [auth, setAuth] = React.useState(true);
  // const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  // const handleMenu = (event) => {
  //   setAnchorEl(event.currentTarget);
  // };

  // const handleClose = () => {
  //   setAnchorEl(null);
  // };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const fullScreen = useMediaQuery(theme.breakpoints.up("sm"));
  const numActionsToShow = fullScreen ? contextActions?.length : (2 - (appState.enableSearch ? 1 : 0));
  return (
    <>
      <AppBar position="sticky" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Container maxWidth="lg">
          {!searchMode && <Toolbar style={{ padding: 0 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={() => open ? handleDrawerClose() : handleDrawerOpen()}
              edge="start"
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
            {/* <Box display="flex" flexGrow={1} style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
              <Typography color="inherit" variant="h6" style={{ minWidth: 0, textOverflow: 'ellipsis' }}>
                {locationTitle}
              </Typography>
            </Box> */}
            <Button onClick={() => history.push('/games')} sx={{ color: 'inherit' }} startIcon={<img src={IGR} alt="igr" style={{ height: fullScreen ? '35px' : '30px'}} />}>
              <Typography noWrap fontSize={fullScreen ? 20 : 18} fontWeight="bold" sx={{ color: 'inherit' }} style={{ textTransform: 'none' }}>
                Battle Forge
              </Typography>
            </Button>
            <Box flex={1}></Box>
            <>
              {contextActions?.slice(0, numActionsToShow)?.map((action, index) => (
                <IconButton
                  size="large"
                  color="inherit"
                  title={action.name}
                  onClick={() => action.onClick()}
                >
                  {action.icon}
                </IconButton>
              ))}
              {!!appState.enableSearch && <IconButton
                size="large"
                aria-label="show more"
                color="inherit"
                onClick={() => {
                  setSearchMode(true);
                }}
              >
                <SearchIcon />
              </IconButton>}
              {!!(contextActions?.length - numActionsToShow  > 0) && <Dropdown>
                {({ handleClose, open, handleOpen, anchorElement }) => (
                  <>
                    <IconButton sx={{ color: 'inherit' }} style={{ paddingRight: 0 }} onClick={handleOpen}>
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
                      {contextActions?.slice(numActionsToShow)?.map((action, index) => (
                        <MenuItem onClick={() => action.onClick()}>
                          <ListItemIcon>
                            {action.icon}
                          </ListItemIcon>
                          <ListItemText>{action.name}</ListItemText>
                        </MenuItem>
                      ))}
                    </Menu>
                  </>
                )}
              </Dropdown>}
            </>
          </Toolbar>}
          {!!searchMode && <Toolbar style={{ padding: 0 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={() => {
                setSearchMode(false);
                setAppState({ ...appState, searchText: '' })
              }}
              edge="start"
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                autoFocus
                placeholder="Search…"
                inputProps={{ 'aria-label': 'search' }}
                value={appState?.searchText}
                onChange={(event) => {
                  const value = event?.target?.value;
                  setAppState({ ...appState, searchText: value })
                }}
              />
            </Search>
          </Toolbar>}
        </Container>
      </AppBar>
      <SwipeableDrawer
        onOpen={handleDrawerOpen}
        onClose={handleDrawerClose}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        anchor="left"
        open={open}
      >
        <Box>
          <Toolbar />
          <List>
            {navItems.map((item, index) => {
            if (item.id === 'divider') {
              return <Divider />;
            }
            return (
              <ListItem button key={index} onClick={() => { item.toAbs ? window.open(item.toAbs, "_blank") : history.push(item.to);  handleDrawerClose(); }}>
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.name} />
              </ListItem>
            )}
          )}
          </List>
          <Divider />
          <ListItem button onClick={() => { showUserPreferences(); handleDrawerClose(); }}>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
        </Box>
      </SwipeableDrawer>
    </>
  );
};
