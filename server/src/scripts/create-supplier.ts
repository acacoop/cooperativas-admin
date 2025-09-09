import db from '../config/database';
import bcrypt from 'bcryptjs';
import { User } from '../types';

async function createSupplier(): Promise<void> {
  try {
    const supplier: Partial<User> = {
      username: 'proveedor_test',
      email: 'proveedor@test.com',
      password: await bcrypt.hash('proveedor123', 10),
      role: 'proveedor',
      company_name: 'Proveedor de Prueba S.A.',
      cuit: '20-12345678-9'
    };

    const result = await db.run(
      `INSERT INTO users (username, email, password, role, company_name, cuit)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        supplier.username,
        supplier.email,
        supplier.password,
        supplier.role,
        supplier.company_name,
        supplier.cuit
      ]
    );

    console.log('Supplier created with ID:', result.lastID);
  } catch (error) {
    console.error('Error creating supplier:', error);
  }
}

createSupplier();
