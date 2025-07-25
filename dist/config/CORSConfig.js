"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsOptions = void 0;
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://localhost:5174',
    'https://nusantara-edu.vercel.app',
    'https://dashboard.nusantaraedu.id'
];
exports.corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS policy'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-API-Key'
    ],
    exposedHeaders: ['X-Total-Count'],
    maxAge: 86400, // 24 hours
    preflightContinue: false,
    optionsSuccessStatus: 204
};
exports.default = exports.corsOptions;
