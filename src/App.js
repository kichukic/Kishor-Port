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
  const { activated, showBanner, progress, swipeDir } = useKonamiCode();
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

        {/* Swipe direction feedback */}
        {swipeDir && (
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)', zIndex: 10000,
            pointerEvents: 'none', opacity: 0.5,
            fontSize: '3rem', color: '#00ffcc',
            textShadow: '0 0 20px #00ffcc',
            animation: 'konamiSwipeFade 0.4s ease-out forwards',
          }}>
            {swipeDir === 'up' && '↑'}
            {swipeDir === 'down' && '↓'}
            {swipeDir === 'left' && '←'}
            {swipeDir === 'right' && '→'}
          </div>
        )}

        {/* Konami progress dots (mobile hint) */}
        {!activated && !showGame && progress > 0 && (
          <div style={{
            position: 'fixed', bottom: 16, left: '50%',
            transform: 'translateX(-50%)', zIndex: 10000,
            display: 'flex', gap: 6, pointerEvents: 'none',
          }}>
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: '50%',
                background: i < progress ? '#00ffcc' : 'rgba(255,255,255,0.15)',
                transition: 'background 0.2s',
                boxShadow: i < progress ? '0 0 6px #00ffcc' : 'none',
              }} />
            ))}
          </div>
        )}

        <AudioToggle />

        <style>{`
          @keyframes konamiSwipeFade {
            0% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.2); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          }
        `}</style>
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
