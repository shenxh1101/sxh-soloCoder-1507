import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const CURRENT_DB_VERSION = 4;

interface Database {
  version: number;
  vehicles: any[];
  maintenanceRecords: any[];
  serviceItems: any[];
  mechanics: any[];
  reminders: any[];
  followUpRecords: any[];
  settings: any;
  nextIds: {
    vehicles: number;
    maintenanceRecords: number;
    serviceItems: number;
    mechanics: number;
    reminders: number;
    followUpRecords: number;
  };
}

const defaultDB: Database = {
  version: CURRENT_DB_VERSION,
  vehicles: [],
  maintenanceRecords: [],
  serviceItems: [],
  mechanics: [],
  reminders: [],
  followUpRecords: [],
  settings: {
    maintenanceInterval: 5000,
    reminderThreshold: 1000,
    shopName: '诚信汽修店',
    shopPhone: '400-123-4567',
    shopAddress: '北京市朝阳区汽修街88号',
  },
  nextIds: {
    vehicles: 1,
    maintenanceRecords: 1,
    serviceItems: 1,
    mechanics: 1,
    reminders: 1,
    followUpRecords: 1,
  },
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function backupDB() {
  if (!fs.existsSync(DB_FILE)) return;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(DATA_DIR, `db.backup.${timestamp}.json`);
  try {
    fs.copyFileSync(DB_FILE, backupFile);
    const backups = fs.readdirSync(DATA_DIR)
      .filter(f => f.startsWith('db.backup.'))
      .sort()
      .reverse();
    if (backups.length > 10) {
      backups.slice(10).forEach(f => {
        fs.unlinkSync(path.join(DATA_DIR, f));
      });
    }
  } catch (e) {
    console.warn('Backup failed:', e);
  }
}

function migrateDB(db: any): Database {
  const fromVersion = db.version || 1;
  
  if (fromVersion === CURRENT_DB_VERSION) {
    return db as Database;
  }
  
  backupDB();
  console.log(`Migrating database from v${fromVersion} to v${CURRENT_DB_VERSION}`);
  
  if (fromVersion < 2) {
    db.followUpRecords = db.followUpRecords || [];
    db.followUpRecords = db.followUpRecords.map((f: any) => ({
      ...f,
      source: f.source || null,
      scheduled_date: f.scheduled_date || f.scheduledDate || null,
    }));
  }
  
  if (fromVersion < 3) {
    db.followUpRecords = db.followUpRecords || [];
    db.followUpRecords = db.followUpRecords.map((f: any) => ({
      ...f,
      arrived_at: f.arrived_at || f.arrivedAt || null,
    }));
  }
  
  if (fromVersion < 4) {
    db.maintenanceRecords = db.maintenanceRecords || [];
    db.maintenanceRecords = db.maintenanceRecords.map((r: any) => ({
      ...r,
      start_time: r.start_time || r.startTime || null,
      end_time: r.end_time || r.endTime || null,
      duration_minutes: r.duration_minutes || r.durationMinutes || null,
      is_rework: r.is_rework !== undefined ? r.is_rework : (r.isRework || false),
    }));
  }
  
  db.version = CURRENT_DB_VERSION;
  saveDB(db);
  console.log('Database migration completed');
  return db as Database;
}

export function loadDB(): Database {
  ensureDataDir();
  if (!fs.existsSync(DB_FILE)) {
    saveDB(defaultDB);
    return { ...defaultDB };
  }
  try {
    let data = fs.readFileSync(DB_FILE, 'utf-8');
    if (data.charCodeAt(0) === 0xFEFF) {
      data = data.slice(1);
    }
    let db = JSON.parse(data);
    
    db = migrateDB(db);
    
    db.nextIds = db.nextIds || { ...defaultDB.nextIds };
    db.nextIds.vehicles = Math.max(db.nextIds.vehicles || 1, ...db.vehicles.map((v: any) => v.id), 0) + 1;
    db.nextIds.maintenanceRecords = Math.max(db.nextIds.maintenanceRecords || 1, ...db.maintenanceRecords.map((r: any) => r.id), 0) + 1;
    db.nextIds.serviceItems = Math.max(db.nextIds.serviceItems || 1, ...db.serviceItems.map((i: any) => i.id), 0) + 1;
    db.nextIds.mechanics = Math.max(db.nextIds.mechanics || 1, ...db.mechanics.map((m: any) => m.id), 0) + 1;
    db.nextIds.reminders = Math.max(db.nextIds.reminders || 1, ...db.reminders.map((r: any) => r.id), 0) + 1;
    db.nextIds.followUpRecords = Math.max(db.nextIds.followUpRecords || 1, ...(db.followUpRecords || []).map((f: any) => f.id), 0) + 1;
    
    return db;
  } catch (e) {
    console.error('Failed to load database, using default', e);
    return { ...defaultDB };
  }
}

export function saveDB(db: Database) {
  ensureDataDir();
  const jsonStr = JSON.stringify(db, null, 2);
  const utf8Bom = '\uFEFF';
  fs.writeFileSync(DB_FILE, utf8Bom + jsonStr, 'utf-8');
}

export function getNextId(table: keyof Database['nextIds']): number {
  const db = loadDB();
  const id = db.nextIds[table];
  db.nextIds[table] = id + 1;
  saveDB(db);
  return id;
}

export function getVehicles(): any[] {
  return loadDB().vehicles;
}

export function saveVehicles(vehicles: any[]) {
  const db = loadDB();
  db.vehicles = vehicles;
  saveDB(db);
}

export function getMaintenanceRecords(): any[] {
  return loadDB().maintenanceRecords;
}

export function saveMaintenanceRecords(records: any[]) {
  const db = loadDB();
  db.maintenanceRecords = records;
  saveDB(db);
}

export function getServiceItems(): any[] {
  return loadDB().serviceItems;
}

export function saveServiceItems(items: any[]) {
  const db = loadDB();
  db.serviceItems = items;
  saveDB(db);
}

export function getMechanics(): any[] {
  return loadDB().mechanics;
}

export function saveMechanics(mechanics: any[]) {
  const db = loadDB();
  db.mechanics = mechanics;
  saveDB(db);
}

export function getReminders(): any[] {
  return loadDB().reminders;
}

export function saveReminders(reminders: any[]) {
  const db = loadDB();
  db.reminders = reminders;
  saveDB(db);
}

export function getSettings(): any {
  return loadDB().settings;
}

export function saveSettings(settings: any) {
  const db = loadDB();
  db.settings = settings;
  saveDB(db);
}

export function getFollowUpRecords(): any[] {
  return loadDB().followUpRecords;
}

export function saveFollowUpRecords(records: any[]) {
  const db = loadDB();
  db.followUpRecords = records;
  saveDB(db);
}

export function getDB(): Database {
  return loadDB();
}
