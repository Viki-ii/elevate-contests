const { z } = require("zod");
const signupSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(6),
    role: z.enum(["user", "admin"])
});

const signinSchema = z.object({
    username: z.string(),
    password: z.string()
});

const walletSchema = z.object({
    amount: z.number().positive()
});

const courseSchema = z.object({
    title: z.string(),
    description: z.string(),
    price: z.number().positive()
});

const updateCourseSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    price: z.number().positive().optional()
});

module.exports = {
    signupSchema,
    signinSchema,
    walletSchema,
    courseSchema,
    updateCourseSchema
};