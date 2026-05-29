import React from 'react';
import styled from '@emotion/styled';
import blackHole from '../../images/black-hole-gargantua-moewalls-com.mp4';

const VideoContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
`;

const ZOOM = 1.3;

const Video = styled.video`
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  transform: translate(-50%, -50%) scale(${ZOOM});
  object-fit: cover;
  opacity: 1;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(10, 10, 15, 0.85) 0%, rgba(10, 10, 15, 0.7) 50%, rgba(10, 10, 15, 0.85) 100%);
  z-index: 2;
`;

const Vignette = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at center, transparent 60%, ${({ theme }) => theme.body} 100%);
  z-index: 3;
  pointer-events: none;
`;

function VideoBackground() {
  return (
    <VideoContainer>
      <Video
        autoPlay
        muted
        loop
        playsInline
      >
        <source src={blackHole} type="video/mp4" />
      </Video>
      <Overlay />
      <Vignette />
    </VideoContainer>
  );
}

export default VideoBackground;
