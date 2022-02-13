import { ExpandLess, ExpandMore, Home } from '@mui/icons-material';
import ArticleIcon from '@mui/icons-material/Article';
import BoltIcon from '@mui/icons-material/Bolt';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ConstructionIcon from '@mui/icons-material/Construction';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import StraightenIcon from '@mui/icons-material/Straighten';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import GitHubIcon from '@mui/icons-material/GitHub';
import { Collapse, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import useMediaQuery from "@mui/material/useMediaQuery";
import { AppContext } from 'hooks/appcontext';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from './dropdown';
import { CHAPTERS } from 'routes/rules/rules';

type NavItem = {
  id: string,
  name?: string,
  icon?: any,
  to?: string,
  toAbs?: string,
  children?: Array<NavItem>,
  onClick?: Function
}

export function Appdrawer() {
  const appContext = React.useContext(AppContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.up("md"));
  const drawerWidth = 250;
  const navItems: Array<NavItem> = [
    {
      id: 'home',
      name: 'Home',
      icon: <Home />,
      to: '/'
    },
    {
      id: 'rules',
      name: 'Rules',
      icon: <StraightenIcon />,
      children: [
        ...(Object.keys(CHAPTERS).map((key) => (
          {
            id: key,
            name: CHAPTERS[key].name,
            icon: <BookmarkIcon />,
            to: `/rules/${key}`
          }
        )))
      ]
    },
    {
      id: 'modules',
      name: 'Modules',
      icon: <MenuBookIcon />,
      to: '/modules'
    },
    {
      id: 'tools',
      name: 'Tools',
      icon: <ConstructionIcon />,
      children: [
        {
          id: 'characters',
          name: 'Characters',
          icon: <PersonIcon />,
          to: '/characters'
        }
      ]
    },
    {
      id: 'divider'
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: <GitHubIcon />,
      toAbs: 'https://github.com/wargame-engine/quest-forge'
    },
    {
      id: 'license',
      name: 'License',
      icon: <ArticleIcon />,
      to: '/license'
    },
    {
      id: 'divider'
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: <SettingsIcon />,
      to: '/settings'
    }
  ];
  const renderMenuItem = (item: NavItem, index: number) => {
    if (item.id === 'divider') {
      return <Divider key={index} />;
    }
    if (item.children) {
      return (
        <Dropdown key={index}>
          {({ handleClose, open, handleOpen, anchorElement }: any) => (
            <>
              <ListItemButton onClick={() => open ? handleClose() : handleOpen()}>
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={
                  <Typography>
                    {item.name}
                  </Typography>
                } />
                {open ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ pl: 2 }}>
                  {item.children?.map(renderMenuItem)}
                </List>
              </Collapse>
            </>
          )}
        </Dropdown>
      );
    }
    return (
      <ListItem
        button
        key={item.id}
        onClick={() => {
          if (item.toAbs) {
            window.open(item.toAbs, "_blank")
          } else if (item.to) {
            navigate(item.to as string);
          } else if (item.onClick) {
            item.onClick();
          }
          appContext.setDrawerOpen(false);
        }}>
        <ListItemIcon>
          {item.icon}
        </ListItemIcon>
        <ListItemText primary={
          <Typography>
            {item.name}
          </Typography>
        } />
      </ListItem>
    )
  };
  return (
    <>
      {!fullScreen &&
        <SwipeableDrawer
          open={appContext.drawerOpen}
          onClose={() => appContext.setDrawerOpen(false)}
          onOpen={() => appContext.setDrawerOpen(true)}
        >
          <Toolbar />
          <Box
            sx={{ width: 250 }}
          >
            <List>
              {navItems.map(renderMenuItem)}
            </List>
          </Box>
        </SwipeableDrawer>
      }
      {!!fullScreen &&
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { boxSizing: 'border-box' },
          }}
        >
          <Toolbar />
          <Box
            sx={{ width: 250 }}
          >
            <List>
              {navItems.map(renderMenuItem)}
            </List>
          </Box>
        </Drawer>
      }
    </>
  );
}