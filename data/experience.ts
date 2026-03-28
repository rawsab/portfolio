export interface Experience {
  period: string;
  role: string;
  company: string;
  icon: string;
  iconAlt: string;
  description: string;
  link: string;
}

export const experiences: Experience[] = [
  {
    period: "JUN — AUG 2026",
    role: "Software Engineer Intern",
    company: "HubSpot",
    icon: "/icons/hubspot_icon.png",
    iconAlt: "HubSpot",
    description:
      "Incoming Summer 2026",
    link: "https://www.hubspot.com/",
  },
  {
    period: "JAN — APR 2026",
    role: "ML Engineer Intern",
    company: "Palitronica (YC W22)",
    icon: "/icons/pal_icon.png",
    iconAlt: "Palitronica",
    description:
      "Engineered a model orchestration framework for RF anomaly detection, enabling configurable training and inference at scale.",
    link: "https://www.palitronica.com/",
  },
  {
    period: "MAY — AUG 2025",
    role: "Software Engineer Intern",
    company: "Node App",
    icon: "/icons/node_icon.png",
    iconAlt: "Node App",
    description:
      "Built a growth optimization agent for marketing teams, combining OCR pipelines, retrieval systems, and natural language querying.",
    link: "https://node-app.com/",
  },
  {
    period: "SEP — DEC 2024",
    role: "Software Engineer Intern",
    company: "dandelion",
    icon: "/icons/ddln_icon.png",
    iconAlt: "Dandelion Networks",
    description:
      "Implemented distributed coordination systems for a blockchain network, including state sync, transactions, and event delivery.",
    link: "https://dandelionnet.com/",
  },
  {
    period: "JAN — APR 2024",
    role: "Software Engineer Intern",
    company: "BlackBerry",
    icon: "/icons/bb_icon.png",
    iconAlt: "BlackBerry",
    description:
      "Developed internal security tooling for dependency scanning, CVE validation, and pre-release checks for enterprise products.",
    link: "https://www.blackberry.com/",
  },
  {
    period: "MAY — AUG 2023",
    role: "Software Engineer Intern",
    company: "Cypienta",
    icon: "/icons/cyp_icon.png",
    iconAlt: "Cypienta",
    description:
      "Engineered scalable cybersecurity data pipelines for ingestion, alert processing, and threat intelligence automation.",
    link: "https://www.cypienta.com/",
  },
  // {
  //   period: "MAY — AUG 2021",
  //   role: "Research Assistant",
  //   company: "RIT",
  //   icon: "/icons/rit_icon.png",
  //   iconAlt: "RIT",
  //   description:
  //     "TBA.",
  //   link: "https://www.rit.edu/",
  // },
];

