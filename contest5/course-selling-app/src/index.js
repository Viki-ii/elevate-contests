const express = require("express");
const { users, courses } = require("./db");
const auth = require("./middleware");
const { signupSchema, signinSchema, walletSchema, courseSchema, updateCourseSchema } = require("./schemas");

const app = express();

app.use(express.json());

app.post("/signup", (req, res) => {
    const result = signupSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid inputs"
        });
    }

    const { username, password, role } = req.body;

    const existingUser = users.find(
        user => user.username === username
    );

    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: "Username already exists"
        });
    }

    const token = Math.random().toString();

    const newUser = {
        id: `user_${users.length + 1}`,
        username,
        password,
        role,
        wallet: 0,
        purchasedCourses: [],
        token
    };

    users.push(newUser);

    res.status(201).json({
        success: true,
        message: "Signup successful",
        token
    });

});


app.post("/signin", (req, res) => {

    const result = signinSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid inputs"
        });
    }

    const { username, password } = req.body;

    const user = users.find(
        u => u.username === username
    );

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }

    if (user.password !== password) {
        return res.status(400).json({
            success: false,
            message: "Incorrect password"
        });
    }

    const token = Math.random().toString();

    user.token = token;

    res.json({
        success: true,
        message: "Signin successful",
        token
    });

});

app.post("/wallet/add", auth, (req, res) => {

if (req.user.role !== "user") {
    return res.status(403).json({
        success: false,
        message: "Only users can add money"
    });
}

const result = walletSchema.safeParse(req.body);

if (!result.success) {
    return res.status(400).json({
        success: false,
        message: "Invalid amount"
    });
}

const { amount } = req.body;

req.user.wallet += amount;

res.json({
    success: true,
    wallet: req.user.wallet
});

});




app.post("/courses", auth, (req, res) => {

if (req.user.role !== "admin") {
    return res.status(403).json({
        success: false,
        message: "Only admins can create courses"
    });
}

const result = courseSchema.safeParse(req.body);

if (!result.success) {
    return res.status(400).json({
        success: false,
        message: "Invalid course data"
    });
}

const { title, description, price } = req.body;

const newCourse = {
    id: `course_${courses.length + 1}`,
    title,
    description,
    price,
    createdBy: req.user.id
};

courses.push(newCourse);

res.status(201).json({
    success: true,
    message: "Course created",
    courseId: newCourse.id
});

});




app.put("/courses/:courseId", auth, (req, res) => {

if (req.user.role !== "admin") {
    return res.status(403).json({
        success: false,
        message: "Only admins can update courses"
    });
}

const result = updateCourseSchema.safeParse(req.body);

if (!result.success) {
    return res.status(400).json({
        success: false,
        message: "Invalid course data"
    });
}

const course = courses.find(
    c => c.id === req.params.courseId
);

if (!course) {
    return res.status(404).json({
        success: false,
        message: "Course not found"
    });
}

if (course.createdBy !== req.user.id) {
    return res.status(403).json({
        success: false,
        message: "You did not create this course"
    });
}

const { title, description, price } = req.body;

if (title) {
    course.title = title;
}

if (description) {
    course.description = description;
}

if (price) {
    course.price = price;
}

res.json({
    success: true,
    message: "Course updated"
});

});

app.get("/admin/courses", auth, (req, res) => {

if (req.user.role !== "admin") {
    return res.status(403).json({
        success: false,
        message: "Only admins can view their courses"
    });
}

const myCourses = courses.filter(
    course => course.createdBy === req.user.id
);

res.json({
    success: true,
    courses: myCourses
});

});


app.get("/courses", (req, res) => {

res.json({
    success: true,
    courses
});

});




app.post("/courses/:courseId/purchase", auth, (req, res) => {

if (req.user.role !== "user") {
    return res.status(403).json({
        success: false,
        message: "Only users can purchase courses"
    });
}

const course = courses.find(
    c => c.id === req.params.courseId
);

if (!course) {
    return res.status(404).json({
        success: false,
        message: "Course not found"
    });
}

if (req.user.purchasedCourses.includes(course.id)) {
    return res.status(400).json({
        success: false,
        message: "Course already purchased"
    });
}

if (req.user.wallet < course.price) {
    return res.status(400).json({
        success: false,
        message: "Insufficient balance"
    });
}

req.user.wallet -= course.price;

req.user.purchasedCourses.push(course.id);

res.json({
    success: true,
    message: "Course purchased",
    remainingWallet: req.user.wallet
});

});



app.get("/purchased", auth, (req, res) => {

if (req.user.role !== "user") {
    return res.status(403).json({
        success: false,
        message: "Only users can view purchased courses"
    });
}

const purchasedCourses = courses.filter(
    course => req.user.purchasedCourses.includes(course.id)
);

res.json({
    success: true,
    courses: purchasedCourses
});

});



app.get("/me", auth, (req, res) => {

res.json({
    success: true,
    user: {
        id: req.user.id,
        username: req.user.username,
        role: req.user.role,
        wallet: req.user.wallet
    }
});

});


app.listen(3000, () => {
    console.log("server running on port 3000");
})