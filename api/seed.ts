import { saveDB, loadDB, getNextId } from './db.js';

export function seedDatabase() {
  const db = loadDB();

  if (db.vehicles.length > 0) {
    return;
  }

  const now = new Date();

  const mechanics = [
    { id: getNextId('mechanics'), name: '张师傅', phone: '13800138001', specialty: '发动机维修', created_at: now.toISOString() },
    { id: getNextId('mechanics'), name: '李师傅', phone: '13800138002', specialty: '电路空调', created_at: now.toISOString() },
    { id: getNextId('mechanics'), name: '王师傅', phone: '13800138003', specialty: '钣金喷漆', created_at: now.toISOString() },
    { id: getNextId('mechanics'), name: '赵师傅', phone: '13800138004', specialty: '底盘维修', created_at: now.toISOString() },
  ];

  const vehicles = [
    {
      id: getNextId('vehicles'),
      plate_number: '京A12345',
      owner_name: '张先生',
      owner_phone: '13900139001',
      car_model: '大众帕萨特 2022款',
      color: '黑色',
      vin: 'LFV2A21K5N4567890',
      current_mileage: 45000,
      last_maintenance_date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      next_maintenance_mileage: 50000,
      created_at: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: getNextId('vehicles'),
      plate_number: '京B67890',
      owner_name: '李女士',
      owner_phone: '13900139002',
      car_model: '丰田卡罗拉 2021款',
      color: '白色',
      vin: 'LFMAP86C5N0123456',
      current_mileage: 32000,
      last_maintenance_date: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      next_maintenance_mileage: 35000,
      created_at: new Date(now.getTime() - 200 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: getNextId('vehicles'),
      plate_number: '京C11111',
      owner_name: '王先生',
      owner_phone: '13900139003',
      car_model: '本田雅阁 2023款',
      color: '银色',
      vin: 'LHGCV2F4XP1000001',
      current_mileage: 15000,
      last_maintenance_date: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      next_maintenance_mileage: 20000,
      created_at: new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: getNextId('vehicles'),
      plate_number: '京D22222',
      owner_name: '赵先生',
      owner_phone: '13900139004',
      car_model: '奔驰C260L 2022款',
      color: '白色',
      vin: 'WDDWF4KB5NR123456',
      current_mileage: 28000,
      last_maintenance_date: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      next_maintenance_mileage: 30000,
      created_at: new Date(now.getTime() - 250 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: getNextId('vehicles'),
      plate_number: '京E33333',
      owner_name: '刘女士',
      owner_phone: '13900139005',
      car_model: '特斯拉Model 3',
      color: '红色',
      vin: 'LRW3F7FZ2PC123456',
      current_mileage: 12000,
      last_maintenance_date: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      next_maintenance_mileage: 20000,
      created_at: new Date(now.getTime() - 300 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: getNextId('vehicles'),
      plate_number: '京F44444',
      owner_name: '陈先生',
      owner_phone: '13900139006',
      car_model: '比亚迪汉EV',
      color: '灰色',
      vin: 'BYD20230101000001',
      current_mileage: 8000,
      last_maintenance_date: null,
      next_maintenance_mileage: 0,
      created_at: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: now.toISOString(),
    },
  ];

  const records: any[] = [];
  const items: any[] = [];

  const serviceTemplates = [
    { name: '换机油', category: '保养', price: 300 },
    { name: '换机油滤芯', category: '保养', price: 50 },
    { name: '换空气滤芯', category: '保养', price: 80 },
    { name: '换空调滤芯', category: '保养', price: 60 },
    { name: '四轮定位', category: '保养', price: 120 },
    { name: '刹车片更换', category: '维修', price: 400 },
    { name: '换轮胎', category: '配件', price: 500 },
    { name: '空调维修', category: '维修', price: 200 },
    { name: '电瓶更换', category: '配件', price: 600 },
    { name: '发动机维修', category: '维修', price: 500 },
  ];

  vehicles.forEach((vehicle, vIndex) => {
    const recordCount = Math.floor(Math.random() * 4) + 1;
    for (let i = 0; i < recordCount; i++) {
      const recordId = getNextId('maintenanceRecords');
      const daysAgo = Math.floor(Math.random() * 180) + 10;
      const recordDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const mechanicIndex = Math.floor(Math.random() * mechanics.length);
      const itemCount = Math.floor(Math.random() * 3) + 1;

      const selectedItems: any[] = [];
      let totalCost = 0;
      const usedIndices = new Set<number>();

      for (let j = 0; j < itemCount; j++) {
        let itemIndex;
        do {
          itemIndex = Math.floor(Math.random() * serviceTemplates.length);
        } while (usedIndices.has(itemIndex) && usedIndices.size < serviceTemplates.length);
        usedIndices.add(itemIndex);

        const template = serviceTemplates[itemIndex];
        const quantity = Math.floor(Math.random() * 2) + 1;
        const itemId = getNextId('serviceItems');

        selectedItems.push({
          id: itemId,
          record_id: recordId,
          name: template.name,
          category: template.category,
          price: template.price,
          quantity,
        });
        totalCost += template.price * quantity;
      }

      const mileage = Math.floor(vehicle.current_mileage - (recordCount - i) * 5000 - Math.random() * 2000);

      records.push({
        id: recordId,
        vehicle_id: vehicle.id,
        mileage: Math.max(0, mileage),
        mechanic_id: mechanics[mechanicIndex].id,
        mechanic_name: mechanics[mechanicIndex].name,
        total_cost: totalCost,
        notes: i === 0 ? '常规保养，车况良好' : '',
        created_at: recordDate.toISOString(),
      });

      items.push(...selectedItems);
    }
  });

  records.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  db.mechanics = mechanics;
  db.vehicles = vehicles;
  db.maintenanceRecords = records;
  db.serviceItems = items;

  saveDB(db);
}
