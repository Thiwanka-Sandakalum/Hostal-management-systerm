import express from 'express';
import bodyParser from 'body-parser';
import router from './router.';
import { PrismaClient } from '@prisma/client';

const app = express();
const PORT = process.env.PORT || 3001;
const prisma = new PrismaClient();

// Middleware
app.use(bodyParser.json());

// Routes
app.use('', router);

process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing Prisma Client');
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing Prisma Client');
    await prisma.$disconnect();
    process.exit(0);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
