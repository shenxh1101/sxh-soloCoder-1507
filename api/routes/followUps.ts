import { Router } from 'express';
import {
  getFollowUpRecords,
  saveFollowUpRecords,
  getNextId,
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

router.get('/vehicle/:vehicleId', (req, res) => {
  const vehicleId = parseInt(req.params.vehicleId);
  const records = getFollowUpRecords()
    .filter((r) => r.vehicle_id === vehicleId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  res.json(toCamelCase(records));
});

router.post('/', (req, res) => {
  const { vehicleId, type, content, scheduledDate, status } = req.body;

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
    created_at: now,
    created_by: '管理员',
  };

  records.push(newRecord);
  saveFollowUpRecords(records);
  res.json(toCamelCase(newRecord));
});

router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const records = getFollowUpRecords();
  const index = records.findIndex((r) => r.id === id);

  if (index === -1) {
    return res.status(404).json({ error: '记录不存在' });
  }

  const updateData = toSnakeCase(req.body);
  records[index] = { ...records[index], ...updateData };
  saveFollowUpRecords(records);
  res.json(toCamelCase(records[index]));
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
