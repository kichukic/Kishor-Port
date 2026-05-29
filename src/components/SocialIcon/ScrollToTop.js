import React, { useState, useEffect } from 'react';
import { IconButton, Tooltip, styled } from '@mui/material';
import { FiArrowUp } from 'react-icons/fi';
import { animateScroll } from 'react-scroll';

const StyledButton = styled(IconButton)`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 50;
  background: ${({ theme }) => theme.gradient};
  color: #fff;
  width: 44px;
  height: 44px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.2s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.4);
  }
`;

function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollUp = () => {
    animateScroll.scrollToTop({ duration: 400 });
  };

  return visible ? (
    <Tooltip title="Scroll to top" placement="left">
      <StyledButton onClick={scrollUp} aria-label="Scroll to top">
        <FiArrowUp size={22} />
      </StyledButton>
    </Tooltip>
  ) : null;
}

export default ScrollToTop;
