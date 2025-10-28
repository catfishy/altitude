import { createTheme } from '@mui/material/styles';
import { cyan, green, indigo, orange } from '@mui/material/colors'

const DarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: indigo[500],
      light: indigo[300],
      dark: indigo[700],
    },
    info: {
      main: cyan[500],
      light: cyan[300],
      dark: cyan[700],
    },
    success: {
      main: green[500],
      light: green[300],
      dark: green[700],
    },
    warning: {
      main: orange[500],
      light: orange[300],
      dark: orange[700],
    },
  },
  typography: {
    fontFamily: [
      'Red Hat Text',
      'Roboto',
    ].join(','),
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1d2127',
          backgroundImage: 'unset',
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          color: '#fff',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontSize: '0.875rem',
          lineHeight: 1.43,
          letterSpacing: '0.01071em',
        }
      }
    },
  }
});

export default DarkTheme;
