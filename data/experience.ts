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
    period: "JAN — APR 2026",
    role: "ML Engineer Intern",
    company: "Palitronica (YC W22)",
    icon: "/icons/pal_icon.png",
    iconAlt: "Palitronica",
    description:
      "Building a model orchestration framework for RF anomaly detection, enabling configurable training and inference at scale.",
    link: "https://www.palitronica.com/",
  },
  {
    period: "MAY — AUG 2025",
    role: "Software Engineer Intern",
    company: "Node App",
    icon: "/icons/node_icon.png",
    iconAlt: "Node App",
    description:
      "Engineered a real-time analytics and RAG pipeline, powering 200+ marketing teams and reducing manual processing by over 80%.",
    link: "https://node-app.com/",
  },
  {
    period: "SEP — DEC 2024",
    role: "Software Engineer Intern",
    company: "dandelion",
    icon: "/icons/ddln_icon.png",
    iconAlt: "Dandelion Networks",
    description:
      "Developed a distributed syncing and consensus simulation system for 1000+ nodes to uncover exploitable sync behaviors.",
    link: "https://dandelionnet.com/",
  },
  {
    period: "JAN — APR 2024",
    role: "Security Engineer Intern",
    company: "BlackBerry",
    icon: "/icons/bb_icon.png",
    iconAlt: "BlackBerry",
    description:
      "Built an automated artifact scanner for 5+ enterprise products, detecting and blocking critical vulnerabilities pre-release.",
    link: "https://www.blackberry.com/",
  },
  {
    period: "MAY — AUG 2023",
    role: "Software Developer Intern",
    company: "Cypienta",
    icon: "/icons/cyp_icon.png",
    iconAlt: "Cypienta",
    description:
      "Redesigned web-app with a Svelte migration and performance optimizations, reducing load times by over 40%.",
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

