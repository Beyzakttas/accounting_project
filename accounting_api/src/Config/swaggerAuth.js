export const swaggerSecurityDefinitions = {
    components: {
        securitySchemes: {
            AdminAuth: {
                type: 'apiKey',
                in: 'header',
                name: 'Authorization',
                description: 'Sadece Admin kullanıcılar için Bearer [token]'
            },
            UserAuth: {
                type: 'apiKey',
                in: 'header',
                name: 'Authorization',
                description: 'Standart Kullanıcılar için Bearer [token]'
            }
        },
    },
    security: [
        {
            AdminAuth: [],
        },
        {
            UserAuth: []
        }
    ],
};
