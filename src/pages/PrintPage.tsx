import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Car,
  Phone,
  Gauge,
  Calendar,
  Wrench,
  User,
  MapPin,
  Building,
  Printer,
  FileText,
  List,
} from 'lucide-react';

interface VehicleData {
  vehicle: any;
  records: any[];
  settings: any;
  singleRecord?: any;
}

export default function PrintPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'vehicle';
  const recordId = searchParams.get('recordId');
  
  const [data, setData] = useState<VehicleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [printMode, setPrintMode] = useState<'vehicle' | 'record'>(mode === 'record' ? 'record' : 'vehicle');

  useEffect(() => {
    if (id) {
      loadData(parseInt(id));
    }
  }, [id, recordId]);

  const loadData = async (vehicleId: number) => {
    try {
      const [vehicleRes, settingsRes] = await Promise.all([
        fetch(`/api/vehicles/${vehicleId}`),
        fetch('/api/settings'),
      ]);
      const vehicleData = await vehicleRes.json();
      const settingsData = await settingsRes.json();
      
      let singleRecord = null;
      if (mode === 'record' && recordId) {
        const recordRes = await fetch(`/api/records/${recordId}`);
        singleRecord = await recordRes.json();
      }
      
      setData({
        vehicle: vehicleData.vehicle,
        records: vehicleData.records || [],
        settings: settingsData,
        singleRecord,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  const { vehicle, records, settings, singleRecord } = data;
  const displayRecords = printMode === 'record' && singleRecord ? [singleRecord] : records;
  const totalSpent = displayRecords.reduce((sum, r) => sum + (r.totalCost || 0), 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="no-print fixed top-4 right-4 z-50 flex flex-col gap-2">
        <div className="bg-white rounded-xl shadow-lg p-2 mb-2">
          <div className="text-xs text-gray-500 mb-2 px-2">打印模式</div>
          <div className="flex gap-1">
            <button
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                printMode === 'vehicle'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setPrintMode('vehicle')}
            >
              <List className="w-3 h-3 inline mr-1" />
              全部记录
            </button>
            {singleRecord && (
              <button
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  printMode === 'record'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setPrintMode('record')}
              >
                <FileText className="w-3 h-3 inline mr-1" />
                单条记录
              </button>
            )}
          </div>
        </div>
        <button className="btn-primary" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          打印
        </button>
      </div>

      <div className="max-w-3xl mx-auto p-8">
        <div className="text-center mb-8 pb-6 border-b-2 border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {settings.shopName || '汽修店'}
          </h1>
          <div className="text-sm text-gray-500 space-y-1">
            {settings.shopAddress && (
              <p className="flex items-center justify-center gap-1">
                <MapPin className="w-3 h-3" />
                {settings.shopAddress}
              </p>
            )}
            {settings.shopPhone && (
              <p className="flex items-center justify-center gap-1">
                <Phone className="w-3 h-3" />
                {settings.shopPhone}
              </p>
            )}
          </div>
        </div>

        <h2 className="text-xl font-bold text-center text-gray-900 mb-6">
          {printMode === 'record' ? '车辆维修单' : '车辆保养记录单'}
        </h2>

        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
              <Car className="w-8 h-8 text-primary-600" />
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">车牌号</p>
                <p className="text-lg font-bold text-gray-900">
                  {vehicle.plateNumber}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">车主</p>
                <p className="text-lg font-semibold text-gray-900">
                  {vehicle.ownerName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">联系电话</p>
                <p className="text-gray-700">{vehicle.ownerPhone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">车型</p>
                <p className="text-gray-700">
                  {vehicle.carModel || '未填写'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">当前里程</p>
                <p className="text-gray-700 flex items-center gap-1">
                  <Gauge className="w-4 h-4" />
                  {vehicle.currentMileage?.toLocaleString()} km
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">下次保养</p>
                <p className="text-primary-600 font-semibold">
                  {vehicle.nextMaintenanceMileage
                    ? `${vehicle.nextMaintenanceMileage.toLocaleString()} km`
                    : '暂无记录'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-accent-600" />
            {printMode === 'record' ? '本次维修项目' : '维修历史记录'}
          </h3>

          {displayRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-xl">
              暂无维修记录
            </div>
          ) : printMode === 'record' ? (
            <div className="space-y-4">
              {singleRecord?.isRework && (
                <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm font-medium">
                  ⚠ 返工维修
                </div>
              )}
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-3 font-medium text-gray-700 border border-gray-200 w-24">
                      序号
                    </th>
                    <th className="text-left p-3 font-medium text-gray-700 border border-gray-200">
                      项目名称
                    </th>
                    <th className="text-left p-3 font-medium text-gray-700 border border-gray-200 w-20">
                      类别
                    </th>
                    <th className="text-right p-3 font-medium text-gray-700 border border-gray-200 w-20">
                      数量
                    </th>
                    <th className="text-right p-3 font-medium text-gray-700 border border-gray-200 w-24">
                      单价
                    </th>
                    <th className="text-right p-3 font-medium text-gray-700 border border-gray-200 w-24">
                      金额
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {singleRecord?.serviceItems?.map((item: any, idx: number) => (
                    <tr key={item.id}>
                      <td className="p-3 border border-gray-200 text-center">
                        {idx + 1}
                      </td>
                      <td className="p-3 border border-gray-200">
                        {item.name}
                      </td>
                      <td className="p-3 border border-gray-200">
                        {item.category}
                      </td>
                      <td className="p-3 border border-gray-200 text-right">
                        {item.quantity}
                      </td>
                      <td className="p-3 border border-gray-200 text-right">
                        ¥{item.price?.toLocaleString()}
                      </td>
                      <td className="p-3 border border-gray-200 text-right font-medium">
                        ¥{(item.price * item.quantity)?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-semibold">
                    <td colSpan={5} className="p-3 text-right border border-gray-200">
                      本次费用合计
                    </td>
                    <td className="p-3 text-right border border-gray-200 text-accent-600">
                      ¥{totalSpent.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 mb-1">维修师傅</p>
                  <p className="font-medium text-gray-900">{singleRecord?.mechanicName || '-'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 mb-1">维修日期</p>
                  <p className="font-medium text-gray-900">{formatDate(singleRecord?.createdAt)}</p>
                </div>
                {singleRecord?.durationMinutes && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 mb-1">维修用时</p>
                    <p className="font-medium text-gray-900">
                      {Math.floor(singleRecord.durationMinutes / 60)} 小时 {singleRecord.durationMinutes % 60} 分钟
                    </p>
                  </div>
                )}
                {singleRecord?.mileage && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 mb-1">进厂里程</p>
                    <p className="font-medium text-gray-900">{singleRecord.mileage.toLocaleString()} km</p>
                  </div>
                )}
              </div>

              {singleRecord?.notes && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800 mb-1">备注说明</p>
                  <p className="text-sm text-yellow-700 whitespace-pre-wrap">{singleRecord.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-3 font-medium text-gray-700 border border-gray-200">
                    日期
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 border border-gray-200">
                    里程
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 border border-gray-200">
                    维修项目
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 border border-gray-200">
                    维修师傅
                  </th>
                  <th className="text-right p-3 font-medium text-gray-700 border border-gray-200">
                    费用
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="p-3 border border-gray-200">
                      {formatDate(record.createdAt)}
                    </td>
                    <td className="p-3 border border-gray-200">
                      {record.mileage?.toLocaleString()} km
                    </td>
                    <td className="p-3 border border-gray-200">
                      {record.serviceItems
                        ?.map((item: any) => `${item.name}×${item.quantity}`)
                        .join('、')}
                    </td>
                    <td className="p-3 border border-gray-200">
                      {record.mechanicName || '-'}
                    </td>
                    <td className="p-3 text-right border border-gray-200 font-semibold">
                      ¥{record.totalCost?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan={4} className="p-3 text-right border border-gray-200">
                    累计消费
                  </td>
                  <td className="p-3 text-right border border-gray-200 text-accent-600">
                    ¥{totalSpent.toLocaleString()}
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td colSpan={4} className="p-3 text-right border border-gray-200">
                    维修次数
                  </td>
                  <td className="p-3 text-right border border-gray-200">
                    {records.length} 次
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        {vehicle.nextMaintenanceMileage && (
          <div className="p-4 bg-primary-50 rounded-xl border border-primary-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-600 font-medium">
                  下次保养提醒
                </p>
                <p className="text-lg font-bold text-primary-700 mt-1">
                  {vehicle.nextMaintenanceMileage.toLocaleString()} km
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-primary-600">还剩</p>
                <p className="text-lg font-bold text-primary-700 mt-1">
                  {Math.max(
                    0,
                    vehicle.nextMaintenanceMileage - (vehicle.currentMileage || 0)
                  ).toLocaleString()}{' '}
                  km
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-400">
          <p>感谢您的光临，期待下次为您服务！</p>
          <p className="mt-1">
            打印时间：{new Date().toLocaleString('zh-CN')}
          </p>
        </div>
      </div>
    </div>
  );
}
