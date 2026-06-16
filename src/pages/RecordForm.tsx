import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Wrench,
  Plus,
  Minus,
  Car,
  Search,
  DollarSign,
  User,
  Gauge,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { ServiceItem } from '../../shared/types';

const commonServices = [
  { name: '换机油', category: '保养', defaultPrice: 300 },
  { name: '换机油滤芯', category: '保养', defaultPrice: 50 },
  { name: '换空气滤芯', category: '保养', defaultPrice: 80 },
  { name: '换空调滤芯', category: '保养', defaultPrice: 60 },
  { name: '换轮胎', category: '配件', defaultPrice: 500 },
  { name: '四轮定位', category: '保养', defaultPrice: 120 },
  { name: '刹车片更换', category: '维修', defaultPrice: 400 },
  { name: '刹车油更换', category: '保养', defaultPrice: 200 },
  { name: '变速箱油', category: '保养', defaultPrice: 500 },
  { name: '防冻液', category: '保养', defaultPrice: 150 },
  { name: '电瓶更换', category: '配件', defaultPrice: 600 },
  { name: '火花塞更换', category: '保养', defaultPrice: 300 },
  { name: '空调维修', category: '维修', defaultPrice: 200 },
  { name: '发动机维修', category: '维修', defaultPrice: 500 },
  { name: '底盘检查', category: '保养', defaultPrice: 100 },
];

