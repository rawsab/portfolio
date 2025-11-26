export interface Testimonial {
  quote: string;
  author: {
    name: string;
    title: string;
    company: string;
    profileImage: string;
    companyIcon?: string;
  };
}

export const testimonials: Testimonial[] = [
  {
    quote:
      "Rawsab made significant contributions to our product security automation pipeline, integrating it with our Release Management process. He was proactive and met or exceeded all expectations and deadlines. Overall, I thoroughly enjoyed working with Rawsab!",
    author: {
      name: "Jordan Pryde",
      title: "Senior Product Security Analyst",
      company: "BlackBerry",
      profileImage: "/testimonial_img/jordan_pryde.jpeg",
      companyIcon: "/icons/bb_icon.png",
    },
  },
  {
    quote:
      "Rawsab worked with us for a term in 2024. He made excellent progress on our long-term project and contributed greatly to the team. It was a pleasure working with Rawsab and I hope his experience working in a Product Security Incident Response Team serves him well in the future!",
    author: {
      name: "Andrew Suter",
      title: "Senior Manager (PSIRT)",
      company: "BlackBerry",
      profileImage: "/testimonial_img/default.png",
      companyIcon: "/icons/bb_icon.png",
    },
  },
  {
    quote:
      "Rawsab's technical expertise, problem-solving skills, and collaborative mindset consistently drove our projects forward and elevated the team's performance. He has my highest recommendation and would be an exceptional asset to any organization.",
    author: {
      name: "Amirreza Radjou",
      title: "Software Engineer",
      company: "dandelion",
      profileImage: "/testimonial_img/amirreza_radjou.jpeg",
      companyIcon: "/icons/ddln_icon.png",
    },
  },
  {
    quote:
      "Throughout his time at Node App [acquired by Dulcedo], Rawsab displayed dedication, initiative, and a genuine interest in the company's mission. His contributions added value to our engineering efforts, and his positive attitude made him a pleasure to work with.",
    author: {
      name: "Pénéloppe Fisette",
      title: "Talent Director",
      company: "Dulcedo",
      profileImage: "/testimonial_img/peneloppe_fisette.jpeg",
      companyIcon: "/icons/dul_icon.png",
    },
  },
];

