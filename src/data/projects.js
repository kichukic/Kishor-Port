import Chatappimage from "../images/chatapp_project_vector.gif";
import Ecommerceimage from "../images/ecommerce_project_vector.gif";
import Taskmanagerimage from "../images/taskmanager_project_vector.gif";

export const projectsData = [
  {
    id: 1,
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
    id: 2,
    img: Ecommerceimage,
    title: 'E-Commerce Core API',
    description:
      'A fully secured, highly optimized transaction pipeline driving cart queues, database gateways, stripe billing protocols, and instant catalog search pipelines with low-latency indexing.',
    tech_stack: ['Node.js', 'Express.js', 'Stripe API', 'MySQL', 'Redis', 'Docker'],
    github_url: 'https://github.com/kichukic',
    demo_url: '',
    featured: true,
  },
  {
    id: 3,
    img: Taskmanagerimage,
    title: 'Task Scheduler Daemon',
    description:
      'A distributed cron background daemon running rabbitmq queue brokers, load balancers, and containerized cron clusters. Monitors heartbeat statuses, memory caps, and automated job retries.',
    tech_stack: ['Node.js', 'RabbitMQ', 'Cron Jobs', 'Docker', 'GCP', 'GitHub Actions'],
    github_url: 'https://github.com/kichukic',
    demo_url: '',
    featured: true,
  },
];

