import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Anti Fraud Ticketing API",
      version: "1.0.0",
      description:
        "REST API for Anti Fraud Ticketing System built with Express, TypeScript, Prisma, PostgreSQL, Redis, and BullMQ.",
    },

    servers: [
      {
        url: "http://localhost:8000",
        description: "Development Server",
      },
    ],

    tags: [
      {
        name: "Auth",
        description: "Authentication endpoints",
      },
      {
        name: "Events",
        description: "Event management",
      },
      {
        name: "Booking",
        description: "Ticket reservation endpoints",
      },
      {
        name: "Payments",
        description: "Payment endpoints",
      },
      {
        name: "Analytics",
        description: "Analytics and dashboard",
      },
      {
        name: "Audit",
        description: "Audit log endpoints",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },

  apis: ["./src/**/*.route.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);