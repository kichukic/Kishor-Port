import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";
import { AudioProvider } from "./context/AudioContext";

ReactDOM.render(
  <ThemeProvider>
    <AudioProvider>
      <App />
    </AudioProvider>
  </ThemeProvider>,
  document.getElementById("root")
);
