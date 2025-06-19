import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
  typography: {
    fontFamily: `'Inter', sans-serif`
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#3E5C76',
      contrastText: '#F0EBD8'
    },
    secondary: {
      main: '#748CAB',
      contrastText: '#0D1321'
    },
    error: {
      main: '#EE3424'
    },
    success: {
      main: '#20D420'
    },
    background: {
      default: '#0D1321',
      paper: '#1D2D44'
    },
    text: {
      primary: '#F0EBD8',
      secondary: '#748CAB',
      disabled: '#8a8a8a'
    },
    divider: '#3E5C76',
    action: {
      hover: 'rgba(255, 255, 255, 0.08)',
      selected: 'rgba(255, 255, 255, 0.16)',
      disabled: 'rgba(255, 255, 255, 0.3)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
    },
    highlight: {
      main: '#F0EBD8'
    },
    topper: {
      main: '#1D2D44',
      contrastText: '#F0EBD8'
    }
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#F0EBD8',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#F0EBD8',
          },
        },
        notchedOutline: {
          borderColor: '#748CAB',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#F0EBD8',
          '&.Mui-focused': {
            color: '#F0EBD8',
          },
        },
      },
    },
  }
});
