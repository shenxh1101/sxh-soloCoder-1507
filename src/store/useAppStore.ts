import { create } from 'zustand';
import { api } from '../utils/api';
import type {
  Vehicle,
  MaintenanceRecord,
  Mechanic,
  Reminder,
  Settings,
  DashboardStats,
  ServiceTypeStats,
  MechanicStats,
  RevenueStats,
  PaginatedResponse,
  FollowUpRecord,
} from '../../shared/types';

interface AppState {
  vehicles: Vehicle[];
  vehiclesTotal: number;
  records: MaintenanceRecord[];
  recordsTotal: number;
  reminders: Reminder[];
  remindersTotal: number;
  mechanics: Mechanic[];
  settings: Settings | null;
  dashboardStats: DashboardStats | null;
  serviceTypeStats: ServiceTypeStats[];
  mechanicStats: MechanicStats[];
  revenueStats: RevenueStats[];
  followUps: FollowUpRecord[];
  loading: boolean;
  error: string | null;

  fetchVehicles: (page?: number, pageSize?: number, keyword?: string) => Promise<void>;
  fetchVehicleDetail: (id: number) => Promise<any>;
  addVehicle: (data: any) => Promise<Vehicle>;
  updateVehicle: (id: number, data: any) => Promise<Vehicle>;
  deleteVehicle: (id: number) => Promise<void>;

  fetchRecords: (page?: number, pageSize?: number, vehicleId?: number) => Promise<void>;
  addRecord: (data: any) => Promise<MaintenanceRecord>;
  updateRecord: (id: number, data: any) => Promise<MaintenanceRecord>;
  deleteRecord: (id: number) => Promise<void>;

  fetchReminders: (status?: string) => Promise<void>;
  updateReminderStatus: (id: number, status: string) => Promise<void>;
  postponeReminder: (id: number, postponeMileage?: number) => Promise<void>;

  fetchMechanics: () => Promise<void>;
  addMechanic: (data: any) => Promise<Mechanic>;
  updateMechanic: (id: number, data: any) => Promise<Mechanic>;
  deleteMechanic: (id: number) => Promise<void>;

  fetchSettings: () => Promise<void>;
  updateSettings: (data: any) => Promise<Settings>;

  fetchDashboardStats: () => Promise<void>;
  fetchServiceTypeStats: (month?: string) => Promise<void>;
  fetchMechanicStats: (month?: string) => Promise<void>;
  fetchRevenueStats: (months?: number) => Promise<void>;

  fetchFollowUps: (vehicleId: number) => Promise<void>;
  addFollowUp: (data: any) => Promise<FollowUpRecord>;
  updateFollowUp: (id: number, data: any) => Promise<FollowUpRecord>;
  deleteFollowUp: (id: number) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  vehicles: [],
  vehiclesTotal: 0,
  records: [],
  recordsTotal: 0,
  reminders: [],
  remindersTotal: 0,
  mechanics: [],
  settings: null,
  dashboardStats: null,
  serviceTypeStats: [],
  mechanicStats: [],
  revenueStats: [],
  followUps: [],
  loading: false,
  error: null,

