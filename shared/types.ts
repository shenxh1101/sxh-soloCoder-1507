export interface Vehicle {
  id: number;
  plateNumber: string;
  ownerName: string;
  ownerPhone: string;
  carModel: string;
  color: string;
  vin: string;
  currentMileage: number;
  lastMaintenanceDate: string | null;
  nextMaintenanceMileage: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceItem {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export interface MaintenanceRecord {
  id: number;
  vehicleId: number;
  mileage: number;
  serviceItems: ServiceItem[];
  mechanicId: number | null;
  mechanicName: string;
  totalCost: number;
  notes: string;
  startTime?: string | null;
  endTime?: string | null;
  durationMinutes?: number | null;
  isRework?: boolean;
  createdAt: string;
}

export type FollowUpStatus = 'called' | 'scheduled' | 'arrived' | 'cancelled';

export interface FollowUpRecord {
  id: number;
  vehicleId: number;
  type: string;
  content: string;
  scheduledDate?: string | null;
  status: FollowUpStatus;
  source?: string;
  createdAt: string;
  createdBy: string;
}

export interface Mechanic {
  id: number;
  name: string;
  phone: string;
  specialty: string;
  createdAt: string;
}

export type ReminderStatus = 'pending' | 'notified' | 'completed' | 'postponed';
export type ReminderType = 'mileage' | 'date';

export interface Reminder {
  id: number;
  vehicleId: number;
  vehicle?: Vehicle;
  type: ReminderType;
  targetMileage?: number;
  targetDate?: string;
  currentMileage: number;
  remainingMileage?: number;
  status: ReminderStatus;
  notifiedAt?: string | null;
  createdAt: string;
}

export interface Settings {
  maintenanceInterval: number;
  reminderThreshold: number;
  shopName: string;
  shopPhone: string;
  shopAddress: string;
}

export interface DashboardStats {
  totalVehicles: number;
  thisMonthRecords: number;
  thisMonthRevenue: number;
  pendingReminders: number;
}

export interface ServiceTypeStats {
  name: string;
  count: number;
  percentage: number;
}

export interface MechanicStats {
  id: number;
  name: string;
  recordCount: number;
  totalRevenue: number;
  avgCost: number;
  avgDurationMinutes: number;
  reworkCount: number;
  reworkRate: number;
}

export interface RevenueStats {
  month: string;
  revenue: number;
  recordCount: number;
}

export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
