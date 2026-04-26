export interface Testimonial {
  quote: string;
  author: {
    name: string;
    title: string;
    company: string;
    profileImage: string;
    companyIcon?: string;
    linkedin?: string;
  };
}

export const testimonials: Testimonial[] = [
  {
    quote:
      "Rawsab has made an exceptional contribution to the development of our ML framework during his co-op term. He consistently demonstrated a high level of organization and ownership in approaching tasks, carefully processing requirements and delivering thoughtful, high-quality implementations. \n\nBeyond execution, he proactively introduced new ideas and played a key role in identifying and resolving multiple issues, improving both stability and usability of our systems. He was also highly effective in code reviews, providing clear, constructive feedback that improved the team's overall quality. His ability to go beyond assigned tasks, contribute strategically, and deliver impactful results clearly distinguishes his performance as outstanding. \n\nThroughout his co-op term, he consistently demonstrated exceptional technical ability, strong ownership, and a proactive mindset. He quickly understood complex requirements within our ML infrastructure and translated them into well-structured, scalable solutions. His contributions went beyond assigned tasks; he actively identified gaps, proposed improvements, and followed through with high-quality implementations. \n\nI strongly recommend him for any future roles in MLOps or software engineering. He has demonstrated the ability to work effectively in complex, production-level environments and consistently deliver impactful results. With continued experience, he has strong potential to grow into a highly capable engineer and technical leader.",
    author: {
      name: "Mostafa Hassan",
      title: "Head of Machine Learning",
      company: "Palitronica",
      profileImage: "/testimonial_img/mostafa_hassan.png",
      companyIcon: "/icons/pal_icon.png",
      linkedin: "https://www.linkedin.com/in/hassanmm/",
    },
  },
  {
    quote:
      "Throughout Rawsab's time at Node App, there wasn't a single technical challenge he couldn't overcome. Whether he was implementing complex systems or making sense of data-heavy problems, he consistently developed effective solutions and executed them independently. I strongly recommend Rawsab and would gladly work with him again.",
    author: {
      name: "Mackenzie Dérival",
      title: "Co-Founder",
      company: "Node App",
      profileImage: "/testimonial_img/mackenzie.jpg",
      companyIcon: "/icons/node_icon.png",
      linkedin: "https://www.linkedin.com/in/mderival/",
    },
  },
  {
    quote:
      "I had the pleasure of working with and mentoring Rawsab, who made significant contributions in his work with consensus protocols and network security analysis. His technical expertise, problem-solving skills, and collaborative mindset consistently drove our projects forward and elevated the team's performance. He has my highest recommendation and would be an exceptional asset to any organization.",
    author: {
      name: "Amirreza Radjou",
      title: "Senior Software Engineer",
      company: "dandelion",
      profileImage: "/testimonial_img/amirreza_radjou.jpeg",
      companyIcon: "/icons/ddln_icon.png",
      linkedin: "https://www.linkedin.com/in/amirreza-radjou/",
    },
  },
  {
    quote:
      "Rawsab made significant contributions to our product security automation pipeline; integrating it with our Release Management process. He also learned about and contributed to vulnerability assessment across two different product lines. He was proactive and met or exceeded all expectations and deadlines.  I enjoyed working with Rawsab and hope our professional paths cross again soon!",
    author: {
      name: "Jordan Pryde",
      title: "Senior Product Security Analyst",
      company: "BlackBerry",
      profileImage: "/testimonial_img/jordan_pryde.jpeg",
      companyIcon: "/icons/bb_icon.png",
      linkedin: "https://www.linkedin.com/in/jxpryde/",
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
      linkedin: "https://www.linkedin.com/in/andrew-suter-44b44126/",
    },
  },
  {
    quote:
      "During his internship at Node App [acquired by Dulcedo], Rawsab actively contributed to the development and optimization of a core web application. He demonstrated strong technical skills in software development, problem-solving, and project execution, while also showing an ability to quickly learn and adapt to our processes and tools.\n\nRawsab was collaborative and proactive, readily sharing insights and suggestions to improve workflows and enhance product performance. He also demonstrated strong communication skills, contributing ideas and ensuring smooth coordination with colleagues across different functions.\n\nThroughout his internship, Rawsab displayed dedication, initiative, and a genuine interest in the company's mission. His contributions added value to our engineering efforts, and his positive attitude made him a pleasure to work with. Rawsab was a great addition to our team and it was a pleasure to have worked with. Not only did Rawsab participate in the overall success of the team but also took initiatives on various projects throughout the internship period.",
    author: {
      name: "Pénéloppe Fisette",
      title: "Talent Director",
      company: "Dulcedo",
      profileImage: "/testimonial_img/peneloppe_fisette.jpeg",
      companyIcon: "/icons/dul_icon.png",
      linkedin: "https://www.linkedin.com/in/peneloppe-fisette/",
    },
  },
];

