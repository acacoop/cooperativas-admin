import sqlite3 from 'sqlite3';
import { Database as SQLiteDatabase } from 'sqlite3';
import path from 'path';

class Database {
  private static instance: Database;
  private db: SQLiteDatabase;

  private constructor() {
    this.db = new sqlite3.Database(path.join(__dirname, '../../cooperativas.db'));
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public getDatabase(): SQLiteDatabase {
    return this.db;
  }

  public async run(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  public async get<T>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        resolve(row as T);
      });
    });
  }

  public async all<T>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        resolve(rows as T[]);
      });
    });
  }

  public async initTables(): Promise<void> {
    await this.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin_aca', 'operador_aca', 'admin_coop', 'proveedor')),
      cooperative_id INTEGER,
      full_name TEXT,
      company_name TEXT,
      cuit TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await this.run(`CREATE TABLE IF NOT EXISTS cooperatives (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code INTEGER UNIQUE NOT NULL,
      cuit TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      votes INTEGER,
      substitutes INTEGER,
      car INTEGER,
      car_name TEXT,
      verification_code TEXT,
      address TEXT,
      phone TEXT,
      email TEXT,
      president TEXT,
      secretary TEXT,
      treasurer TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await this.run(`CREATE TABLE IF NOT EXISTS pending_changes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cooperative_id INTEGER,
      user_id INTEGER,
      changes TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      reviewed_by INTEGER,
      reviewed_at DATETIME,
      FOREIGN KEY (cooperative_id) REFERENCES cooperatives (id),
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (reviewed_by) REFERENCES users (id)
    )`);

    await this.run(`CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT NOT NULL,
      issue_date DATE NOT NULL,
      issuer_cuit TEXT NOT NULL,
      receiver_cuit TEXT NOT NULL,
      cooperative_id INTEGER,
      supplier_id INTEGER,
      subtotal DECIMAL(12,2),
      iva_amount DECIMAL(12,2),
      total_amount DECIMAL(12,2) NOT NULL,
      status TEXT DEFAULT 'pendiente_validacion',
      file_path TEXT,
      original_filename TEXT,
      rejection_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      validated_at DATETIME,
      sent_at DATETIME,
      responded_at DATETIME,
      FOREIGN KEY (cooperative_id) REFERENCES cooperatives(id),
      FOREIGN KEY (supplier_id) REFERENCES users(id)
    )`);

    await this.run(`CREATE TABLE IF NOT EXISTS invoice_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      quantity DECIMAL(10,2) NOT NULL,
      unit_price DECIMAL(10,2) NOT NULL,
      total_price DECIMAL(10,2) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
    )`);
  }
}

export default Database.getInstance();
