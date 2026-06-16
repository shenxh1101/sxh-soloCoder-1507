import { Router } from 'express';
import {
  getFollowUpRecords,
  saveFollowUpRecords,
  getNextId,
  getVehicles,
} from '../db.js';

const router = Router();

function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  if (obj && typeof obj === 'object') {
    const result: any = {};
    for (const key of Object.keys(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      result[camelKey] = toCamelCase(obj[key]);
    }
    return result;
  }
  return obj;
}

function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  }
  if (obj && typeof obj === 'object') {
    const result: any = {};
    for (const key of Object.keys(obj)) {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      result[snakeKey] = toSnakeCase(obj[key]);
    }
    return result;
  }
  return obj;
}

function attachVehicleInfo(records: any[]): any[] {
  const vehicles = getVehicles();
  const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));
  return records.map((r) => ({
    ...r,
    vehicle: vehicleMap.get(r.vehicle_id) || null,
  }));
}

router.get('/', (req, res) => {
  const { status, dateFrom, dateTo, scheduledDateFrom, scheduledDateTo } = req.query;
  
  let records = getFollowUpRecords();
  
  if (status && status !== 'all') {
    records = records.filter((r) => r.status === status);
  }
  
  if (dateFrom) {
    const from = new Date(dateFrom as string);
    records = records.filter((r) => new Date(r.created_at) >= from);
  }
  
  if (dateTo) {
    const to = new Date(dateTo as string);
    to.setHours(23, 59, 59, 999);
    records = records.filter((r) => new Date(r.created_at) <= to);
  }
  
  if (scheduledDateFrom) {
    const from = new Date(scheduledDateFrom as string);
    records = records.filter((r) => r.scheduled_date && new Date(r.scheduled_date) >= from);
  }
  
  if (scheduledDateTo) {
    const to = new Date(scheduledDateTo as string);
    to.setHours(23, 59, 59, 999);
    records = records.filter((r) => r.scheduled_date && new Date(r.scheduled_date) <= to);
  }
  
  records = attachVehicleInfo(records);
  records = records.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  res.json(toCamelCase(records));
});

router.get('/vehicle/:vehicleId', (req, res) => {
  const vehicleId = parseInt(req.params.vehicleId);
  let records = getFollowUpRecords()
    .filter((r) => r.vehicle_id === vehicleId);
  
  records = attachVehicleInfo(records);
  records = records.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  res.json(toCamelCase(records));
});

router.post('/', (req, res) => {
  const { vehicleId, type, content, scheduledDate, status, source, arrivedAt } = req.body;

  if (!vehicleId || !type || !content) {
    return res.status(400).json({ error: '缺少必要字段' });
  }

  const records = getFollowUpRecords();
  const now = new Date().toISOString();
  const newRecord = {
    id: getNextId('followUpRecords'),
    vehicle_id: vehicleId,
    type,
    content,
    scheduled_date: scheduledDate || null,
    status: status || 'called',
    source: source || null,
    arrived_at: arrivedAt || null,
    created_at: now,
    created_by: '管理员',
  };

  records.push(newRecord);
  saveFollowUpRecords(records);
  
  const recordsWithVehicle = attachVehicleInfo([newRecord]);
  res.json(toCamelCase(recordsWithVehicle[0]));
});

router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const records = getFollowUpRecords();
  const index = records.findIndex((r) => r.id === id);

  if (index === -1) {
    return res.status(404).json({ error: '记录不存在' });
  }

  const updateData = toSnakeCase(req.body);
  
  if (updateData.scheduled_date === '' || updateData.scheduled_date === undefined) {
    updateData.scheduled_date = null;
  }
  
  if (updateData.status === 'arrived' && !records[index].arrived_at) {
    updateData.arrived_at = new Date().toISOString();
  }
  
  if (updateData.status && updateData.status !== 'scheduled' && updateData.status !== 'arrived') {
    updateData.scheduled_date = null;
  }
  
  records[index] = { ...records[index], ...updateData };
  saveFollowUpRecords(records);
  
  const recordsWithVehicle = attachVehicleInfo([records[index]]);
  res.json(toCamelCase(recordsWithVehicle[0]));
});

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const records = getFollowUpRecords();
  const filtered = records.filter((r) => r.id !== id);

  if (filtered.length === records.length) {
    return res.status(404).json({ error: '记录不存在' });
  }

  saveFollowUpRecords(filtered);
  res.json({ success: true });
});

export default router;
