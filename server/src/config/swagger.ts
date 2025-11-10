import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ACA Cooperativas Admin API',
      version: '1.0.0',
      description: 'API para la gestión de facturas de cooperativas de ACA',
      contact: {
        name: 'ACA Support',
        email: 'support@aca.com.ar'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            username: { type: 'string' },
            email: { type: 'string' },
            role: { 
              type: 'string',
              enum: ['admin_aca', 'operador_aca', 'admin_coop', 'proveedor']
            },
            cooperativeId: { type: 'integer', nullable: true },
            fullName: { type: 'string', nullable: true },
            companyName: { type: 'string', nullable: true },
            cuit: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Cooperative: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            code: { type: 'integer' },
            cuit: { type: 'string' },
            name: { type: 'string' },
            address: { type: 'string', nullable: true },
            phone: { type: 'string', nullable: true },
            email: { type: 'string', nullable: true },
            status: { type: 'string' },
            invoiceSystemActive: { type: 'boolean', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Invoice: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            invoiceNumber: { type: 'string' },
            issueDate: { type: 'string', format: 'date-time' },
            issuerCuit: { type: 'string' },
            receiverCuit: { type: 'string' },
            cooperativeId: { type: 'integer', nullable: true },
            supplierId: { type: 'integer', nullable: true },
            subtotal: { type: 'number', nullable: true },
            ivaAmount: { type: 'number', nullable: true },
            totalAmount: { type: 'number' },
            status: { type: 'string' },
            statusUpdatedBy: { type: 'integer', nullable: true },
            costCenter: { type: 'string', nullable: true },
            category: { type: 'string', nullable: true },
            filePath: { type: 'string', nullable: true },
            originalFilename: { type: 'string', nullable: true },
            rejectionReason: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            validatedAt: { type: 'string', format: 'date-time', nullable: true }
          }
        },
        CostCenter: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            cooperativeId: { type: 'integer' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        InvoiceCategory: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            color: { type: 'string', nullable: true },
            cooperativeId: { type: 'integer' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts'
  ]
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'ACA Cooperativas Admin API Documentation'
  }));

  // Serve OpenAPI JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};

export { specs };