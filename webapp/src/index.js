import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"
import { Provider } from 'react-redux'

import { LocalizationProvider } from '@mui/x-date-pickers-pro';
import { AdapterDateFns } from '@mui/x-date-pickers-pro/AdapterDateFns';
import { SnackbarProvider } from 'notistack';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import * as serviceWorker from './setup/serviceWorker'
import { App } from './app.js'
import { store } from 'store'
import initializeMuiX from 'mui'
import initializeSentry from 'sentry';
import initializeFullStory from 'fullstory'
import createLDProvider from 'launchdarkly'
import DarkTheme from 'v2/theme';

/* eslint-disable */
import { auth } from 'v2/firebase'; // Initializes Firebase
/* eslint-enable */

import './styles/index.css'
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource/material-icons';

console.log('Initializing app...');
initializeMuiX();
initializeSentry();
initializeFullStory();

(async () => {
  const LaunchDarklyProvider = await createLDProvider();

  const root = createRoot(document.getElementById('root'));

  root.render(
    <Provider store={store}>
      <BrowserRouter>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={DarkTheme}>
            <LaunchDarklyProvider>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <SnackbarProvider anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}>
                  <App />
                </SnackbarProvider>
              </LocalizationProvider>
            </LaunchDarklyProvider>
          </ThemeProvider>
        </StyledEngineProvider>
      </BrowserRouter>
    </Provider>
  );
})();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
