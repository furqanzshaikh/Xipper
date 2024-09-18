const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Yup = require('yup');
const validator = require('validator');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();



const registrationSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email format').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters long').required('Password is required'),
    name: Yup.string().min(3,'Name must be at least 3 characters long').required('Name is required'),
});


const loginSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email format').required('Email is required'),
    password: Yup.string().required('Password is required'),
});


exports.register = async (req, res) => {
    const { email, password, name } = req.body;
    console.log(email, password, name)
    
    try {
        await registrationSchema.validate({ email, password, name }, { abortEarly: false });

        const sanitizedEmail = validator.normalizeEmail(email);
        const sanitizedName = validator.escape(name);

        const hashedPassword = await bcrypt.hash(password, 10);


        const user = await prisma.user.create({
            data: { email: sanitizedEmail, password: hashedPassword, name: sanitizedName },
        });

        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
        } else {
            res.status(400).json({ error: 'Error registering user', details: error.message });
        }
    }
};


exports.login = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        await loginSchema.validate({ email, password }, { abortEarly: false });

        const sanitizedEmail = validator.normalizeEmail(email);


        const user = await prisma.user.findUnique({ where: { email: sanitizedEmail } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ error: 'Invalid password' });

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ message: 'Login successful', token });
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
        } else {
            res.status(400).json({ error: 'Error logging in', details: error.message });
        }
    }
};
