export const swaggerSecurityDefinitions = {
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'apiKey',
                in: 'header',
                name: 'Authorization',
                description: 'Bearer [token] formatında JWT token giriniz.'
            },
            refreshTokenAuth: {
                type: 'apiKey',
                in: 'header',
                name: 'x-refresh-token',
                description: 'Yenileme (Refresh) tokenını buraya giriniz.'
            }
        },
    },
    security: [
        {
            bearerAuth: [],
        }
    ],
};
