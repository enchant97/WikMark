'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  cssVariables: {
    nativeColor: true,
  },
  typography: {
    fontFamily: 'var(--font-roboto)',
  },
  colorSchemes: {
    dark: true,
  },
});

export default theme;
