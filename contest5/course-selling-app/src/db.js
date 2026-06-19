const users = [
      {
    id: "user_1",
    username: "rahul",
    password: "123456",
    role: "user",
    wallet: 0,
    purchasedCourses: [],
    token: null
  }
]
const courses = [
    {
    id: "course_1",
    title: "Node.js Basics",
    description: "Learn Node.js",
    price: 499,
    createdBy: "admin_1"
  }
];

module.exports = {
    users,
    courses
};
