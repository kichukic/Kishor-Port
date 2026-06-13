import React, { useState, useCallback, useEffect, useContext } from "react";
import { ThemeProvider as AppThemeProvider } from "./context/ThemeContext";
import { useTheme } from "./hooks/useTheme";
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";
import { ThemeProvider as EmotionThemeProvider } from "@emotion/react";
import GlobalStyles from "./styles/GlobalStyles";
import VideoBackground from "./components/shared/VideoBackground";
import Home from "./pages/Home";
import { useKonamiCode } from "./hooks/useKonamiCode";
import { EasterEggOverlay, AchievementBadgePersistent } from "./components/shared/EasterEggOverlay";
import BootSequence from "./components/shared/BootSequence";
import AmbientOverlay from "./components/shared/AmbientOverlay";
import AudioToggle from "./components/shared/AudioToggle";
import { useSound } from "./hooks/useSound";
import { AudioContext } from "./context/AudioContext";
import { startAmbientDrone, stopAmbientDrone } from "./audio/soundEngine";

function AppContent() {
  const { theme } = useTheme();
  const { activated, showBanner, progress } = useKonamiCode();
  const [bootComplete, setBootComplete] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const { konamiKey, konamiFail } = useSound();
  const { muted } = useContext(AudioContext);
  const prevProgressRef = React.useRef(0);

  // Open game when Konami banner fires
  useEffect(() => {
    if (showBanner) setShowGame(true);
  }, [showBanner]);

  const handleBootComplete = useCallback(() => {
    setBootComplete(true);
  }, []);

  useEffect(() => {
    if (bootComplete && !muted) {
      startAmbientDrone();
    } else {
      stopAmbientDrone();
    }
    return () => {
      stopAmbientDrone();
    };
  }, [bootComplete, muted]);

  useEffect(() => {
    if (progress > prevProgressRef.current) {
      konamiKey();
    } else if (progress === 0 && prevProgressRef.current > 0) {
      konamiFail();
    }
    prevProgressRef.current = progress;
  }, [progress, konamiKey, konamiFail]);

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
        <BootSequence onComplete={handleBootComplete} />
        {bootComplete && (
          <>
            <VideoBackground />
            <AmbientOverlay />
            <div style={{ position: "relative", zIndex: 1 }}>
              <Home />
            </div>
          </>
        )}
        <EasterEggOverlay show={showGame} onClose={() => setShowGame(false)} />
        <AchievementBadgePersistent show={activated && !showGame} />
        <AudioToggle />
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
