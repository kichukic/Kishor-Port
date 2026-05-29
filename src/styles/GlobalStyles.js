import React from 'react';
import { Global, css, useTheme } from '@emotion/react';

function GlobalStyles() {
  const theme = useTheme();

  return (
    <Global
      styles={css`
        *,
        *::before,
        *::after {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          scroll-behavior: smooth;
        }

        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: ${theme.body};
        }
        ::-webkit-scrollbar-thumb {
          background: ${theme.neon};
          border-radius: 3px;
        }

        body {
          font-family: 'Inter', sans-serif;
          -webkit-font-smoothing: antialiased;
          background: ${theme.body};
          color: ${theme.text};
          font-weight: 400;
          overflow-x: hidden;
          transition: background 0.3s ease, color 0.3s ease;
          line-height: 1.6;
        }

        a {
          text-decoration: none;
          color: inherit;
          transition: 0.2s ease;
        }

        ul,
        ol {
          list-style: none;
        }

        img,
        video {
          display: block;
          max-width: 100%;
        }

        .Container {
          max-width: 1100px;
          padding: 0 1.5rem;
          width: 100%;
          margin: 0 auto;
        }

        .section {
          padding: 6rem 0;
          position: relative;
        }

        .SectionTitle {
          font-size: 2.2rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 3.5rem;
          background: ${theme.gradientText};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
          display: inline-block;
          left: 50%;
          transform: translateX(-50%);

          &::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 3px;
            background: ${theme.gradient};
            border-radius: 2px;
          }
        }

        .glass {
          background: ${theme.glassBg};
          border: 1px solid ${theme.glassBorder};
          backdrop-filter: ${theme.backdrop};
          box-shadow: ${theme.glassShadow};
        }

        .glow-border {
          position: relative;
          &::before {
            content: '';
            position: absolute;
            inset: -1px;
            border-radius: inherit;
            padding: 1px;
            background: ${theme.gradient};
            -webkit-mask: linear-gradient(#fff 0 0) content-box,
              linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
          }
        }

        @media (max-width: 768px) {
          .SectionTitle {
            font-size: 1.7rem;
          }
          .section {
            padding: 4rem 0;
          }
        }
      `}
    />
  );
}

export default GlobalStyles;
