import Zolioimage from "../images/zolio_project_vector.gif";
import Chatappimage from "../images/chatapp_project_vector.gif";
import Ecommerceimage from "../images/ecommerce_project_vector.gif";

export const projectsData = [
  {
    id: 1,
    img: Zolioimage,
    title: 'Zolio.ai - AI Interview Platform',
    description:
      'An AI-powered automated recruitment and campus hiring screening platform conducting 24/7 conversional L1/L2 assessments. Backed by custom resume scoring algorithms, automated shortlists, and robust LLM data processing pipelines.',
    tech_stack: ['Node.js', 'Express.js', 'MongoDB', 'OpenAI/Gemini', 'Redis', 'AWS'],
    github_url: '',
    demo_url: 'https://zolio.ai',
    featured: true,
  },
  {
    id: 2,
    img: Chatappimage,
    title: 'Chat-App Service',
    description:
      'A real-time server gateway built with Node.js, Express, and WebSockets enabling active socket streaming. Backed by MongoDB for history mapping, JWT for access controls, and integrated with multi-client network paths.',
    tech_stack: ['Node.js', 'Express.js', 'WebSockets', 'MongoDB', 'JWT', 'AWS'],
    github_url: 'https://github.com/kichukic/Chat-App',
    demo_url: '',
    featured: true,
  },
  {
    id: 3,
    img: Ecommerceimage,
    title: 'E-Commerce Core API',
    description:
      'A fully secured, highly optimized transaction pipeline driving cart queues, database gateways, stripe billing protocols, and instant catalog search pipelines with low-latency indexing.',
    tech_stack: ['Node.js', 'Express.js', 'Stripe API', 'MySQL', 'Redis', 'Docker'],
    github_url: 'https://github.com/kichukic',
    demo_url: '',
    featured: true,
  },
];

