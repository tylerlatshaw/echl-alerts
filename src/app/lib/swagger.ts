import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "ECHL Alerts API",
            version: "1.0.0",
            description: "API for ECHL Alerts",
        },
        tags: [{
            name: "League",
        },
        {
            name: "Subscription",
        },
        {
            name: "Debug",
        }],
        components: {
            securitySchemes: {
                ApiKeyAuth: {
                    type: "apiKey",
                    in: "header",
                    name: "x-api-key",
                },
            },
        },
        servers: [
            {
                url: process.env.NODE_ENV === "development"
                    ? "http://localhost:3000"
                    : "https://echl.tylerlatshaw.com",
            },
        ],
    },
    apis: ["./src/app/api/**/route.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);
