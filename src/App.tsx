// @ts-nocheck

import CloseIcon from '@mui/icons-material/Close';
import { Box, Container, IconButton } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import 'App.css';
import { Footer } from 'components/footer';
import { MainNav } from 'components/MainNav';
import { useDataFetcher, usePageTitle } from 'hooks';
import { get } from "lodash";
import { SnackbarProvider } from 'notistack';
import React from 'react';
import { useLocation } from 'react-router';
import { Route, Routes } from 'react-router-dom';
import Faction from "routes/faction";
import Factions from "routes/factions";
import Games from "routes/games";
import Lists from "routes/Lists";
import PageNotFound from "routes/PageNotFound";
import Privacy from "routes/Privacy";
import Rosters from "routes/rosters";
import Rules from "routes/Rules";
import Splash from "routes/Splash";
import Updates from "routes/Updates";
import { getColor } from 'utils/colors';
import { BASE_THEME } from 'utils/constants';
import { DataContext, ModalProvider } from './hooks';

const App = () => {
  const dataFetcher = useDataFetcher();
  const [{ userPrefs, data }] = dataFetcher;
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const browserTheme = prefersDarkMode ? 'dark' : 'light';
  const userTheme = userPrefs?.theme;
  const themeId = (!userTheme || userTheme === 'system') ? browserTheme : userTheme;
  const userPrimaryColor = getColor(userPrefs?.primaryColor)?.import || getColor('blue')?.import;
  const location = useLocation();
  const path = get(location, "pathname", "/");
  const theme = createTheme({
    ...BASE_THEME,
    palette: {
      mode: themeId,
      primary: userPrimaryColor
    }
  });
  const fullScreen = useMediaQuery(theme.breakpoints.up("sm"));
  const title = usePageTitle({ optData: data });
  React.useEffect(() => {
    document.title = `Battle Forge - ${title}`
  }, [title]);
  const notistackRef = React.createRef();
  const onClickDismiss = key => () => {
    notistackRef.current.closeSnackbar(key);
  }

  return (
    <ThemeProvider theme={theme}>
      <ModalProvider>
        <SnackbarProvider
          ref={notistackRef}
          maxSnack={3}
          action={(key) => (
            <IconButton sx={{ color: 'inherit' }} onClick={onClickDismiss(key)}>
              <CloseIcon />
            </IconButton>
          )}
        >
          <DataContext.Provider value={dataFetcher}>
            <CssBaseline />
            <>
              <MainNav />
              <div className="main">
                {path !== "/" && (
                  <Container>
                    <Box sx={{ pt: 1, pb: 1 }}>
                      {/* <Breadcrumbs /> */}
                    </Box>
                  </Container>
                )}
                <Box sx={{ ml: fullScreen ? '250px' : '0', mb: 2 }}>
                  <Routes>
                    <Route path="/" element={<Splash />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/rules" element={<Rules />} />
                    <Route path="/updates" element={<Updates />} />
                    <Route
                      path="/games/:gameName/:factionName"
                      element={<Faction />}
                    />
                    <Route path="/games/:gameName" element={<Factions />} />
                    <Route path="/games" element={<Games />} />
                    <Route path="/lists" element={<Rosters />} />
                    <Route
                      path="/lists/:listId"
                      element={<Lists />}
                    />
                    <Route element={<PageNotFound />} />
                  </Routes>
                  <Footer className="footer" />
                </Box>
              </div>
            </>
          </DataContext.Provider>
        </SnackbarProvider>
      </ModalProvider>
    </ThemeProvider>
  );
};

export default App;