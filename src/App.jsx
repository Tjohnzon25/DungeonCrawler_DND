import React from 'react';
import { Route, Routes } from 'react-router';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { darkTheme } from './lib/themeConfig';
import { SnackbarProvider } from 'notistack';

const DMLogin = React.lazy(() => import('./components/DMComponents/DMLogin/DMLogin'));
const PlayerTable = React.lazy(() => import('./components/DMComponents/PlayerTable/PlayerTable'));

const App = () => {
  return (
    <SnackbarProvider>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Routes>
          <Route exact path='/dm-login' Component={DMLogin} />
          <Route exact path='/admin/players' Component={PlayerTable} />
        </Routes>
      </ThemeProvider>
    </SnackbarProvider>
  );
}

export default App;
