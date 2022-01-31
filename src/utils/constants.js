export const BASE_THEME = {
  components: {
    MuiCardContent: {
      styleOverrides: {
        // Name of the slot
        root: {
          ':last-child': {
            paddingBottom: '16px'
          }
        }
      }
    },
    MuiTabScrollButton: {
      styleOverrides: {
        root: {
          width: 25,
        }
      }
    }
  },
  typography: {
    fontFamily: [
      'Noto Sans JP'
    ],
    h1: {
      fontSize: '4rem',
      fontWeight: 'bold'
    },
    h2: {
      fontSize: '3rem',
      fontWeight: 'bold'
    },
    h3: {
      fontSize: '2.5rem',
      fontWeight: 'bold'
    },
    h4: {
      fontSize: '2rem',
      fontWeight: 'bold'
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 'bold'
    },
    h6: {
      fontSize: '1rem',
    }
  },
};