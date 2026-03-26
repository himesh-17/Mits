let data: any[] = [
  {
    id: "#BDPLON",
    name: "Arjun Mehta",
    course: "BTECH",
    status: "pending",
    date: "06 Mar 2026",
  },
];

export const getAdminData = () => data;

export const setAdminData = (newData: any[]) => {
  data = newData;
};

export const refreshAdminData = () => {
  data = [
    {
      id: "#NEW001",
      name: "Amit Jain",
      course: "BBA",
      status: "approved",
      date: "07 Mar 2026",
    },
    {
      id: "#NEW002",
      name: "Sneha Patel",
      course: "MTECH",
      status: "pending",
      date: "07 Mar 2026",
    },
  ];
};
