const zod = require("zod");

const SignupSchema = zod.object({
    username: zod.string(),
    password: zod.string().min(6)
});

const SigninSchema = zod.object({
    username: zod.string(),
    password: zod.string()
});

const CreateWorkspaceSchema = zod.object({
    name: zod.string()
});

const CreateTaskSchema = zod.object({
    title: zod.string(),
    description: zod.string(),
    dueDate: zod.string()
});

module.exports = {
    SignupSchema,
    SigninSchema,
    CreateWorkspaceSchema,
    CreateTaskSchema
};