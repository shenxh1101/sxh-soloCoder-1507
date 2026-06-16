import { Router } from 'express';
import {
  getVehicles,
  getMaintenanceRecords,
  getServiceItems,
  getReminders,
  getMechanics,
  getSettings,
} from '../db.js';

const router = Router();

function getMonthStr(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

router.get('/dashboard', (req, res) => {
  const vehicles = getVehicles();
  const records = getMaintenanceRecords();
  const reminders = getReminders();
  const now = new Date();
  const thisMonth = getMonthStr(now);

  const thisMonthRecords = records.filter((r) => getMonthStr(new Date(r.created_at)) === thisMonth);
  const thisMonthRevenue = thisMonthRecords.reduce((sum, r) => sum + (r.total_cost || 0), 0);
  const pendingReminders = reminders.filter((r) => r.status === 'pending').length;

  res.json({
    totalVehicles: vehicles.length,
    thisMonthRecords: thisMonthRecords.length,
    thisMonthRevenue,
    pendingReminders,
  });
});

router.get('/service-types', (req, res) => {
  const month = (req.query.month as string) || getMonthStr(new Date());
  const items = getServiceItems();
  const records = getMaintenanceRecords();

  const monthRecordIds = new Set(
    records
      .filter((r) => getMonthStr(new Date(r.created_at)) === month)
      .map((r) => r.id)
  );

  const monthItems = items.filter((i) => monthRecordIds.has(i.record_id));

  const typeMap = new Map<string, number>();
  monthItems.forEach((item) => {
    const count = typeMap.get(item.name) || 0;
    typeMap.set(item.name, count + item.quantity);
  });

  const totalCount = Array.from(typeMap.values()).reduce((a, b) => a + b, 0);

  const stats = Array.from(typeMap.entries())
    .map(([name, count]) => ({
      name,
      count,
      percentage: totalCount > 0 ? Math.round((count / totalCount) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  res.json(stats);
});

router.get('/mechanics', (req, res) => {
  const month = (req.query.month as string) || getMonthStr(new Date());
  const mechanics = getMechanics();
  const records = getMaintenanceRecords();

  const monthRecords = records.filter(
    (r) => getMonthStr(new Date(r.created_at)) === month
  );

  const stats = mechanics.map((m) => {
    const mechanicRecords = monthRecords.filter(
      (r) => r.mechanic_id === m.id || r.mechanic_name === m.name
    );
    const totalRevenue = mechanicRecords.reduce(
      (sum, r) => sum + (r.total_cost || 0),
      0
    );
    const avgCost =
      mechanicRecords.length > 0 ? totalRevenue / mechanicRecords.length : 0;

    const durations = mechanicRecords
      .map((r) => r.duration_minutes)
      .filter((d) => d && d > 0) as number[];
    const totalDuration = durations.reduce((sum, d) => sum + d, 0);
    const avgDuration = durations.length > 0 ? totalDuration / durations.length : 0;

    const reworkCount = mechanicRecords.filter((r) => r.is_rework).length;
    const reworkRate = mechanicRecords.length > 0 ? reworkCount / mechanicRecords.length : 0;

    return {
      id: m.id,
      name: m.name,
      recordCount: mechanicRecords.length,
      totalRevenue,
      avgCost: Math.round(avgCost * 100) / 100,
      avgDurationMinutes: Math.round(avgDuration * 10) / 10,
      reworkCount,
      reworkRate: Math.round(reworkRate * 1000) / 10,
    };
  });

  stats.sort((a, b) => b.recordCount - a.recordCount);
  res.json(stats);
});

router.get('/revenue', (req, res) => {
  const months = parseInt(req.query.months as string) || 6;
  const records = getMaintenanceRecords();

  const result = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = getMonthStr(date);

    const monthRecords = records.filter(
      (r) => getMonthStr(new Date(r.created_at)) === monthStr
    );

    const revenue = monthRecords.reduce(
      (sum, r) => sum + (r.total_cost || 0),
      0
    );

    result.push({
      month: monthStr,
      revenue,
      recordCount: monthRecords.length,
    });
  }

  res.json(result);
});

export default router;
