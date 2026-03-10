import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { swaggerSecurityDefinitions } from './swaggerAuth.js';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Muhasebe API',
            version: '1.0.0',
            description: 'Muhasebe uygulaması için RESTful API dokümantasyonu',
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Genel API Sunucusu',
            },
        ],
        ...swaggerSecurityDefinitions,
    },
    // Swagger JSDoc'ın okuyacağı rotalar
    apis: ['./src/Routers/*.js', './src/SwaggerSchemes/*.js'],
};

export const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app, port) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log(`📑 Swagger Dokümantasyonu http://localhost:${port}/api-docs adresinde yayında`);
};
