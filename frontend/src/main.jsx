import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import '@fontsource/poppins';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { HelmetProvider } from 'react-helmet-async';

const theme = createTheme({
  palette: {
    mode: 'light',
    background: { default: '#fff' },
    text: { primary: '#000' },
  },
  typography: {
    fontFamily: 'Poppins, Arial, sans-serif',
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
   <HelmetProvider> 
      <ThemeProvider theme={theme}>
      <CssBaseline />
    <App />
    </ThemeProvider>
    </HelmetProvider>  
  </React.StrictMode>
);
