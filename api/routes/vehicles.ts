import { Router } from 'express';
import {
  getVehicles,
  saveVehicles,
  getMaintenanceRecords,
  getServiceItems,
  getNextId,
} from '../db.js';
import type { Vehicle, MaintenanceRecord, PaginatedResponse } from '../../shared/types.js';

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
      const snakeKey = key.replace(/[A-Z]/g, (g) => '_' + g.toLowerCase());
      result[snakeKey] = toSnakeCase(obj[key]);
    }
    return result;
  }
  return obj;
}

router.get('/', (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 20;
  const keyword = (req.query.keyword as string) || '';

  let vehicles = getVehicles();

  if (keyword) {
    const kw = keyword.toLowerCase();
    vehicles = vehicles.filter(
      (v) =>
        v.plate_number?.toLowerCase().includes(kw) ||
        v.owner_name?.toLowerCase().includes(kw) ||
        v.owner_phone?.includes(kw) ||
        v.car_model?.toLowerCase().includes(kw)
    );
  }

  const total = vehicles.length;
  const start = (page - 1) * pageSize;
  const list = vehicles.slice(start, start + pageSize);

  res.json({
    list: toCamelCase(list),
    total,
    page,
    pageSize,
  } as PaginatedResponse<Vehicle>);
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const vehicles = getVehicles();
  const vehicle = vehicles.find((v) => v.id === id);

  if (!vehicle) {
    return res.status(404).json({ error: '车辆不存在' });
  }

  const records = getMaintenanceRecords()
    .filter((r) => r.vehicle_id === id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const items = getServiceItems();
  const recordsWithItems = records.map((r) => ({
    ...r,
    serviceItems: items.filter((i) => i.record_id === r.id),
  }));

  res.json({
    vehicle: toCamelCase(vehicle),
    records: toCamelCase(recordsWithItems),
  });
});

router.post('/', (req, res) => {
  const { plateNumber, ownerName, ownerPhone, carModel, color, vin, currentMileage } = req.body;

  if (!plateNumber || !ownerName || !ownerPhone) {
    return res.status(400).json({ error: '车牌号、车主姓名、车主电话为必填项' });
  }

  const vehicles = getVehicles();

  if (vehicles.some((v) => v.plate_number === plateNumber)) {
    return res.status(400).json({ error: '该车牌号已存在' });
  }

  const now = new Date().toISOString();
  const newVehicle = {
    id: getNextId('vehicles'),
    plate_number: plateNumber,
    owner_name: ownerName,
    owner_phone: ownerPhone,
    car_model: carModel || '',
    color: color || '',
    vin: vin || '',
    current_mileage: currentMileage || 0,
    last_maintenance_date: null,
    next_maintenance_mileage: 0,
    created_at: now,
    updated_at: now,
  };

  vehicles.push(newVehicle);
  saveVehicles(vehicles);

  res.json(toCamelCase(newVehicle));
});

router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const vehicles = getVehicles();
  const index = vehicles.findIndex((v) => v.id === id);

  if (index === -1) {
    return res.status(404).json({ error: '车辆不存在' });
  }

  const { plateNumber, ownerName, ownerPhone, carModel, color, vin, currentMileage } = req.body;

  if (plateNumber && plateNumber !== vehicles[index].plate_number) {
    if (vehicles.some((v) => v.plate_number === plateNumber && v.id !== id)) {
      return res.status(400).json({ error: '该车牌号已存在' });
    }
  }

  const updated = {
    ...vehicles[index],
    plate_number: plateNumber || vehicles[index].plate_number,
    owner_name: ownerName || vehicles[index].owner_name,
    owner_phone: ownerPhone || vehicles[index].owner_phone,
    car_model: carModel !== undefined ? carModel : vehicles[index].car_model,
    color: color !== undefined ? color : vehicles[index].color,
    vin: vin !== undefined ? vin : vehicles[index].vin,
    current_mileage: currentMileage !== undefined ? currentMileage : vehicles[index].current_mileage,
    updated_at: new Date().toISOString(),
  };

  vehicles[index] = updated;
  saveVehicles(vehicles);

  res.json(toCamelCase(updated));
});

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let vehicles = getVehicles();

  if (!vehicles.some((v) => v.id === id)) {
    return res.status(404).json({ error: '车辆不存在' });
  }

  vehicles = vehicles.filter((v) => v.id !== id);
  saveVehicles(vehicles);

  res.json({ success: true });
});

export default router;
