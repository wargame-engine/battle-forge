import React from 'react';
import { DataContext } from 'hooks';

export const ThemeManager = (props) => {
  const [{ userPrefs }] = React.useContext(DataContext);
  const browserTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const theme = userPrefs.theme || browserTheme;

  React.useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  return (
    <></>
  );
}