export default function RecordForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vehicleIdFromUrl = searchParams.get('vehicleId');

  const {
    vehicles,
    mechanics,
    fetchVehicles,
    fetchMechanics,
    addRecord,
    loading,
  } = useAppStore();

  const [vehicleId, setVehicleId] = useState<number | null>(
    vehicleIdFromUrl ? parseInt(vehicleIdFromUrl) : null
  );
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  const [mileage, setMileage] = useState('');
  const [mechanicId, setMechanicId] = useState<number | null>(null);
  const [mechanicName, setMechanicName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [isRework, setIsRework] = useState(false);
  const [notes, setNotes] = useState('');
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [error, setError] = useState('');
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);

  useEffect(() => {
    fetchVehicles(1, 100);
    fetchMechanics();
  }, [fetchVehicles, fetchMechanics]);

  useEffect(() => {
    if (vehicleId) {
      const vehicle = vehicles.find((v) => v.id === vehicleId);
      if (vehicle) {
        setMileage(String(vehicle.currentMileage || ''));
      }
    }
  }, [vehicleId, vehicles]);

  useEffect(() => {
    if (startTime && endTime) {
      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();
      if (end > start) {
        const diff = Math.round((end - start) / 60000);
        setDurationMinutes(String(diff));
      }
    }
  }, [startTime, endTime]);

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.plateNumber.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
      v.ownerName.toLowerCase().includes(vehicleSearch.toLowerCase())
  );

  const selectVehicle = (id: number, plateNumber: string) => {
    setVehicleId(id);
    setVehicleSearch(plateNumber);
    setShowVehicleDropdown(false);
    const vehicle = vehicles.find((v) => v.id === id);
    if (vehicle) {
      setMileage(String(vehicle.currentMileage || ''));
    }
  };

  const addServiceItem = (service?: { name: string; category: string; defaultPrice: number }) => {
    const newItem: ServiceItem = {
      id: Date.now() + Math.random(),
      name: service?.name || '',
      category: service?.category || '保养',
      price: service?.defaultPrice || 0,
      quantity: 1,
    };
    setServiceItems([...serviceItems, newItem]);
    setShowServiceDropdown(false);
  };

  const updateServiceItem = (index: number, field: string, value: any) => {
    const updated = [...serviceItems];
    (updated[index] as any)[field] = value;
    setServiceItems(updated);
  };

  const removeServiceItem = (index: number) => {
    setServiceItems(serviceItems.filter((_, i) => i !== index));
  };

  const totalCost = serviceItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!vehicleId) {
      setError('请选择车辆');
      return;
    }
    if (!mileage || parseInt(mileage) <= 0) {
      setError('请输入正确的里程数');
      return;
    }
    if (serviceItems.length === 0) {
      setError('请添加至少一个维修项目');
      return;
    }

    const selectedMechanic = mechanics.find((m) => m.id === mechanicId);

    try {
      const newRecord = await addRecord({
        vehicleId,
        mileage: parseInt(mileage),
        serviceItems: serviceItems.map((item) => ({
          name: item.name,
          category: item.category,
          price: item.price,
          quantity: item.quantity,
        })),
        mechanicId,
        mechanicName: selectedMechanic?.name || mechanicName || '',
        totalCost,
        notes,
        startTime: startTime || null,
        endTime: endTime || null,
        durationMinutes: durationMinutes ? parseInt(durationMinutes) : null,
        isRework,
      });
      navigate(`/vehicles/${vehicleId}#record-${newRecord.id}`);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <button
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        onClick={() => navigate('/records')}
      >
        <ArrowLeft className="w-5 h-5" />
        返回维修记录
      </button>

      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-accent-100 rounded-xl flex items-center justify-center">
            <Wrench className="w-7 h-7 text-accent-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">记录维修</h1>
            <p className="text-gray-500 text-sm">录入本次维修信息</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-danger-50 text-danger-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">选择车辆 *</label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  className="input pl-10"
                  placeholder="搜索车牌号或车主姓名..."
                  value={vehicleSearch}
                  onChange={(e) => {
                    setVehicleSearch(e.target.value);
                    setShowVehicleDropdown(true);
                    if (vehicleId) setVehicleId(null);
                  }}
                  onFocus={() => setShowVehicleDropdown(true)}
                />
              </div>
              {showVehicleDropdown && filteredVehicles.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {filteredVehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                        vehicleId === vehicle.id ? 'bg-primary-50' : ''
                      }`}
                      onClick={() => selectVehicle(vehicle.id, vehicle.plateNumber)}
                    >
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Car className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {vehicle.plateNumber}
                        </p>
                        <p className="text-xs text-gray-500">
                          {vehicle.ownerName} · {vehicle.carModel || '未填写车型'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedVehicle && (
              <p className="text-sm text-gray-500 mt-2">
                车主：{selectedVehicle.ownerName} · {selectedVehicle.ownerPhone}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <Gauge className="w-4 h-4 inline mr-1" />
                当前里程 (km) *
              </label>
              <input
                type="number"
                className="input"
                placeholder="0"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
              />
            </div>
            <div>
              <label className="label">
                <User className="w-4 h-4 inline mr-1" />
                维修师傅
              </label>
              <select
                className="input"
                value={mechanicId || ''}
                onChange={(e) => {
                  const id = e.target.value ? parseInt(e.target.value) : null;
                  setMechanicId(id);
                  if (id) {
                    const m = mechanics.find((mech) => mech.id === id);
                    setMechanicName(m?.name || '');
                  }
                }}
              >
                <option value="">请选择师傅</option>
                {mechanics.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.specialty ? `(${m.specialty})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">
                <Clock className="w-4 h-4 inline mr-1" />
                开始时间
              </label>
              <input
                type="datetime-local"
                className="input"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label className="label">
                <Clock className="w-4 h-4 inline mr-1" />
                结束时间
              </label>
              <input
                type="datetime-local"
                className="input"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
            <div>
              <label className="label">
                <Clock className="w-4 h-4 inline mr-1" />
                耗时 (分钟)
              </label>
              <input
                type="number"
                className="input"
                placeholder="自动计算或手动输入"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isRework"
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              checked={isRework}
              onChange={(e) => setIsRework(e.target.checked)}
            />
            <label htmlFor="isRework" className="text-sm text-gray-700 cursor-pointer flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-warning-600" />
              标记为返工维修
            </label>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">维修项目 *</label>
              <button
                type="button"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                onClick={() => setShowServiceDropdown(!showServiceDropdown)}
              >
                <Plus className="w-4 h-4 inline mr-1" />
                快速添加
              </button>
            </div>

            {showServiceDropdown && (
              <div className="mb-3 p-3 bg-gray-50 rounded-xl grid grid-cols-3 gap-2">
                {commonServices.map((service, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="text-left px-3 py-2 bg-white rounded-lg hover:bg-primary-50 hover:text-primary-700 text-sm transition-colors border border-gray-200"
                    onClick={() => addServiceItem(service)}
                  >
                    <p className="font-medium">{service.name}</p>
                    <p className="text-xs text-gray-400">¥{service.defaultPrice}</p>
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-3">
              {serviceItems.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                  <Wrench className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">暂无维修项目</p>
                  <button
                    type="button"
                    className="text-primary-600 text-sm mt-1"
                    onClick={() => addServiceItem()}
                  >
                    点击添加项目
                  </button>
                </div>
              ) : (
                serviceItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="flex-1">
                      <input
                        type="text"
                        className="input bg-white mb-2"
                        placeholder="项目名称"
                        value={item.name}
                        onChange={(e) =>
                          updateServiceItem(index, 'name', e.target.value)
                        }
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <select
                          className="input bg-white text-sm"
                          value={item.category}
                          onChange={(e) =>
                            updateServiceItem(index, 'category', e.target.value)
                          }
                        >
                          <option value="保养">保养</option>
                          <option value="维修">维修</option>
                          <option value="配件">配件</option>
                        </select>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">¥</span>
                          <input
                            type="number"
                            className="input bg-white text-sm"
                            placeholder="单价"
                            value={item.price}
                            onChange={(e) =>
                              updateServiceItem(
                                index,
                                'price',
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100"
                            onClick={() =>
                              updateServiceItem(
                                index,
                                'quantity',
                                Math.max(1, item.quantity - 1)
                              )
                            }
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            className="input bg-white text-sm text-center flex-1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateServiceItem(
                                index,
                                'quantity',
                                Math.max(1, parseInt(e.target.value) || 1)
                              )
                            }
                          />
                          <button
                            type="button"
                            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100"
                            onClick={() =>
                              updateServiceItem(
                                index,
                                'quantity',
                                item.quantity + 1
                              )
                            }
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                      onClick={() => removeServiceItem(index)}
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}

              {serviceItems.length > 0 && (
                <button
                  type="button"
                  className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-primary-400 hover:text-primary-600 transition-colors"
                  onClick={() => addServiceItem()}
                >
                  <Plus className="w-5 h-5 inline mr-1" />
                  添加项目
                </button>
              )}
            </div>
          </div>

          <div className="p-4 bg-accent-50 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-accent-700 font-medium flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                总费用
              </span>
              <span className="text-2xl font-bold text-accent-600">
                ¥{totalCost.toLocaleString()}
              </span>
            </div>
          </div>

          <div>
            <label className="label">备注</label>
            <textarea
              className="input min-h-24 resize-none"
              placeholder="填写其他备注信息..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/records')}
            >
              取消
            </button>
            <button type="submit" className="btn-accent" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? '保存中...' : '保存记录'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
