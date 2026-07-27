export interface Experience {
  period: string;
  role: string;
  company: string;
  icon: string;
  iconAlt: string;
  description: string;
  link: string;
  technologies: string[];
}

export const experiences: Experience[] = [
  {
    period: "JUN—AUG 2026",
    role: "Software Engineer Intern",
    company: "HubSpot",
    icon: "/icons/hubspot_icon.webp",
    iconAlt: "HubSpot",
    description:
      "Currently working on Brand Identity product backend.",
    link: "https://www.hubspot.com/",
    technologies: ["Java", "DropWizard", "Apache Kafka", "AWS SQS", "MySQL", "AI Agents"],
  },
  {
    period: "JAN-APR 2026",
    role: "ML Engineer Intern",
    company: "Palitronica Inc.",
    icon: "/icons/pal_icon.webp",
    iconAlt: "Palitronica",
    description:
      "Engineered a model orchestration framework for RF anomaly detection, enabling configurable training and inference at scale.",
    link: "https://www.palitronica.com/",
    technologies: ["Python", "Docker", "Azure Event Hubs", "Azure Cosmos DB", "MLflow", "NumPy", "Pandas"],
  },
  {
    period: "MAY-AUG 2025",
    role: "Software Engineer Intern",
    company: "Node App",
    icon: "/icons/node_icon.webp",
    iconAlt: "Node App",
    description:
      "Built a growth optimization agent for marketing teams, combining OCR pipelines, retrieval systems, and natural language querying.",
    link: "https://node-app.com/",
    technologies: ["Python", "AWS EC2", "AWS Lambda", "MySQL", "Tesseract OCR", "Pinecone", "OpenAI API"],
  },
  {
    period: "SEP-DEC 2024",
    role: "Software Engineer Intern",
    company: "dandelion",
    icon: "/icons/ddln_icon.webp",
    iconAlt: "Dandelion Networks",
    description:
      "Implemented distributed coordination systems for a blockchain network, including state sync, transactions, and event delivery.",
    link: "https://x.com/ddln_tech",
    technologies: ["Go", "gRPC", "BadgerDB"],
  },
  {
    period: "JAN-APR 2024",
    role: "Software Engineer Intern",
    company: "BlackBerry",
    icon: "/icons/bb_icon.webp",
    iconAlt: "BlackBerry",
    description:
      "Developed internal security tooling for dependency scanning, CVE validation, and pre-release checking for enterprise products.",
    link: "https://www.blackberry.com/",
    technologies: ["C#", "ASP.NET Core", "Docker", "MySQL"],
  },
  {
    period: "MAY-AUG 2023",
    role: "Software Engineer Intern",
    company: "Cypienta",
    icon: "/icons/cyp_icon.webp",
    iconAlt: "Cypienta",
    description:
      "Engineered scalable cybersecurity data pipelines for ingestion, alert processing, and threat intelligence automation.",
    link: "https://www.cypienta.com/",
    technologies: ["Python", "Apache Kafka", "PostgreSQL", "Celery"],
  },
  // {
  //   period: "MAY-AUG 2021",
  //   role: "Research Assistant",
  //   company: "RIT",
  //   icon: "/icons/rit_icon.webp",
  //   iconAlt: "RIT",
  //   description:
  //     "TBA.",
  //   link: "https://www.rit.edu/",
  // },
];

