import { useEffect, useState } from 'react';
import {
  Settings,
  Wrench,
  Users,
  Save,
  Plus,
  Edit3,
  Trash2,
  Phone,
  MapPin,
  Building,
  Gauge,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import type { Mechanic } from '../../shared/types';

export default function SettingsPage() {
  const {
    settings,
    mechanics,
    fetchSettings,
    updateSettings,
    fetchMechanics,
    addMechanic,
    updateMechanic,
    deleteMechanic,
    loading,
  } = useAppStore();

  const [formData, setFormData] = useState({
    maintenanceInterval: 5000,
    reminderThreshold: 1000,
    shopName: '',
    shopPhone: '',
    shopAddress: '',
  });

  const [showMechanicModal, setShowMechanicModal] = useState(false);
  const [editingMechanic, setEditingMechanic] = useState<Mechanic | null>(null);
  const [mechanicForm, setMechanicForm] = useState({
    name: '',
    phone: '',
    specialty: '',
  });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchMechanics();
  }, [fetchSettings, fetchMechanics]);

  useEffect(() => {
    if (settings) {
      setFormData({
        maintenanceInterval: settings.maintenanceInterval || 5000,
        reminderThreshold: settings.reminderThreshold || 1000,
        shopName: settings.shopName || '',
        shopPhone: settings.shopPhone || '',
        shopAddress: settings.shopAddress || '',
      });
    }
  }, [settings]);

  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const openAddMechanic = () => {
    setEditingMechanic(null);
    setMechanicForm({ name: '', phone: '', specialty: '' });
    setShowMechanicModal(true);
  };

  const openEditMechanic = (mechanic: Mechanic) => {
    setEditingMechanic(mechanic);
    setMechanicForm({
      name: mechanic.name,
      phone: mechanic.phone,
      specialty: mechanic.specialty,
    });
    setShowMechanicModal(true);
  };

  const handleSaveMechanic = async () => {
    if (!mechanicForm.name.trim()) return;

    try {
      if (editingMechanic) {
        await updateMechanic(editingMechanic.id, mechanicForm);
      } else {
        await addMechanic(mechanicForm);
      }
      fetchMechanics();
      setShowMechanicModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMechanic = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteMechanic(deleteId);
      fetchMechanics();
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
        <p className="text-gray-500 mt-1">配置系统参数和基础数据</p>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Building className="w-5 h-5 text-primary-600" />
          店铺信息
        </h2>
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div>
            <label className="label">
              <Building className="w-4 h-4 inline mr-1" />
              店铺名称
            </label>
            <input
              type="text"
              name="shopName"
              className="input"
              value={formData.shopName}
              onChange={handleSettingChange}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <Phone className="w-4 h-4 inline mr-1" />
                联系电话
              </label>
              <input
                type="tel"
                name="shopPhone"
                className="input"
                value={formData.shopPhone}
                onChange={handleSettingChange}
              />
            </div>
            <div>
              <label className="label">
                <MapPin className="w-4 h-4 inline mr-1" />
                店铺地址
              </label>
              <input
                type="text"
                name="shopAddress"
                className="input"
                value={formData.shopAddress}
                onChange={handleSettingChange}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Gauge className="w-5 h-5 text-accent-600" />
              保养设置
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">保养间隔里程 (km)</label>
                <input
                  type="number"
                  name="maintenanceInterval"
                  className="input"
                  value={formData.maintenanceInterval}
                  onChange={handleSettingChange}
                />
                <p className="text-xs text-gray-400 mt-1">
                  默认 5000 公里保养一次
                </p>
              </div>
              <div>
                <label className="label">提前提醒里程 (km)</label>
                <input
                  type="number"
                  name="reminderThreshold"
                  className="input"
                  value={formData.reminderThreshold}
                  onChange={handleSettingChange}
                />
                <p className="text-xs text-gray-400 mt-1">
                  距离保养还有多少公里时开始提醒
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button type="submit" className="btn-primary" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {saveSuccess ? '保存成功！' : loading ? '保存中...' : '保存设置'}
            </button>
          </div>
        </form>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-600" />
            师傅管理
          </h2>
          <button className="btn-primary btn-sm" onClick={openAddMechanic}>
            <Plus className="w-4 h-4 mr-1" />
            添加师傅
          </button>
        </div>

        {mechanics.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>暂无师傅信息</p>
          </div>
        ) : (
          <div className="space-y-3">
            {mechanics.map((mechanic) => (
              <div
                key={mechanic.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <Wrench className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {mechanic.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {mechanic.specialty || '未设置专长'}
                    </p>
                    {mechanic.phone && (
                      <p className="text-xs text-gray-400">
                        {mechanic.phone}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 no-print">
                  <button
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    onClick={() => openEditMechanic(mechanic)}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                    onClick={() => setDeleteId(mechanic.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showMechanicModal}
        onClose={() => setShowMechanicModal(false)}
        title={editingMechanic ? '编辑师傅' : '添加师傅'}
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="label">姓名 *</label>
            <input
              type="text"
              className="input"
              value={mechanicForm.name}
              onChange={(e) =>
                setMechanicForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <label className="label">电话</label>
            <input
              type="tel"
              className="input"
              value={mechanicForm.phone}
              onChange={(e) =>
                setMechanicForm((prev) => ({
                  ...prev,
                  phone: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <label className="label">专长</label>
            <input
              type="text"
              className="input"
              placeholder="如：发动机、电路、钣金"
              value={mechanicForm.specialty}
              onChange={(e) =>
                setMechanicForm((prev) => ({
                  ...prev,
                  specialty: e.target.value,
                }))
              }
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              className="btn-secondary"
              onClick={() => setShowMechanicModal(false)}
            >
              取消
            </button>
            <button className="btn-primary" onClick={handleSaveMechanic}>
              {editingMechanic ? '保存修改' : '添加师傅'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteMechanic}
        title="删除师傅"
        message="确定要删除这位师傅吗？"
        type="danger"
        confirmText="删除"
        isLoading={isDeleting}
      />
    </div>
  );
}
