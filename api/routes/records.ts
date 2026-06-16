import { Router } from 'express';
import {
  getMaintenanceRecords,
  saveMaintenanceRecords,
  getServiceItems,
  saveServiceItems,
  getVehicles,
  saveVehicles,
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

router.get('/', (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 20;
  const vehicleId = req.query.vehicleId ? parseInt(req.query.vehicleId as string) : null;
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;

  let records = getMaintenanceRecords();

  if (vehicleId) {
    records = records.filter((r) => r.vehicle_id === vehicleId);
  }
  if (startDate) {
    records = records.filter((r) => r.created_at >= startDate);
  }
  if (endDate) {
    records = records.filter((r) => r.created_at <= endDate + 'T23:59:59');
  }

  records.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const items = getServiceItems();
  const vehicles = getVehicles();

  const total = records.length;
  const start = (page - 1) * pageSize;
  const list = records.slice(start, start + pageSize).map((r) => {
    const vehicle = vehicles.find((v) => v.id === r.vehicle_id);
    return {
      ...r,
      vehicle: vehicle
        ? {
            id: vehicle.id,
            plateNumber: vehicle.plate_number,
            ownerName: vehicle.owner_name,
          }
        : null,
      serviceItems: items.filter((i) => i.record_id === r.id),
    };
  });

  res.json({
    list: toCamelCase(list),
    total,
    page,
    pageSize,
  });
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const records = getMaintenanceRecords();
  const record = records.find((r) => r.id === id);

  if (!record) {
    return res.status(404).json({ error: '记录不存在' });
  }

  const items = getServiceItems().filter((i) => i.record_id === id);
  const vehicles = getVehicles();
  const vehicle = vehicles.find((v) => v.id === record.vehicle_id);

  res.json(
    toCamelCase({
      ...record,
      vehicle,
      serviceItems: items,
    })
  );
});

router.post('/', (req, res) => {
  const {
    vehicleId,
    mileage,
    serviceItems,
    mechanicId,
    mechanicName,
    totalCost,
    notes,
    startTime,
    endTime,
    durationMinutes,
    isRework,
  } = req.body;

  if (!vehicleId || !mileage || !serviceItems || serviceItems.length === 0) {
    return res.status(400).json({ error: '车辆ID、里程、维修项目为必填项' });
  }

  const vehicles = getVehicles();
  const vehicleIndex = vehicles.findIndex((v) => v.id === vehicleId);

  if (vehicleIndex === -1) {
    return res.status(404).json({ error: '车辆不存在' });
  }

  const settings = getSettings();
  const maintenanceInterval = settings.maintenanceInterval ?? settings.maintenance_interval ?? 5000;
  const now = new Date().toISOString();
  const recordId = getNextId('maintenanceRecords');

  let calculatedDuration = durationMinutes;
  if (!calculatedDuration && startTime && endTime) {
    calculatedDuration = Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000);
  }

  const newRecord = {
    id: recordId,
    vehicle_id: vehicleId,
    mileage,
    mechanic_id: mechanicId || null,
    mechanic_name: mechanicName || '',
    total_cost: totalCost || 0,
    notes: notes || '',
    start_time: startTime || null,
    end_time: endTime || null,
    duration_minutes: calculatedDuration || null,
    is_rework: isRework || false,
    created_at: now,
  };

  const items = getServiceItems();
  const newItems = serviceItems.map((item: any) => ({
    id: getNextId('serviceItems'),
    record_id: recordId,
    name: item.name,
    category: item.category || '保养',
    price: item.price || 0,
    quantity: item.quantity || 1,
  }));

  const records = getMaintenanceRecords();
  records.push(newRecord);
  saveMaintenanceRecords(records);

  items.push(...newItems);
  saveServiceItems(items);

  vehicles[vehicleIndex].current_mileage = mileage;
  vehicles[vehicleIndex].last_maintenance_date = now;
  vehicles[vehicleIndex].next_maintenance_mileage = mileage + maintenanceInterval;
  vehicles[vehicleIndex].updated_at = now;
  saveVehicles(vehicles);

  res.json(
    toCamelCase({
      ...newRecord,
      serviceItems: newItems,
    })
  );
});

router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const records = getMaintenanceRecords();
  const index = records.findIndex((r) => r.id === id);

  if (index === -1) {
    return res.status(404).json({ error: '记录不存在' });
  }

  const {
    mileage,
    serviceItems,
    mechanicId,
    mechanicName,
    totalCost,
    notes,
    startTime,
    endTime,
    durationMinutes,
    isRework,
  } = req.body;

  let calculatedDuration = durationMinutes;
  if (!calculatedDuration && startTime && endTime) {
    calculatedDuration = Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000);
  } else if (startTime && !endTime && records[index].end_time) {
    calculatedDuration = Math.round((new Date(records[index].end_time).getTime() - new Date(startTime).getTime()) / 60000);
  } else if (!startTime && endTime && records[index].start_time) {
    calculatedDuration = Math.round((new Date(endTime).getTime() - new Date(records[index].start_time).getTime()) / 60000);
  }

  const updated = {
    ...records[index],
    mileage: mileage || records[index].mileage,
    mechanic_id: mechanicId !== undefined ? mechanicId : records[index].mechanic_id,
    mechanic_name: mechanicName !== undefined ? mechanicName : records[index].mechanic_name,
    total_cost: totalCost !== undefined ? totalCost : records[index].total_cost,
    notes: notes !== undefined ? notes : records[index].notes,
    start_time: startTime !== undefined ? startTime : records[index].start_time,
    end_time: endTime !== undefined ? endTime : records[index].end_time,
    duration_minutes: calculatedDuration !== undefined ? calculatedDuration : records[index].duration_minutes,
    is_rework: isRework !== undefined ? isRework : records[index].is_rework,
  };

  records[index] = updated;
  saveMaintenanceRecords(records);

  if (serviceItems) {
    let items = getServiceItems();
    items = items.filter((i) => i.record_id !== id);

    const newItems = serviceItems.map((item: any) => ({
      id: getNextId('serviceItems'),
      record_id: id,
      name: item.name,
      category: item.category || '保养',
      price: item.price || 0,
      quantity: item.quantity || 1,
    }));

    items.push(...newItems);
    saveServiceItems(items);
  }

  res.json(toCamelCase(updated));
});

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let records = getMaintenanceRecords();

  if (!records.some((r) => r.id === id)) {
    return res.status(404).json({ error: '记录不存在' });
  }

  records = records.filter((r) => r.id !== id);
  saveMaintenanceRecords(records);

  let items = getServiceItems();
  items = items.filter((i) => i.record_id !== id);
  saveServiceItems(items);

  res.json({ success: true });
});

export default router;
