export type SmartDeviceType = 'light' | 'fan' | 'ac';

export type DeviceConnectionStatus = 'CONNECTED' | 'NOT_CONNECTED' | 'OFFLINE' | 'SIMULATED';

export type DeviceMode = 'simulation' | 'connected';

export type UserRole = 'admin' | 'facility_manager' | 'viewer';

export interface SmartDevice {
  device_id: string;
  device_name: string;
  device_type: SmartDeviceType;
  institution_id: string;
  building_id: string;
  building_name: string;
  floor_id: string;
  floor_name: string;
  room_id: string;
  room_name: string;
  status: 'ON' | 'OFF';
  power_watts: number;
  connection_status: DeviceConnectionStatus;
  control_enabled: boolean;
  last_updated: string;
  mode: DeviceMode;
  notes?: string;
}

export interface SmartRoom {
  room_id: string;
  room_name: string;
  floor_id: string;
  floor_name: string;
  building_id: string;
  building_name: string;
  occupancy: number;
  temp_c: number;
  is_unoccupied_wastage: boolean;
  unoccupied_duration_minutes?: number;
  devices: SmartDevice[];
}

export interface SmartFloor {
  floor_id: string;
  floor_name: string;
  building_id: string;
  rooms: SmartRoom[];
}

export interface SmartBuildingDeviceHierarchy {
  building_id: string;
  building_name: string;
  floors: SmartFloor[];
}

export interface AIWastageAlert {
  id: string;
  room_id: string;
  room_name: string;
  building_id: string;
  building_name: string;
  floor_name: string;
  occupancy: number;
  unoccupied_minutes: number;
  devices_on: SmartDevice[];
  total_wasted_watts: number;
  message: string;
  detected_at: string;
}
