// src/services/apiUser.js
const users = [
    {
        id: 1,
        name: "Neil Sims",
        email: "neil.sims@windster.com",
        position: "Front-end developer",
        country: "United States",
        status: "active",
        role: "admin",
      },
      {
        id: 2,
        name: "Roberta Casas",
        email: "roberta.casas@windster.com",
        position: "Designer",
        country: "Spain",
        status: "inactive",
        role: "user",
      },
      {
        id: 3,
        name: "Michael Gough",
        email: "michael.gough@windster.com",
        position: "React developer",
        country: "United Kingdom",
        status: "pending",
        role: "moderator",
      },
      {
        id: 4,
        name: "Angela Gray",
        email: "angela.gray@windster.com",
        position: "Project Manager",
        country: "Canada",
        status: "active",
        role: "admin",
      },
      {
        id: 5,
        name: "Brandon Lee",
        email: "brandon.lee@windster.com",
        position: "Backend developer",
        country: "Singapore",
        status: "inactive",
        role: "user",
      },
      {
        id: 6,
        name: "Sophia Turner",
        email: "sophia.turner@windster.com",
        position: "UI/UX Designer",
        country: "Australia",
        status: "pending",
        role: "moderator",
      },
      {
        id: 7,
        name: "James Wilson",
        email: "james.wilson@windster.com",
        position: "Fullstack developer",
        country: "United States",
        status: "active",
        role: "user",
      },
      {
        id: 8,
        name: "Maria Gonzalez",
        email: "maria.gonzalez@windster.com",
        position: "Data Analyst",
        country: "Mexico",
        status: "inactive",
        role: "moderator",
      },
      {
        id: 9,
        name: "David Brown",
        email: "david.brown@windster.com",
        position: "DevOps Engineer",
        country: "United Kingdom",
        status: "pending",
        role: "admin",
      },
      {
        id: 10,
        name: "Emma Watson",
        email: "emma.watson@windster.com",
        position: "QA Engineer",
        country: "France",
        status: "active",
        role: "user",
      },
      {
        id: 11,
        name: "Liam Johnson",
        email: "liam.johnson@windster.com",
        position: "Mobile Developer",
        country: "Germany",
        status: "inactive",
        role: "moderator",
      },
      {
        id: 12,
        name: "Olivia Martinez",
        email: "olivia.martinez@windster.com",
        position: "Product Owner",
        country: "Brazil",
        status: "active",
        role: "admin",
      },
      {
        id: 13,
        name: "Noah Davis",
        email: "noah.davis@windster.com",
        position: "System Architect",
        country: "Italy",
        status: "pending",
        role: "user",
      },
      {
        id: 14,
        name: "Ava Thompson",
        email: "ava.thompson@windster.com",
        position: "Business Analyst",
        country: "Sweden",
        status: "active",
        role: "moderator",
      },
      {
        id: 15,
        name: "Ethan Clark",
        email: "ethan.clark@windster.com",
        position: "Security Engineer",
        country: "Netherlands",
        status: "inactive",
        role: "user",
      },
      {
        id: 16,
        name: "Isabella Lewis",
        email: "isabella.lewis@windster.com",
        position: "AI Engineer",
        country: "Japan",
        status: "active",
        role: "admin",
      },
      {
        id: 17,
        name: "Mason Walker",
        email: "mason.walker@windster.com",
        position: "Blockchain Developer",
        country: "Switzerland",
        status: "pending",
        role: "moderator",
      },
      {
        id: 18,
        name: "Mia Scott",
        email: "mia.scott@windster.com",
        position: "Marketing Specialist",
        country: "Argentina",
        status: "active",
        role: "user",
      },
      {
        id: 19,
        name: "Lucas Young",
        email: "lucas.young@windster.com",
        position: "Support Engineer",
        country: "South Korea",
        status: "inactive",
        role: "moderator",
      },
      {
        id: 20,
        name: "Charlotte King",
        email: "charlotte.king@windster.com",
        position: "Cloud Engineer",
        country: "India",
        status: "active",
        role: "admin",
      },
  ];
  
  export const apiUser = {
    async fetch() {
      // simulasi delay API
      return new Promise((resolve) => {
        setTimeout(() => resolve([...users]), 500);
      });
    },
  
    async fetchById(id) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(users.find((u) => u.id === id)), 300);
      });
    },
  
    async create(data) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newUser = { id: Date.now(), ...data };
          users.push(newUser);
          resolve(newUser);
        }, 300);
      });
    },
  
    async update(id, data) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const idx = users.findIndex((u) => u.id === id);
          if (idx !== -1) {
            users[idx] = { ...users[idx], ...data };
            resolve(users[idx]);
          } else {
            resolve(null);
          }
        }, 300);
      });
    },
  
    async remove(id) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const idx = users.findIndex((u) => u.id === id);
          if (idx !== -1) {
            const deleted = users.splice(idx, 1)[0];
            resolve(deleted);
          } else {
            resolve(null);
          }
        }, 300);
      });
    },
  };
  