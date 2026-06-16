import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Car } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function VehicleForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { addVehicle, updateVehicle, fetchVehicleDetail, loading } = useAppStore();

  const [formData, setFormData] = useState({
    plateNumber: '',
    ownerName: '',
    ownerPhone: '',
    carModel: '',
    color: '',
    vin: '',
    currentMileage: 0,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit && id) {
      loadVehicle(parseInt(id));
    }
  }, [isEdit, id]);

  const loadVehicle = async (vehicleId: number) => {
    try {
      const data = await fetchVehicleDetail(vehicleId);
      if (data.vehicle) {
        setFormData({
          plateNumber: data.vehicle.plateNumber || '',
          ownerName: data.vehicle.ownerName || '',
          ownerPhone: data.vehicle.ownerPhone || '',
          carModel: data.vehicle.carModel || '',
          color: data.vehicle.color || '',
          vin: data.vehicle.vin || '',
          currentMileage: data.vehicle.currentMileage || 0,
        });
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.plateNumber.trim()) {
      setError('请输入车牌号');
      return;
    }
    if (!formData.ownerName.trim()) {
      setError('请输入车主姓名');
      return;
    }
    if (!formData.ownerPhone.trim()) {
      setError('请输入车主电话');
      return;
    }

    try {
      if (isEdit && id) {
        await updateVehicle(parseInt(id), formData);
      } else {
        await addVehicle(formData);
      }
      navigate('/vehicles');
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <button
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        onClick={() => navigate('/vehicles')}
      >
        <ArrowLeft className="w-5 h-5" />
        返回车辆列表
      </button>

      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
            <Car className="w-7 h-7 text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {isEdit ? '编辑车辆' : '添加车辆'}
            </h1>
            <p className="text-gray-500 text-sm">
              {isEdit ? '修改车辆信息' : '登记新的客户车辆'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-danger-50 text-danger-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">车牌号 *</label>
              <input
                type="text"
                name="plateNumber"
                className="input uppercase"
                placeholder="如：京A12345"
                value={formData.plateNumber}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="label">车主姓名 *</label>
              <input
                type="text"
                name="ownerName"
                className="input"
                placeholder="车主姓名"
                value={formData.ownerName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="label">车主电话 *</label>
              <input
                type="tel"
                name="ownerPhone"
                className="input"
                placeholder="联系电话"
                value={formData.ownerPhone}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="label">车型</label>
              <input
                type="text"
                name="carModel"
                className="input"
                placeholder="如：大众帕萨特"
                value={formData.carModel}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="label">车身颜色</label>
              <input
                type="text"
                name="color"
                className="input"
                placeholder="如：黑色"
                value={formData.color}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="label">车架号 (VIN)</label>
              <input
                type="text"
                name="vin"
                className="input"
                placeholder="车辆识别代码"
                value={formData.vin}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="label">当前里程 (km)</label>
              <input
                type="number"
                name="currentMileage"
                className="input"
                placeholder="0"
                value={formData.currentMileage}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/vehicles')}
            >
              取消
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? '保存中...' : isEdit ? '保存修改' : '添加车辆'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
