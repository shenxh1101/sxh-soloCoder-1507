import { Router } from 'express';
import {
  getSettings,
  saveSettings,
  getMechanics,
  saveMechanics,
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

router.get('/settings', (req, res) => {
  res.json(toCamelCase(getSettings()));
});

router.put('/settings', (req, res) => {
  const { maintenanceInterval, reminderThreshold, shopName, shopPhone, shopAddress } =
    req.body;

  const current = getSettings();
  const updated = {
    ...current,
    maintenance_interval: maintenanceInterval ?? current.maintenance_interval,
    reminder_threshold: reminderThreshold ?? current.reminder_threshold,
    shop_name: shopName ?? current.shop_name,
    shop_phone: shopPhone ?? current.shop_phone,
    shop_address: shopAddress ?? current.shop_address,
  };

  saveSettings(updated);
  res.json(toCamelCase(updated));
});

router.get('/mechanics', (req, res) => {
  const mechanics = getMechanics();
  res.json(toCamelCase(mechanics));
});

router.post('/mechanics', (req, res) => {
  const { name, phone, specialty } = req.body;

  if (!name) {
    return res.status(400).json({ error: '师傅姓名为必填项' });
  }

  const mechanics = getMechanics();
  const now = new Date().toISOString();

  const newMechanic = {
    id: getNextId('mechanics'),
    name,
    phone: phone || '',
    specialty: specialty || '',
    created_at: now,
  };

  mechanics.push(newMechanic);
  saveMechanics(mechanics);

  res.json(toCamelCase(newMechanic));
});

router.put('/mechanics/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const mechanics = getMechanics();
  const index = mechanics.findIndex((m) => m.id === id);

  if (index === -1) {
    return res.status(404).json({ error: '师傅不存在' });
  }

  const { name, phone, specialty } = req.body;

  mechanics[index] = {
    ...mechanics[index],
    name: name || mechanics[index].name,
    phone: phone !== undefined ? phone : mechanics[index].phone,
    specialty: specialty !== undefined ? specialty : mechanics[index].specialty,
  };

  saveMechanics(mechanics);
  res.json(toCamelCase(mechanics[index]));
});

router.delete('/mechanics/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let mechanics = getMechanics();

  if (!mechanics.some((m) => m.id === id)) {
    return res.status(404).json({ error: '师傅不存在' });
  }

  mechanics = mechanics.filter((m) => m.id !== id);
  saveMechanics(mechanics);

  res.json({ success: true });
});

export default router;
