const { z } = require('zod');

// Schema for user registration
const registerSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
  name: z.string()
    .min(2, { message: "Name must be at least 2 characters long" })
    .regex(/^[^<>]*$/, { message: "Name cannot contain HTML tags or special characters like < and >" }),
  role: z.enum(['customer', 'company', 'worker']).optional(),
});

// Schema for user login
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

module.exports = {
  registerSchema,
  loginSchema,
};
