import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import ApiGatewayGif from '../../images/api_gateway_wide.gif';

const BannerSection = styled.section`
  padding: 5rem 0;
  background: rgba(10, 10, 15, 0.4);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;
`;

const LayoutContainer = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 3rem;
  align-items: center;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
`;

const GraphicWrapper = styled(motion.div)`
  width: 100%;
  position: relative;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
`;

const WideGif = styled.img`
  width: 100%;
  height: auto;
  filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.08));
`;

const MetricWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  text-align: left;

  @media (max-width: 992px) {
    align-items: center;
    text-align: center;
  }
`;

const BannerTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 0.5px;
  margin: 0;

  span {
    background: linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const BannerDesc = styled.p`
  font-size: 0.9rem;
  color: #a1a1aa;
  line-height: 1.6;
  margin: 0;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  width: 100%;
  margin-top: 0.5rem;
`;

const MetricCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 1rem;
  text-align: left;
`;

const MetricValue = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
  color: #ffffff;
  font-family: 'Courier New', Courier, monospace;
`;

const MetricLabel = styled.div`
  font-size: 0.75rem;
  color: #71717a;
  margin-top: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

function SystemBanner() {
  const [latency, setLatency] = useState(12);
  const [traffic, setTraffic] = useState(84);
  const [cpu, setCpu] = useState(4.2);

  useEffect(() => {
    const timer = setInterval(() => {
      setLatency(prev => Math.max(8, Math.min(20, Math.floor(prev + (Math.random() - 0.5) * 4))));
      setTraffic(prev => Math.max(60, Math.min(130, Math.floor(prev + (Math.random() - 0.5) * 10))));
      setCpu(prev => parseFloat(Math.max(2.1, Math.min(8.5, prev + (Math.random() - 0.5) * 1.5)).toFixed(1)));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <BannerSection>
      <LayoutContainer>
        <GraphicWrapper
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <WideGif src={ApiGatewayGif} alt="API Load Balancer Route Map" />
        </GraphicWrapper>
        <MetricWrapper>
          <BannerTitle>
            Architecting <span>Scalable APIs</span>
          </BannerTitle>
          <BannerDesc>
            Demonstrating active network routing structures. This pipeline decrypts SSL traffic, runs rate limiting filters, and distributes payload queues to clustered microservice instances in the backend cloud.
          </BannerDesc>
          <MetricsGrid>
            <MetricCard>
              <MetricValue>{latency}ms</MetricValue>
              <MetricLabel>Avg Latency</MetricLabel>
            </MetricCard>
            <MetricCard>
              <MetricValue>{traffic} req/s</MetricValue>
              <MetricLabel>Active Load</MetricLabel>
            </MetricCard>
            <MetricCard>
              <MetricValue>{cpu}%</MetricValue>
              <MetricLabel>Cluster CPU</MetricLabel>
            </MetricCard>
            <MetricCard>
              <MetricValue>99.99%</MetricValue>
              <MetricLabel>Uptime SLA</MetricLabel>
            </MetricCard>
          </MetricsGrid>
        </MetricWrapper>
      </LayoutContainer>
    </BannerSection>
  );
}

export default SystemBanner;