  fetchVehicles: async (page = 1, pageSize = 20, keyword = '') => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        keyword,
      });
      const data = await api.get<PaginatedResponse<Vehicle>>(`/vehicles?${params}`);
      set({ vehicles: data.list, vehiclesTotal: data.total });
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchVehicleDetail: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const data = await api.get<any>(`/vehicles/${id}`);
      return data;
    } catch (e: any) {
      set({ error: e.message });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  addVehicle: async (data: any) => {
    set({ loading: true, error: null });
    try {
      const vehicle = await api.post<Vehicle>('/vehicles', data);
      return vehicle;
    } catch (e: any) {
      set({ error: e.message });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  updateVehicle: async (id: number, data: any) => {
    set({ loading: true, error: null });
    try {
      const vehicle = await api.put<Vehicle>(`/vehicles/${id}`, data);
      return vehicle;
    } catch (e: any) {
      set({ error: e.message });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  deleteVehicle: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/vehicles/${id}`);
    } catch (e: any) {
      set({ error: e.message });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  fetchRecords: async (page = 1, pageSize = 20, vehicleId?) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (vehicleId) params.append('vehicleId', String(vehicleId));
      const data = await api.get<PaginatedResponse<MaintenanceRecord>>(`/records?${params}`);
      set({ records: data.list, recordsTotal: data.total });
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ loading: false });
    }
  },

  addRecord: async (data: any) => {
    set({ loading: true, error: null });
    try {
      const record = await api.post<MaintenanceRecord>('/records', data);
      return record;
    } catch (e: any) {
      set({ error: e.message });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  updateRecord: async (id: number, data: any) => {
    set({ loading: true, error: null });
    try {
      const record = await api.put<MaintenanceRecord>(`/records/${id}`, data);
      return record;
    } catch (e: any) {
      set({ error: e.message });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  deleteRecord: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/records/${id}`);
    } catch (e: any) {
      set({ error: e.message });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  fetchReminders: async (status?) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      const data = await api.get<PaginatedResponse<Reminder>>(`/reminders?${params}`);
      set({ reminders: data.list, remindersTotal: data.total });
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ loading: false });
    }
  },

  updateReminderStatus: async (id: number, status: string) => {
    try {
      await api.put(`/reminders/${id}/status`, { status });
      const reminders = get().reminders.map((r) =>
        r.id === id ? { ...r, status: status as any } : r
      );
      set({ reminders });
    } catch (e: any) {
      set({ error: e.message });
      throw e;
    }
  },

  postponeReminder: async (id: number, postponeMileage = 1000) => {
    try {
      await api.post(`/reminders/${id}/postpone`, { postponeMileage });
    } catch (e: any) {
      set({ error: e.message });
      throw e;
    }
  },

  fetchMechanics: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.get<Mechanic[]>('/mechanics');
      set({ mechanics: data });
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ loading: false });
    }
  },

  addMechanic: async (data: any) => {
    set({ loading: true, error: null });
    try {
      const mechanic = await api.post<Mechanic>('/mechanics', data);
      return mechanic;
    } catch (e: any) {
      set({ error: e.message });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  updateMechanic: async (id: number, data: any) => {
    set({ loading: true, error: null });
    try {
      const mechanic = await api.put<Mechanic>(`/mechanics/${id}`, data);
      return mechanic;
    } catch (e: any) {
      set({ error: e.message });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  deleteMechanic: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/mechanics/${id}`);
    } catch (e: any) {
      set({ error: e.message });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  fetchSettings: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.get<Settings>('/settings');
      set({ settings: data });
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ loading: false });
    }
  },

  updateSettings: async (data: any) => {
    set({ loading: true, error: null });
    try {
      const settings = await api.put<Settings>('/settings', data);
      set({ settings });
      return settings;
    } catch (e: any) {
      set({ error: e.message });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  fetchDashboardStats: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.get<DashboardStats>('/statistics/dashboard');
      set({ dashboardStats: data });
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchServiceTypeStats: async (month?) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      const data = await api.get<ServiceTypeStats[]>(`/statistics/service-types?${params}`);
      set({ serviceTypeStats: data });
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchMechanicStats: async (month?) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      const data = await api.get<MechanicStats[]>(`/statistics/mechanics?${params}`);
      set({ mechanicStats: data });
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchRevenueStats: async (months = 6) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams({ months: String(months) });
      const data = await api.get<RevenueStats[]>(`/statistics/revenue?${params}`);
      set({ revenueStats: data });
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchFollowUps: async (vehicleId: number) => {
    set({ loading: true, error: null });
    try {
      const data = await api.get<FollowUpRecord[]>(`/follow-ups/vehicle/${vehicleId}`);
      set({ followUps: data });
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ loading: false });
    }
  },

  addFollowUp: async (data: any) => {
    set({ loading: true, error: null });
    try {
      const record = await api.post<FollowUpRecord>('/follow-ups', data);
      set({ followUps: [record, ...get().followUps] });
      return record;
    } catch (e: any) {
      set({ error: e.message });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  updateFollowUp: async (id: number, data: any) => {
    set({ loading: true, error: null });
    try {
      const record = await api.put<FollowUpRecord>(`/follow-ups/${id}`, data);
      set({
        followUps: get().followUps.map((f) => (f.id === id ? record : f)),
      });
      return record;
    } catch (e: any) {
      set({ error: e.message });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  deleteFollowUp: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/follow-ups/${id}`);
      set({ followUps: get().followUps.filter((f) => f.id !== id) });
    } catch (e: any) {
      set({ error: e.message });
      throw e;
    } finally {
      set({ loading: false });
    }
  },
}));
