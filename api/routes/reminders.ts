import { Router } from 'express';
import {
  getReminders,
  saveReminders,
  getVehicles,
  getSettings,
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

function generateReminders() {
  const settings = getSettings();
  const vehicles = getVehicles();
  const existingReminders = getReminders();
  const now = new Date().toISOString();

  const activeReminderVehicleIds = new Set(
    existingReminders.filter((r) => r.status !== 'completed').map((r) => r.vehicle_id)
  );

  const newReminders: any[] = [];

  vehicles.forEach((vehicle) => {
    if (!vehicle.next_maintenance_mileage) return;
    if (activeReminderVehicleIds.has(vehicle.id)) return;

    const remaining = vehicle.next_maintenance_mileage - vehicle.current_mileage;

    if (remaining <= settings.reminderThreshold) {
      const reminderId = getNextId('reminders');
      newReminders.push({
        id: reminderId,
        vehicle_id: vehicle.id,
        type: 'mileage',
        target_mileage: vehicle.next_maintenance_mileage,
        target_date: null,
        current_mileage: vehicle.current_mileage,
        remaining_mileage: remaining,
        status: 'pending',
        notified_at: null,
        created_at: now,
      });
    }
  });

  if (newReminders.length > 0) {
    const allReminders = [...existingReminders, ...newReminders];
    saveReminders(allReminders);
  }

  return [...existingReminders, ...newReminders];
}

router.get('/', (req, res) => {
  const status = req.query.status as string;
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 20;

  generateReminders();

  let reminders = getReminders();

  if (status) {
    reminders = reminders.filter((r) => r.status === status);
  }

  const vehicles = getVehicles();

  reminders.sort((a, b) => {
    const aRemaining = a.remaining_mileage ?? 999999;
    const bRemaining = b.remaining_mileage ?? 999999;
    return aRemaining - bRemaining;
  });

  const total = reminders.length;
  const start = (page - 1) * pageSize;
  const list = reminders.slice(start, start + pageSize).map((r) => {
    const vehicle = vehicles.find((v) => v.id === r.vehicle_id);
    return {
      ...r,
      vehicle: vehicle
        ? {
            id: vehicle.id,
            plateNumber: vehicle.plate_number,
            ownerName: vehicle.owner_name,
            ownerPhone: vehicle.owner_phone,
            carModel: vehicle.car_model,
            currentMileage: vehicle.current_mileage,
          }
        : null,
    };
  });

  res.json({
    list: toCamelCase(list),
    total,
    page,
    pageSize,
  });
});

router.put('/:id/status', (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;

  if (!['pending', 'notified', 'completed', 'postponed'].includes(status)) {
    return res.status(400).json({ error: '无效的状态' });
  }

  const reminders = getReminders();
  const index = reminders.findIndex((r) => r.id === id);

  if (index === -1) {
    return res.status(404).json({ error: '提醒不存在' });
  }

  reminders[index].status = status;
  if (status === 'notified') {
    reminders[index].notified_at = new Date().toISOString();
  }

  saveReminders(reminders);
  res.json(toCamelCase(reminders[index]));
});

router.post('/:id/postpone', (req, res) => {
  const id = parseInt(req.params.id);
  const { postponeMileage } = req.body;

  const reminders = getReminders();
  const index = reminders.findIndex((r) => r.id === id);

  if (index === -1) {
    return res.status(404).json({ error: '提醒不存在' });
  }

  const postpone = postponeMileage || 1000;
  reminders[index].target_mileage = (reminders[index].target_mileage || 0) + postpone;
  reminders[index].remaining_mileage = (reminders[index].remaining_mileage || 0) + postpone;
  reminders[index].status = 'postponed';

  saveReminders(reminders);
  res.json(toCamelCase(reminders[index]));
});

export default router;
