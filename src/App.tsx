// @ts-nocheck

import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import 'App.css';
import ErrorBoundry from 'components/error-boundry';
import { useDataFetcher } from 'hooks';
import { SnackbarProvider } from 'notistack';
import React from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import Core from 'routes/Core';
import { createClient, Provider as URQLProvider } from 'urql';
import { getColor } from 'utils/colors';
import { BASE_THEME } from 'utils/constants';
import { DataContext, ModalProvider, PointsCacheContext, usePointsCache } from './hooks';

export default React.memo(() => {
  const cache = usePointsCache();
  const dataFetcher = useDataFetcher();
  const [{ userPrefs }] = dataFetcher;
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const browserTheme = prefersDarkMode ? 'dark' : 'light';
  const userTheme = userPrefs?.theme;
  const themeId = (!userTheme || userTheme === 'system') ? browserTheme : userTheme;
  const userPrimaryColor = getColor(userPrefs?.primaryColor)?.import || getColor('blue')?.import;
  const theme = createTheme({
    ...BASE_THEME,
    palette: {
      mode: themeId,
      primary: userPrimaryColor
    }
  });

  const notistackRef = React.createRef();
  const onClickDismiss = key => () => {
    notistackRef.current.closeSnackbar(key);
  }

  const serverUrl = process.env.REACT_APP_API || `${window.location.origin}/api`;
  const client = createClient({
    url: `${serverUrl}/graphql`,
  });

  return (
    <URQLProvider value={client}>
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
            <PointsCacheContext.Provider value={cache}>
              <DataContext.Provider value={dataFetcher}>
                <CssBaseline />
                <ErrorBoundry>
                  <HashRouter>
                    <Switch>
                      <Route component={Core} />
                    </Switch>
                  </HashRouter>
                </ErrorBoundry>
              </DataContext.Provider>
            </PointsCacheContext.Provider>
          </SnackbarProvider>
        </ModalProvider>
      </ThemeProvider>
    </URQLProvider>
  );
});