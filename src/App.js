import React from "react";
import { ThemeProvider as AppThemeProvider } from "./context/ThemeContext";
import { useTheme } from "./hooks/useTheme";
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";
import { ThemeProvider as EmotionThemeProvider } from "@emotion/react";
import GlobalStyles from "./styles/GlobalStyles";
import VideoBackground from "./components/shared/VideoBackground";
import Home from "./pages/Home";
import { useKonamiCode } from "./hooks/useKonamiCode";
import { EasterEggOverlay, AchievementBadgePersistent } from "./components/shared/EasterEggOverlay";

function AppContent() {
  const { theme } = useTheme();
  const { activated, showBanner } = useKonamiCode();

  const muiTheme = createTheme({
    palette: {
      mode: "dark",
      primary: { main: theme.neon },
      secondary: { main: theme.neonSecondary },
    },
    components: {
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontSize: "0.8rem",
            fontFamily: "Inter, sans-serif",
          },
        },
      },
    },
  });

  return (
    <MuiThemeProvider theme={muiTheme}>
      <EmotionThemeProvider theme={theme}>
        <GlobalStyles />
        <VideoBackground />
        <div style={{ position: "relative", zIndex: 1 }}>
          <Home />
        </div>
        <EasterEggOverlay show={showBanner} />
        <AchievementBadgePersistent show={activated && !showBanner} />
      </EmotionThemeProvider>
    </MuiThemeProvider>
  );
}

function App() {
  return (
    <AppThemeProvider>
      <AppContent />
    </AppThemeProvider>
  );
}

export default App;
