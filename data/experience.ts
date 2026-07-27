export interface Experience {
  period: string;
  year: string;
  role: string;
  company: string;
  icon: string;
  iconAlt: string;
  description: string;
  shortDescription: string;
  link: string;
  technologies: string[];
  /** Static 4:3 thumbnail (webp preferred). Shown first / on hover. */
  thumbnail?: string;
  /** Looping video thumbnail. Plays by default; hidden while hovered. */
  videoThumbnail?: string;
}

export const experiences: Experience[] = [
  {
    period: "JUN—AUG 2026",
    year: "2026",
    role: "Software Engineer Intern",
    company: "HubSpot",
    icon: "/icons/hubspot_icon.png",
    iconAlt: "HubSpot",
    description:
      "Currently working on Brand Identity product backend.",
    shortDescription: "",
    link: "https://www.hubspot.com/",
    technologies: ["Java", "DropWizard", "Apache Kafka", "AWS SQS", "MySQL", "AI Agents"],
    thumbnail: "/thumbnails/hubspot_thumbnail.webp",
    videoThumbnail: "/thumbnail-videos/hubspot-loop.mp4",
  },
  {
    period: "JAN-APR 2026",
    year: "2026",
    role: "ML Engineer Intern",
    company: "Palitronica",
    icon: "/icons/pal_icon.png",
    iconAlt: "Palitronica",
    description:
      "Engineered a model orchestration framework for RF anomaly detection, enabling configurable training and inference at scale.",
    shortDescription: "",
    link: "https://www.palitronica.com/",
    technologies: ["Python", "Docker", "Azure Event Hubs", "Azure Cosmos DB", "MLflow", "NumPy", "Pandas"],
  },
  {
    period: "MAY-AUG 2025",
    year: "2025",
    role: "Software Engineer Intern",
    company: "Node App",
    icon: "/icons/node_icon.png",
    iconAlt: "Node App",
    description:
      "Built a growth optimization agent for marketing teams, combining OCR pipelines, retrieval systems, and natural language querying.",
    shortDescription: "",
    link: "https://node-app.com/",
    technologies: ["Python", "AWS EC2", "AWS Lambda", "MySQL", "Tesseract OCR", "Pinecone", "OpenAI API"],
  },
  {
    period: "SEP-DEC 2024",
    year: "2024",
    role: "Software Engineer Intern",
    company: "dandelion",
    icon: "/icons/ddln_icon.png",
    iconAlt: "Dandelion Networks",
    description:
      "Implemented distributed coordination systems for a blockchain network, including state sync, transactions, and event delivery.",
    shortDescription: "",
    link: "https://x.com/ddln_tech",
    technologies: ["Go", "gRPC", "BadgerDB"],
  },
  {
    period: "JAN-APR 2024",
    year: "2024",
    role: "Software Engineer Intern",
    company: "BlackBerry",
    icon: "/icons/bb_icon.png",
    iconAlt: "BlackBerry",
    description:
      "Developed internal security tooling for dependency scanning, CVE validation, and pre-release checking for enterprise products.",
    shortDescription: "",
    link: "https://www.blackberry.com/",
    technologies: ["C#", "ASP.NET Core", "Docker", "MySQL"],
  },
  {
    period: "MAY-AUG 2023",
    year: "2023",
    role: "Software Engineer Intern",
    company: "Cypienta",
    icon: "/icons/cyp_icon.png",
    iconAlt: "Cypienta",
    description:
      "Engineered scalable cybersecurity data pipelines for ingestion, alert processing, and threat intelligence automation.",
    shortDescription: "",
    link: "https://www.cypienta.com/",
    technologies: ["Python", "Apache Kafka", "PostgreSQL", "Celery"],
  },
  // {
  //   period: "MAY-AUG 2021",
  //   year: "2021",
  //   role: "Research Assistant",
  //   company: "RIT",
  //   icon: "/icons/rit_icon.png",
  //   iconAlt: "RIT",
  //   description:
  //     "TBA.",
  //   shortDescription: "",
  //   link: "https://www.rit.edu/",
  // },
];
