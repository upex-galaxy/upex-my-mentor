import { Mentor } from "@/types";

// Hardcoded mentor data based on the personas from PRD
export const mentors: Mentor[] = [
  {
    id: "1",
    email: "carlos.mendoza@example.com",
    name: "Carlos Mendoza",
    role: "mentor",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
    description:
      "Arquitecto de Software con 15+ años de experiencia en sistemas distribuidos, microservicios y arquitecturas cloud. He liderado equipos técnicos en empresas Fortune 500 y startups tecnológicas. Mi pasión es ayudar a developers a crecer profesionalmente y dominar las mejores prácticas de ingeniería de software.",
    createdAt: new Date("2024-01-15"),
    profile: {
      userId: "1",
      specialties: [
        "System Design",
        "Microservices",
        "AWS",
        "Kubernetes",
        "TypeScript",
        "Node.js",
      ],
      hourlyRate: 120,
      linkedinUrl: "https://linkedin.com/in/carlos-mendoza",
      githubUrl: "https://github.com/carlosmendoza",
      isVerified: true,
      averageRating: 4.9,
      totalReviews: 47,
      yearsOfExperience: 15,
    },
  },
  {
    id: "2",
    email: "ana.rodriguez@example.com",
    name: "Ana Rodríguez",
    role: "mentor",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
    description:
      "Senior Frontend Engineer especializada en React, Next.js y arquitectura de aplicaciones web modernas. Ex-Tech Lead en Meta. Me encanta enseñar las mejores prácticas de desarrollo frontend y optimización de rendimiento.",
    createdAt: new Date("2024-02-01"),
    profile: {
      userId: "2",
      specialties: [
        "React",
        "Next.js",
        "TypeScript",
        "Tailwind CSS",
        "Web Performance",
        "Testing",
      ],
      hourlyRate: 100,
      linkedinUrl: "https://linkedin.com/in/ana-rodriguez",
      githubUrl: "https://github.com/anarodriguez",
      isVerified: true,
      averageRating: 5.0,
      totalReviews: 32,
      yearsOfExperience: 10,
    },
  },
  {
    id: "3",
    email: "miguel.torres@example.com",
    name: "Miguel Torres",
    role: "mentor",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Miguel",
    description:
      "Data Scientist & ML Engineer con experiencia en proyectos de visión computacional y NLP. PhD en Computer Science. He trabajado en Amazon y Google AI. Ayudo a developers a transicionar a roles de ML/AI.",
    createdAt: new Date("2024-01-20"),
    profile: {
      userId: "3",
      specialties: [
        "Machine Learning",
        "Python",
        "TensorFlow",
        "PyTorch",
        "Data Science",
        "NLP",
      ],
      hourlyRate: 150,
      linkedinUrl: "https://linkedin.com/in/miguel-torres",
      githubUrl: "https://github.com/migueltorres",
      isVerified: true,
      averageRating: 4.8,
      totalReviews: 28,
      yearsOfExperience: 12,
    },
  },
  {
    id: "4",
    email: "sofia.garcia@example.com",
    name: "Sofía García",
    role: "mentor",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia",
    description:
      "Full Stack Developer con expertise en desarrollo móvil. Especializada en React Native y Flutter. He construido apps con millones de usuarios. Me apasiona ayudar a juniors a mejorar sus habilidades técnicas.",
    createdAt: new Date("2024-02-10"),
    profile: {
      userId: "4",
      specialties: [
        "React Native",
        "Flutter",
        "TypeScript",
        "Firebase",
        "Mobile Development",
        "UX/UI",
      ],
      hourlyRate: 90,
      linkedinUrl: "https://linkedin.com/in/sofia-garcia",
      githubUrl: "https://github.com/sofiagarcia",
      isVerified: true,
      averageRating: 4.7,
      totalReviews: 41,
      yearsOfExperience: 8,
    },
  },
  {
    id: "5",
    email: "javier.lopez@example.com",
    name: "Javier López",
    role: "mentor",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Javier",
    description:
      "DevOps Engineer & SRE con experiencia en infraestructura cloud, CI/CD y monitoring. Ex-Site Reliability Engineer en Netflix. Ayudo a equipos a implementar DevOps culture y mejores prácticas de deployment.",
    createdAt: new Date("2024-01-25"),
    profile: {
      userId: "5",
      specialties: [
        "DevOps",
        "AWS",
        "Docker",
        "Kubernetes",
        "Terraform",
        "CI/CD",
      ],
      hourlyRate: 110,
      linkedinUrl: "https://linkedin.com/in/javier-lopez",
      githubUrl: "https://github.com/javierlopez",
      isVerified: true,
      averageRating: 4.9,
      totalReviews: 35,
      yearsOfExperience: 11,
    },
  },
  {
    id: "6",
    email: "laura.martinez@example.com",
    name: "Laura Martínez",
    role: "mentor",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Laura",
    description:
      "Backend Engineer especializada en arquitecturas escalables y APIs. Experiencia en Go, Python y Node.js. Ex-Staff Engineer en Stripe. Me enfoco en ayudar a developers a diseñar sistemas robustos y escalables.",
    createdAt: new Date("2024-02-05"),
    profile: {
      userId: "6",
      specialties: [
        "Go",
        "Python",
        "PostgreSQL",
        "System Design",
        "API Design",
        "Microservices",
      ],
      hourlyRate: 105,
      linkedinUrl: "https://linkedin.com/in/laura-martinez",
      githubUrl: "https://github.com/lauramartinez",
      isVerified: true,
      averageRating: 4.8,
      totalReviews: 39,
      yearsOfExperience: 9,
    },
  },
  {
    id: "7",
    email: "roberto.sanchez@example.com",
    name: "Roberto Sánchez",
    role: "mentor",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto",
    description:
      "Security Engineer & Ethical Hacker con certificaciones CISSP y CEH. He trabajado en ciberseguridad para bancos y fintech. Ayudo a developers a entender y aplicar security best practices en sus aplicaciones.",
    createdAt: new Date("2024-01-30"),
    profile: {
      userId: "7",
      specialties: [
        "Cybersecurity",
        "Penetration Testing",
        "OWASP",
        "Security Audits",
        "Python",
        "Network Security",
      ],
      hourlyRate: 130,
      linkedinUrl: "https://linkedin.com/in/roberto-sanchez",
      githubUrl: "https://github.com/robertosanchez",
      isVerified: true,
      averageRating: 4.9,
      totalReviews: 24,
      yearsOfExperience: 13,
    },
  },
  {
    id: "8",
    email: "maria.fernandez@example.com",
    name: "María Fernández",
    role: "mentor",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    description:
      "Product Engineer con background en diseño UX/UI y desarrollo frontend. He trabajado en Google y Airbnb. Ayudo a developers a mejorar sus habilidades de product thinking y crear mejores experiencias de usuario.",
    createdAt: new Date("2024-02-15"),
    profile: {
      userId: "8",
      specialties: [
        "UX/UI Design",
        "React",
        "Figma",
        "Product Thinking",
        "Frontend",
        "User Research",
      ],
      hourlyRate: 95,
      linkedinUrl: "https://linkedin.com/in/maria-fernandez",
      githubUrl: "https://github.com/mariafernandez",
      isVerified: true,
      averageRating: 5.0,
      totalReviews: 45,
      yearsOfExperience: 7,
    },
  },
];

// Helper functions
export function getMentorById(id: string): Mentor | undefined {
  return mentors.find((mentor) => mentor.id === id);
}

export function searchMentors(query: string): Mentor[] {
  const lowerQuery = query.toLowerCase();
  return mentors.filter(
    (mentor) =>
      mentor.name.toLowerCase().includes(lowerQuery) ||
      mentor.description.toLowerCase().includes(lowerQuery) ||
      mentor.profile.specialties.some((skill) =>
        skill.toLowerCase().includes(lowerQuery)
      )
  );
}

export function filterMentorsBySkills(skills: string[]): Mentor[] {
  if (skills.length === 0) return mentors;

  return mentors.filter((mentor) =>
    skills.every((skill) =>
      mentor.profile.specialties.some(
        (s) => s.toLowerCase() === skill.toLowerCase()
      )
    )
  );
}

export function getAllSkills(): string[] {
  const skillsSet = new Set<string>();
  mentors.forEach((mentor) => {
    mentor.profile.specialties.forEach((skill) => skillsSet.add(skill));
  });
  return Array.from(skillsSet).sort();
}
