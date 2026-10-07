import React, { useState, useMemo, useEffect } from 'react';
import { Institution } from '../types/institution';
import {
  SmartDevice,
  SmartRoom,
  SmartFloor,
  SmartBuildingDeviceHierarchy,
  SmartDeviceType,
  DeviceConnectionStatus,
  DeviceMode,
  UserRole,
  AIWastageAlert,
} from '../types/smartDevice';
import { generateInstitutionDeviceHierarchy, DEFAULT_DEVICE_POWER } from '../data/initialDevices';
import {
  Zap,
  Power,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Building2,
  Layers,
  Thermometer,
  Users,
  Wifi,
  WifiOff,
  Radio,
  Shield,
  HelpCircle,
  Play,
  ArrowRight,
  X,
  Check,
  RotateCcw,
  Clock,
  ArrowDownCircle,
  Flame,
} from 'lucide-react';

interface SmartDeviceControlDashboardProps {
  institution: Institution;
  onOpenWhatIf?: () => void;
}

export const SmartDeviceControlDashboard: React.FC<SmartDeviceControlDashboardProps> = ({
  institution,
}) => {
  // Mode & User Role
  const [mode, setMode] = useState<DeviceMode>('simulation');
  const [userRole, setUserRole] = useState<UserRole>('admin');

  // Device hierarchy state initialized from institution
  const [hierarchy, setHierarchy] = useState<SmartBuildingDeviceHierarchy[]>(() =>
    generateInstitutionDeviceHierarchy(institution)
  );

  // Sync if institution changes
  useEffect(() => {
    setHierarchy(generateInstitutionDeviceHierarchy(institution));
  }, [institution.id]);

  // Selected hierarchy filters
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');
  const [selectedFloorId, setSelectedFloorId] = useState<string>('all');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // Default to first building if none selected
  useEffect(() => {
    if (hierarchy.length > 0 && (!selectedBuildingId || !hierarchy.some((b) => b.building_id === selectedBuildingId))) {
      setSelectedBuildingId(hierarchy[0].building_id);
      setSelectedFloorId('all');
      setSelectedRoomId(null);
    }
  }, [hierarchy, selectedBuildingId]);

  // Search & Type Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [deviceTypeFilter, setDeviceTypeFilter] = useState<'all' | 'light' | 'fan' | 'ac'>('all');
  const [stateFilter, setStateFilter] = useState<'all' | 'ON' | 'OFF' | 'wastage' | 'connected' | 'simulated'>('all');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Connect New Device Modal State
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [newDeviceForm, setNewDeviceForm] = useState({
    buildingId: '',
    floorId: '',
    roomId: '',
    deviceType: 'light' as SmartDeviceType,
    deviceName: '',
    deviceId: '',
    connectionType: 'IoT / MQTT',
    controlEnabled: true,
  });
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Bulk Control Confirmation Modal
  const [bulkConfirmModal, setBulkConfirmModal] = useState<{
    isOpen: boolean;
    type: 'room' | 'floor' | 'building';
    targetName: string;
    action: () => void;
  }>({
    isOpen: false,
    type: 'room',
    targetName: '',
    action: () => {},
  });

  // AI Optimize Modal State
  const [aiOptimizeModal, setAiOptimizeModal] = useState<{
    isOpen: boolean;
    room: SmartRoom | null;
    wastedDevices: SmartDevice[];
    beforeWatts: number;
    afterWatts: number;
    savingsWatts: number;
  }>({
    isOpen: false,
    room: null,
    wastedDevices: [],
    beforeWatts: 0,
    afterWatts: 0,
    savingsWatts: 0,
  });

  // Hackathon Demo Execution State
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [demoStep, setDemoStep] = useState<number>(0);

  // ----------------- DERIVED DATA & TOTALS ----------------- //

  // Flatten all rooms and devices
  const allRooms = useMemo(() => {
    const list: SmartRoom[] = [];
    hierarchy.forEach((b) => {
      b.floors.forEach((f) => {
        f.rooms.forEach((r) => {
          list.push(r);
        });
      });
    });
    return list;
  }, [hierarchy]);

  const allDevices = useMemo(() => {
    const list: SmartDevice[] = [];
    allRooms.forEach((r) => {
      r.devices.forEach((d) => list.push(d));
    });
    return list;
  }, [allRooms]);

  // Current Summary Metrics
  const summary = useMemo(() => {
    const totalDevices = allDevices.length;
    const devicesOn = allDevices.filter((d) => d.status === 'ON');
    const devicesOff = allDevices.filter((d) => d.status === 'OFF');
    const connected = allDevices.filter((d) => d.connection_status === 'CONNECTED');
    const simulated = allDevices.filter((d) => d.connection_status === 'SIMULATED');

    // Total Current Power in kW
    const currentWatts = devicesOn.reduce((sum, d) => sum + d.power_watts, 0);
    const currentKW = Number((currentWatts / 1000).toFixed(2));

    // Detect rooms with wastage (unoccupied rooms with devices ON)
    const wastageRooms = allRooms.filter(
      (r) => r.occupancy === 0 && r.devices.some((d) => d.status === 'ON')
    );

    // Potential Power Saving (Watts wasted in empty rooms)
    const wastedWatts = wastageRooms.reduce((sum, r) => {
      const roomOnWatts = r.devices
        .filter((d) => d.status === 'ON')
        .reduce((w, d) => w + d.power_watts, 0);
      return sum + roomOnWatts;
    }, 0);
    const potentialSavingKW = Number((wastedWatts / 1000).toFixed(2));

    return {
      totalDevices,
      devicesOnCount: devicesOn.length,
      devicesOffCount: devicesOff.length,
      connectedCount: connected.length,
      simulatedCount: simulated.length,
      wastageAlertsCount: wastageRooms.length,
      currentKW,
      potentialSavingKW,
      wastageRooms,
    };
  }, [allDevices, allRooms]);

  // AI Wastage Alerts List
  const wastageAlerts: AIWastageAlert[] = useMemo(() => {
    return summary.wastageRooms.map((room) => {
      const onDevices = room.devices.filter((d) => d.status === 'ON');
      const wastedWatts = onDevices.reduce((sum, d) => sum + d.power_watts, 0);
      return {
        id: `alert-${room.room_id}`,
        room_id: room.room_id,
        room_name: room.room_name,
        building_id: room.building_id,
        building_name: room.building_name,
        floor_name: room.floor_name,
        occupancy: room.occupancy,
        unoccupied_minutes: room.unoccupied_duration_minutes || 35,
        devices_on: onDevices,
        total_wasted_watts: wastedWatts,
        message: `${room.room_name} (${room.building_name}, ${room.floor_name}) has been unoccupied for ${room.unoccupied_duration_minutes || 35} minutes while ${onDevices.length} devices (${onDevices.map((d) => d.device_name).join(', ')}) are ON.`,
        detected_at: 'Just now',
      };
    });
  }, [summary.wastageRooms]);

  // Active Building & Floor selections
  const currentBuilding = useMemo(() => {
    return hierarchy.find((b) => b.building_id === selectedBuildingId) || hierarchy[0];
  }, [hierarchy, selectedBuildingId]);

  const availableFloors = currentBuilding?.floors || [];

  // Filtered rooms to display in Room Grid
  const displayedRooms = useMemo(() => {
    if (!currentBuilding) return [];

    let rooms: SmartRoom[] = [];
    if (selectedFloorId === 'all') {
      currentBuilding.floors.forEach((f) => rooms.push(...f.rooms));
    } else {
      const floor = currentBuilding.floors.find((f) => f.floor_id === selectedFloorId);
      if (floor) rooms.push(...floor.rooms);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rooms = rooms.filter(
        (r) =>
          r.room_name.toLowerCase().includes(q) ||
          r.devices.some((d) => d.device_name.toLowerCase().includes(q) || d.device_id.toLowerCase().includes(q))
      );
    }

    // Apply state filter
    if (stateFilter === 'wastage') {
      rooms = rooms.filter((r) => r.occupancy === 0 && r.devices.some((d) => d.status === 'ON'));
    } else if (stateFilter === 'ON') {
      rooms = rooms.filter((r) => r.devices.some((d) => d.status === 'ON'));
    } else if (stateFilter === 'OFF') {
      rooms = rooms.filter((r) => r.devices.every((d) => d.status === 'OFF'));
    } else if (stateFilter === 'connected') {
      rooms = rooms.filter((r) => r.devices.some((d) => d.connection_status === 'CONNECTED'));
    } else if (stateFilter === 'simulated') {
      rooms = rooms.filter((r) => r.devices.some((d) => d.connection_status === 'SIMULATED'));
    }

    // Apply device type filter
    if (deviceTypeFilter !== 'all') {
      rooms = rooms.filter((r) => r.devices.some((d) => d.device_type === deviceTypeFilter));
    }

    return rooms;
  }, [currentBuilding, selectedFloorId, searchQuery, stateFilter, deviceTypeFilter]);

  // Selected room for detailed device view
  const activeRoom = useMemo(() => {
    if (selectedRoomId) {
      return allRooms.find((r) => r.room_id === selectedRoomId) || displayedRooms[0] || null;
    }
    return displayedRooms[0] || null;
  }, [allRooms, selectedRoomId, displayedRooms]);

  // ----------------- CONTROLS & HANDLERS ----------------- //

  // Toggle single device ON/OFF
  const handleToggleDevice = (deviceId: string) => {
    if (userRole === 'viewer') {
      showToast('⚠️ Action restricted: Viewer role is read-only. Switch to Admin or Facility Manager.');
      return;
    }

    setHierarchy((prevHierarchy) => {
      let toggledTo = 'OFF';
      const updated = prevHierarchy.map((building) => ({
        ...building,
        floors: building.floors.map((floor) => ({
          ...floor,
          rooms: floor.rooms.map((room) => ({
            ...room,
            devices: room.devices.map((device) => {
              if (device.device_id === deviceId) {
                toggledTo = device.status === 'ON' ? 'OFF' : 'ON';
                return {
                  ...device,
                  status: toggledTo as 'ON' | 'OFF',
                  last_updated: 'Just now',
                };
              }
              return device;
            }),
          })),
        })),
      }));

      showToast(`✓ Command executed successfully. ${deviceId} turned ${toggledTo}.`);
      return updated;
    });
  };

  // Bulk Turn Off in Room
  const handleTurnOffRoom = (roomId: string) => {
    if (userRole === 'viewer') {
      showToast('⚠️ Action restricted: Viewer role is read-only.');
      return;
    }

    const room = allRooms.find((r) => r.room_id === roomId);
    if (!room) return;

    setBulkConfirmModal({
      isOpen: true,
      type: 'room',
      targetName: room.room_name,
      action: () => {
        setHierarchy((prev) =>
          prev.map((b) => ({
            ...b,
            floors: b.floors.map((f) => ({
              ...f,
              rooms: f.rooms.map((r) => {
                if (r.room_id === roomId) {
                  return {
                    ...r,
                    devices: r.devices.map((d) => ({
                      ...d,
                      status: 'OFF' as const,
                      last_updated: 'Just now',
                    })),
                  };
                }
                return r;
              }),
            })),
          }))
        );
        showToast(`✓ All controllable devices in ${room.room_name} turned OFF.`);
        setBulkConfirmModal({ isOpen: false, type: 'room', targetName: '', action: () => {} });
      },
    });
  };

  // Bulk Turn Off in Floor
  const handleTurnOffFloor = (floorId: string) => {
    if (userRole === 'viewer') {
      showToast('⚠️ Action restricted: Viewer role is read-only.');
      return;
    }

    const floor = currentBuilding?.floors.find((f) => f.floor_id === floorId);
    const floorLabel = floor ? floor.floor_name : 'selected floor';

    setBulkConfirmModal({
      isOpen: true,
      type: 'floor',
      targetName: `${currentBuilding?.building_name} (${floorLabel})`,
      action: () => {
        setHierarchy((prev) =>
          prev.map((b) => {
            if (b.building_id === selectedBuildingId) {
              return {
                ...b,
                floors: b.floors.map((f) => {
                  if (floorId === 'all' || f.floor_id === floorId) {
                    return {
                      ...f,
                      rooms: f.rooms.map((r) => ({
                        ...r,
                        devices: r.devices.map((d) => ({
                          ...d,
                          status: 'OFF' as const,
                          last_updated: 'Just now',
                        })),
                      })),
                    };
                  }
                  return f;
                }),
              };
            }
            return b;
          })
        );
        showToast(`✓ All devices in ${floorLabel} turned OFF.`);
        setBulkConfirmModal({ isOpen: false, type: 'floor', targetName: '', action: () => {} });
      },
    });
  };

  // Bulk Turn Off in Building
  const handleTurnOffBuilding = (buildingId: string) => {
    if (userRole === 'viewer') {
      showToast('⚠️ Action restricted: Viewer role is read-only.');
      return;
    }

    const bld = hierarchy.find((b) => b.building_id === buildingId);
    const bldLabel = bld ? bld.building_name : 'this building';

    setBulkConfirmModal({
      isOpen: true,
      type: 'building',
      targetName: bldLabel,
      action: () => {
        setHierarchy((prev) =>
          prev.map((b) => {
            if (b.building_id === buildingId) {
              return {
                ...b,
                floors: b.floors.map((f) => ({
                  ...f,
                  rooms: f.rooms.map((r) => ({
                    ...r,
                    devices: r.devices.map((d) => ({
                      ...d,
                      status: 'OFF' as const,
                      last_updated: 'Just now',
                    })),
                  })),
                })),
              };
            }
            return b;
          })
        );
        showToast(`✓ All devices in ${bldLabel} turned OFF.`);
        setBulkConfirmModal({ isOpen: false, type: 'building', targetName: '', action: () => {} });
      },
    });
  };

  // Launch AI Optimize Dialog
  const handleOpenAiOptimize = (room: SmartRoom) => {
    const wasted = room.devices.filter((d) => d.status === 'ON');
    const before = wasted.reduce((sum, d) => sum + d.power_watts, 0);

    setAiOptimizeModal({
      isOpen: true,
      room,
      wastedDevices: wasted,
      beforeWatts: before,
      afterWatts: 0,
      savingsWatts: before,
    });
  };

  // Execute AI Recommendation
  const handleApplyAiRecommendation = () => {
    if (!aiOptimizeModal.room) return;

    const roomId = aiOptimizeModal.room.room_id;
    const roomName = aiOptimizeModal.room.room_name;

    setHierarchy((prev) =>
      prev.map((b) => ({
        ...b,
        floors: b.floors.map((f) => ({
          ...f,
          rooms: f.rooms.map((r) => {
            if (r.room_id === roomId) {
              return {
                ...r,
                is_unoccupied_wastage: false,
                devices: r.devices.map((d) => ({
                  ...d,
                  status: 'OFF' as const,
                  last_updated: 'Just now',
                })),
              };
            }
            return r;
          }),
        })),
      }))
    );

    showToast(`✓ Energy wastage controlled successfully in ${roomName}.`);
    setAiOptimizeModal({
      isOpen: false,
      room: null,
      wastedDevices: [],
      beforeWatts: 0,
      afterWatts: 0,
      savingsWatts: 0,
    });
  };

  // Handle Connect Device Submission
  const handleConnectNewDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceForm.deviceName || !newDeviceForm.roomId) {
      showToast('⚠️ Please specify a device name and target room.');
      return;
    }

    const deviceId =
      newDeviceForm.deviceId ||
      `${newDeviceForm.deviceType.toUpperCase()}-${Date.now().toString().slice(-4)}`;

    const targetRoom = allRooms.find((r) => r.room_id === newDeviceForm.roomId);
    if (!targetRoom) {
      showToast('⚠️ Selected room could not be found.');
      return;
    }

    const newDev: SmartDevice = {
      device_id: deviceId,
      device_name: newDeviceForm.deviceName,
      device_type: newDeviceForm.deviceType,
      institution_id: institution.id,
      building_id: targetRoom.building_id,
      building_name: targetRoom.building_name,
      floor_id: targetRoom.floor_id,
      floor_name: targetRoom.floor_name,
      room_id: targetRoom.room_id,
      room_name: targetRoom.room_name,
      status: 'OFF',
      power_watts: DEFAULT_DEVICE_POWER[newDeviceForm.deviceType],
      connection_status: 'CONNECTED',
      control_enabled: newDeviceForm.controlEnabled,
      last_updated: 'Just connected',
      mode: mode,
    };

    setHierarchy((prev) =>
      prev.map((b) => ({
        ...b,
        floors: b.floors.map((f) => ({
          ...f,
          rooms: f.rooms.map((r) => {
            if (r.room_id === targetRoom.room_id) {
              return {
                ...r,
                devices: [...r.devices, newDev],
              };
            }
            return r;
          }),
        })),
      }))
    );

    setSelectedRoomId(targetRoom.room_id);
    setSelectedBuildingId(targetRoom.building_id);
    setConnectModalOpen(false);
    showToast(`🟢 Device Connected Successfully: ${newDev.device_name} (${newDev.device_id}) added to ${targetRoom.room_name}.`);
  };

  // Test Connection simulator
  const handleTestConnection = () => {
    setIsTestingConnection(true);
    setTestResult(null);
    setTimeout(() => {
      setIsTestingConnection(false);
      setTestResult('✓ Handshake verified: MQTT broker responded with ping acknowledgment in 18ms.');
    }, 1200);
  };

  // ----------------- HACKATHON DEMO AUTOMATION ----------------- //
  const handleRunHackathonDemo = () => {
    setIsDemoRunning(true);
    setDemoStep(1);

    // Find or pick first building & Room 204 or first room
    const targetB = hierarchy[0];
    const targetRoom = allRooms.find((r) => r.room_name.includes('204')) || allRooms[0];

    setSelectedBuildingId(targetB.building_id);
    setSelectedFloorId('all');
    setSelectedRoomId(targetRoom.room_id);

    // Step 1: Turn ON all devices & set occupancy to 0 (creates 1290W wastage)
    setTimeout(() => {
      setHierarchy((prev) =>
        prev.map((b) => ({
          ...b,
          floors: b.floors.map((f) => ({
            ...f,
            rooms: f.rooms.map((r) => {
              if (r.room_id === targetRoom.room_id) {
                return {
                  ...r,
                  occupancy: 0,
                  is_unoccupied_wastage: true,
                  unoccupied_duration_minutes: 35,
                  devices: r.devices.map((d) => ({
                    ...d,
                    status: 'ON' as const,
                    last_updated: 'Simulated ON',
                  })),
                };
              }
              return r;
            }),
          })),
        }))
      );
      setDemoStep(2);
      showToast(`⚡ Demo Step 1: Set ${targetRoom.room_name} occupancy to 0 and turned ON all devices.`);
    }, 1500);

    // Step 2: AI Wastage Detection triggers and opens AI Optimize modal
    setTimeout(() => {
      const refreshedRoom = allRooms.find((r) => r.room_id === targetRoom.room_id) || targetRoom;
      handleOpenAiOptimize(refreshedRoom);
      setDemoStep(3);
      showToast('🤖 Demo Step 2: AI Engine detected unoccupied energy wastage.');
    }, 3200);

    // Step 3: Automatically apply AI recommendation after brief review
    setTimeout(() => {
      handleApplyAiRecommendation();
      setDemoStep(4);
      setIsDemoRunning(false);
      showToast('🎉 Hackathon Demo complete: Energy wastage controlled & potential savings projected!');
    }, 6000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER & MODE CONTROLS */}
      <div className="bg-[#071530]/90 border border-blue-900/40 rounded-2xl p-5 backdrop-blur-sm shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 shadow-inner">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Smart Device Control
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  Room-Level IoT Switching
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Monitor and remotely control connected facility devices across buildings, floors, and rooms.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-auto">
            {/* Mode Switcher */}
            <div className="flex items-center bg-[#051126] border border-blue-900/50 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setMode('simulation')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  mode === 'simulation'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Demo / Simulation
              </button>
              <button
                onClick={() => setMode('connected')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  mode === 'connected'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Connected Devices
              </button>
            </div>

            {/* Role Switcher */}
            <div className="flex items-center bg-[#051126] border border-blue-900/50 px-2.5 py-1.5 rounded-xl text-xs">
              <Shield className="w-3.5 h-3.5 text-blue-400 mr-1.5" />
              <span className="text-slate-400 mr-1.5 text-[11px]">Role:</span>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as UserRole)}
                className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
              >
                <option value="admin" className="bg-slate-900">Admin</option>
                <option value="facility_manager" className="bg-slate-900">Facility Manager</option>
                <option value="viewer" className="bg-slate-900">Viewer (Read-only)</option>
              </select>
            </div>

            {/* Hackathon Demo Button */}
            <button
              onClick={handleRunHackathonDemo}
              disabled={isDemoRunning}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                isDemoRunning
                  ? 'bg-amber-600 text-slate-950 animate-pulse'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:brightness-110 shadow-amber-500/20'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isDemoRunning ? `Demo Running (Step ${demoStep}/4)...` : '⚡ RUN ENERGY CONTROL DEMO'}</span>
            </button>

            {/* Connect Device Button */}
            <button
              onClick={() => {
                setNewDeviceForm({
                  buildingId: selectedBuildingId,
                  floorId: availableFloors[0]?.floor_id || '',
                  roomId: displayedRooms[0]?.room_id || '',
                  deviceType: 'light',
                  deviceName: '',
                  deviceId: '',
                  connectionType: 'IoT / MQTT',
                  controlEnabled: true,
                });
                setConnectModalOpen(true);
              }}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>+ Connect New Device</span>
            </button>
          </div>
        </div>

        {/* Mode Notification Banner */}
        <div className="mt-3.5 pt-3 border-t border-blue-900/30 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <span className="text-slate-300 font-medium">
              {mode === 'simulation'
                ? 'Demo Mode — Device states are simulated. Commands calculate real-time synthetic power metrics.'
                : 'Connected Mode — Gateway channels ready. Awaiting physical Modbus/MQTT hardware link.'}
            </span>
          </div>
          <span className="text-[11px] text-amber-300 font-mono hidden sm:inline">
            Simulation Mode: Physical hardware not connected.
          </span>
        </div>
      </div>

      {/* ENERGY CONTROL SUMMARY MATRIX (KPI Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-3.5 flex flex-col justify-between">
          <span className="text-slate-400 text-[11px]">Total Devices</span>
          <div className="text-2xl font-black text-white font-mono my-1">{summary.totalDevices}</div>
          <span className="text-[10px] text-slate-500">Across all blocks</span>
        </div>

        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-3.5 flex flex-col justify-between">
          <span className="text-slate-400 text-[11px]">Devices ON</span>
          <div className="text-2xl font-black text-emerald-400 font-mono my-1">{summary.devicesOnCount}</div>
          <span className="text-[10px] text-emerald-300 font-semibold">Active draw</span>
        </div>

        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-3.5 flex flex-col justify-between">
          <span className="text-slate-400 text-[11px]">Devices OFF</span>
          <div className="text-2xl font-black text-slate-300 font-mono my-1">{summary.devicesOffCount}</div>
          <span className="text-[10px] text-slate-500">Standby</span>
        </div>

        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-3.5 flex flex-col justify-between">
          <span className="text-slate-400 text-[11px]">Connected</span>
          <div className="text-2xl font-black text-teal-400 font-mono my-1">{summary.connectedCount}</div>
          <span className="text-[10px] text-teal-300">Live IoT stream</span>
        </div>

        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-3.5 flex flex-col justify-between">
          <span className="text-slate-400 text-[11px]">Simulated</span>
          <div className="text-2xl font-black text-sky-400 font-mono my-1">{summary.simulatedCount}</div>
          <span className="text-[10px] text-sky-300">Hackathon mode</span>
        </div>

        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-3.5 flex flex-col justify-between">
          <span className="text-slate-400 text-[11px]">Wastage Alerts</span>
          <div className={`text-2xl font-black font-mono my-1 ${summary.wastageAlertsCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {summary.wastageAlertsCount}
          </div>
          <span className="text-[10px] text-slate-400">Empty room load</span>
        </div>

        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-3.5 flex flex-col justify-between">
          <span className="text-slate-400 text-[11px]">Current Power</span>
          <div className="text-2xl font-black text-amber-400 font-mono my-1">{summary.currentKW} <span className="text-xs text-slate-400">kW</span></div>
          <span className="text-[10px] text-slate-400">Live aggregated load</span>
        </div>

        <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-3.5 flex flex-col justify-between">
          <span className="text-slate-400 text-[11px]">Potential Saving</span>
          <div className="text-2xl font-black text-emerald-400 font-mono my-1">{summary.potentialSavingKW} <span className="text-xs text-slate-400">kW</span></div>
          <span className="text-[10px] text-emerald-300">From AI setbacks</span>
        </div>
      </div>

      {/* AI ENERGY WASTAGE DETECTION ALERT (Section 11) */}
      {wastageAlerts.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950/90 via-rose-900/70 to-[#0c183a] border-2 border-rose-500 shadow-xl shadow-rose-950/40 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400 flex items-center justify-center text-rose-300 flex-shrink-0 animate-pulse mt-0.5">
                <AlertTriangle className="w-5 h-5 text-rose-300 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-rose-300 tracking-wider uppercase text-[10px] bg-rose-500/30 px-2 py-0.5 rounded border border-rose-400/40">
                    🔴 ENERGY WASTAGE DETECTED
                  </span>
                  <span className="text-xs text-rose-200 font-semibold">
                    {wastageAlerts[0].room_name} ({wastageAlerts[0].building_name})
                  </span>
                </div>
                <p className="text-xs text-white font-medium mt-1 leading-relaxed">
                  "{wastageAlerts[0].message}"
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-rose-100/90">
                  <span>Current Unnecessary Load: <strong className="text-white font-mono text-sm">{wastageAlerts[0].total_wasted_watts}W</strong></span>
                  <span>·</span>
                  <span>Recommended Action: <strong className="text-amber-200">Turn OFF unnecessary devices</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
              <button
                onClick={() => {
                  const targetRoom = allRooms.find((r) => r.room_id === wastageAlerts[0].room_id);
                  if (targetRoom) handleOpenAiOptimize(targetRoom);
                }}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                <span>AI OPTIMIZE</span>
              </button>

              <button
                onClick={() => {
                  setSelectedBuildingId(wastageAlerts[0].building_id);
                  setSelectedRoomId(wastageAlerts[0].room_id);
                }}
                className="px-3.5 py-2 bg-[#091e45] hover:bg-[#102d64] text-sky-200 border border-sky-400/40 text-xs font-semibold rounded-xl transition-colors"
              >
                <span>VIEW ROOM</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FILTER & HIERARCHY SELECTOR BAR (Institution → Building → Floor → Room) */}
      <div className="bg-[#071530]/80 border border-blue-900/40 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Hierarchy Dropdowns */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-1">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-slate-300">Hierarchy:</span>
          </div>

          {/* Building Selector */}
          <select
            value={selectedBuildingId}
            onChange={(e) => {
              setSelectedBuildingId(e.target.value);
              setSelectedFloorId('all');
              setSelectedRoomId(null);
            }}
            className="px-3 py-1.5 bg-[#051026] text-white border border-blue-900/60 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {hierarchy.map((b) => (
              <option key={b.building_id} value={b.building_id} className="bg-slate-900">
                {b.building_name}
              </option>
            ))}
          </select>

          {/* Floor Selector */}
          <select
            value={selectedFloorId}
            onChange={(e) => {
              setSelectedFloorId(e.target.value);
              setSelectedRoomId(null);
            }}
            className="px-3 py-1.5 bg-[#051026] text-white border border-blue-900/60 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all" className="bg-slate-900">All Floors</option>
            {availableFloors.map((f) => (
              <option key={f.floor_id} value={f.floor_id} className="bg-slate-900">
                {f.floor_name} ({f.rooms.length} rooms)
              </option>
            ))}
          </select>

          {/* Bulk Building Actions Button */}
          <button
            onClick={() => handleTurnOffBuilding(selectedBuildingId)}
            className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-[11px] font-semibold transition-colors flex items-center gap-1"
            title="Turn OFF all controllable devices in this building"
          >
            <Power className="w-3 h-3 text-rose-400" />
            <span>Turn OFF Building</span>
          </button>
        </div>

        {/* Search & Device Type Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search room or device..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#051026] border border-blue-900/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 text-[11px]">
            <button
              onClick={() => setDeviceTypeFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                deviceTypeFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#051026] text-slate-400 hover:text-white border border-blue-900/40'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setDeviceTypeFilter('light')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                deviceTypeFilter === 'light'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#051026] text-slate-400 hover:text-white border border-blue-900/40'
              }`}
            >
              💡 Lights
            </button>
            <button
              onClick={() => setDeviceTypeFilter('fan')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                deviceTypeFilter === 'fan'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#051026] text-slate-400 hover:text-white border border-blue-900/40'
              }`}
            >
              🌀 Fans
            </button>
            <button
              onClick={() => setDeviceTypeFilter('ac')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                deviceTypeFilter === 'ac'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#051026] text-slate-400 hover:text-white border border-blue-900/40'
              }`}
            >
              ❄️ ACs
            </button>
          </div>

          {/* State Filter Dropdown */}
          <select
            value={stateFilter}
            onChange={(e: any) => setStateFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-[#051026] text-slate-300 border border-blue-900/60 rounded-xl text-xs focus:outline-none font-medium"
          >
            <option value="all">Status: All</option>
            <option value="wastage">🔴 Energy Wastage</option>
            <option value="ON">🟢 Any Device ON</option>
            <option value="OFF">⚪ All Devices OFF</option>
            <option value="connected">🟢 Connected</option>
            <option value="simulated">🔵 Simulated</option>
          </select>
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE: Room Overview Grid (Left) + Selected Room Device Remote Control (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Visual Room Overview Cards (Section 14) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Rooms in {currentBuilding?.building_name} ({displayedRooms.length})</span>
            </h3>
            {selectedFloorId !== 'all' && (
              <button
                onClick={() => handleTurnOffFloor(selectedFloorId)}
                className="text-[11px] text-rose-300 hover:text-white underline font-medium"
              >
                Turn OFF Floor
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 max-h-[700px] overflow-y-auto pr-1 no-scrollbar">
            {displayedRooms.map((room) => {
              const isSelected = activeRoom?.room_id === room.room_id;
              const devicesOn = room.devices.filter((d) => d.status === 'ON');
              const roomWatts = devicesOn.reduce((sum, d) => sum + d.power_watts, 0);

              // Status categorization
              const isWastage = room.occupancy === 0 && devicesOn.length > 0;
              const isHigh = roomWatts >= 1200;

              return (
                <div
                  key={room.room_id}
                  onClick={() => setSelectedRoomId(room.room_id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#0a204e] border-blue-400 ring-2 ring-blue-500/40 shadow-lg'
                      : isWastage
                      ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-400'
                      : 'bg-[#071530]/80 border-blue-900/40 hover:border-blue-700/60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{room.room_name}</h4>
                        {isWastage ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                            🔴 Wastage
                          </span>
                        ) : isHigh ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            🟡 High
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            🟢 Normal
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">{room.floor_name}</span>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-sm font-bold text-white">{roomWatts}W</span>
                      <span className="text-[10px] text-slate-400 block">{devicesOn.length} / {room.devices.length} ON</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs bg-[#051126] p-2 rounded-lg border border-blue-900/30">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      <span>Occupancy: <strong className="text-white font-mono">{room.occupancy}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                      <span>Temp: <strong className="text-white font-mono">{room.temp_c}°C</strong></span>
                    </div>
                  </div>

                  {isWastage && (
                    <div className="mt-2.5 pt-2 border-t border-rose-500/20 flex items-center justify-between text-[11px]">
                      <span className="text-rose-300">Unoccupied for {room.unoccupied_duration_minutes || 35}m</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAiOptimize(room);
                        }}
                        className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>AI Optimize</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Room Device Control Panel (Section 3 & 4) */}
        <div className="lg:col-span-7 space-y-4">
          {activeRoom ? (
            <div className="bg-[#071530]/90 border border-blue-900/50 rounded-2xl p-5 shadow-xl">
              {/* Room Header & Bulk Room Control */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-blue-900/40">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-700/40 font-mono">
                      {activeRoom.building_name} · {activeRoom.floor_name}
                    </span>
                    <h3 className="text-lg font-bold text-white">{activeRoom.room_name}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                    <span>Occupancy: <strong className="text-white font-mono">{activeRoom.occupancy}</strong></span>
                    <span>·</span>
                    <span>Temperature: <strong className="text-white font-mono">{activeRoom.temp_c}°C</strong></span>
                    <span>·</span>
                    <span>
                      Room Power:{' '}
                      <strong className="text-amber-400 font-mono text-sm">
                        {activeRoom.devices
                          .filter((d) => d.status === 'ON')
                          .reduce((sum, d) => sum + d.power_watts, 0)}W
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeRoom.devices.some((d) => d.status === 'ON') && (
                    <button
                      onClick={() => handleTurnOffRoom(activeRoom.room_id)}
                      className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>Turn OFF All Devices</span>
                    </button>
                  )}

                  {activeRoom.is_unoccupied_wastage && (
                    <button
                      onClick={() => handleOpenAiOptimize(activeRoom)}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1 shadow-md shadow-emerald-500/20"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Optimize</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Devices List */}
              <div className="mt-4 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Connected & Controllable Devices ({activeRoom.devices.length})
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeRoom.devices.map((device) => {
                    const isOn = device.status === 'ON';
                    const isViewer = userRole === 'viewer';

                    return (
                      <div
                        key={device.device_id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isOn
                            ? 'bg-[#081b40] border-blue-500/50 shadow-md shadow-blue-950/30'
                            : 'bg-[#051126] border-blue-900/30'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">
                              {device.device_type === 'light' ? '💡' : device.device_type === 'fan' ? '🌀' : '❄️'}
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h5 className="font-bold text-white text-xs sm:text-sm">{device.device_name}</h5>
                                <span
                                  className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold ${
                                    device.connection_status === 'CONNECTED'
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-blue-500/10 text-sky-300 border border-blue-500/30'
                                  }`}
                                >
                                  {device.connection_status === 'CONNECTED' ? '🟢 Connected' : '🔵 Simulated'}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono block">{device.device_id}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span
                              className={`inline-block text-[10px] font-black px-2 py-0.5 rounded border ${
                                isOn
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}
                            >
                              {isOn ? '🟢 ON' : '🔴 OFF'}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                              {device.power_watts}W
                            </span>
                          </div>
                        </div>

                        {/* Control Button Switch */}
                        <div className="mt-3 pt-2.5 border-t border-blue-900/30 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-mono">
                            Updated: {device.last_updated}
                          </span>

                          <button
                            onClick={() => handleToggleDevice(device.device_id)}
                            disabled={isViewer}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm ${
                              isViewer
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                                : isOn
                                ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-950/40'
                                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/40'
                            }`}
                            title={isViewer ? 'Read-only mode' : undefined}
                          >
                            <Power className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>{isOn ? 'TURN OFF' : 'TURN ON'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Energy Calculation Breakdown (Section 9 & 10) */}
              <div className="mt-5 p-4 rounded-xl bg-[#051126] border border-blue-900/40">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Dynamic Energy Calculation & Savings Formula
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="p-2 rounded-lg bg-[#071738] border border-blue-900/30">
                    <span className="text-[10px] text-slate-400 block">Current Room Power</span>
                    <span className="font-mono font-bold text-sm text-white">
                      {activeRoom.devices
                        .filter((d) => d.status === 'ON')
                        .reduce((sum, d) => sum + d.power_watts, 0)}W
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#071738] border border-blue-900/30">
                    <span className="text-[10px] text-slate-400 block">Estimated Daily Run</span>
                    <span className="font-mono font-bold text-sm text-sky-300">
                      {(
                        (activeRoom.devices.filter((d) => d.status === 'ON').reduce((s, d) => s + d.power_watts, 0) * 8) /
                        1000
                      ).toFixed(1)} kWh/day
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#071738] border border-blue-900/30">
                    <span className="text-[10px] text-slate-400 block">Monthly Run Cost</span>
                    <span className="font-mono font-bold text-sm text-amber-300">
                      ₹{Math.round(
                        ((activeRoom.devices.filter((d) => d.status === 'ON').reduce((s, d) => s + d.power_watts, 0) * 8 * 26) /
                          1000) *
                          8.5
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#071738] border border-blue-900/30">
                    <span className="text-[10px] text-slate-400 block">If All Setbacks Applied</span>
                    <span className="font-mono font-bold text-sm text-emerald-400">
                      ₹{Math.round(
                        ((activeRoom.devices.reduce((s, d) => s + d.power_watts, 0) * 8 * 26) / 1000) * 8.5
                      ).toLocaleString()}/mo saved
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 text-center italic">
                  Formula: Energy Saved (kWh) = Power Saved (W) × Operating Hours / 1000. Commercial tariff rate: ₹8.5 / kWh (Simulated).
                </p>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-[#071530]/60 border border-blue-900/40 rounded-2xl text-slate-400 text-xs">
              No rooms match your filter. Select a different floor or clear search query.
            </div>
          )}

          {/* REAL DEVICE ARCHITECTURE EXPLANATION (Section 8 & 22) */}
          <div className="p-5 rounded-2xl bg-[#06122d]/80 border border-blue-900/40 shadow-inner">
            <div className="flex items-center gap-2 mb-3">
              <Radio className="w-4 h-4 text-sky-400" />
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                How this works in real deployment (Hardware & Architecture)
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs font-mono my-3">
              <div className="p-2 rounded-lg bg-[#040e24] border border-blue-900/50">
                <span className="text-[10px] text-slate-400 block font-sans">Level 1</span>
                <span className="font-bold text-white text-[11px]">Dashboard UI</span>
              </div>
              <div className="p-2 rounded-lg bg-[#040e24] border border-blue-900/50">
                <span className="text-[10px] text-slate-400 block font-sans">Level 2</span>
                <span className="font-bold text-sky-300 text-[11px]">Backend API</span>
              </div>
              <div className="p-2 rounded-lg bg-[#040e24] border border-blue-900/50">
                <span className="text-[10px] text-slate-400 block font-sans">Level 3</span>
                <span className="font-bold text-teal-300 text-[11px]">MQTT Gateway</span>
              </div>
              <div className="p-2 rounded-lg bg-[#040e24] border border-blue-900/50">
                <span className="text-[10px] text-slate-400 block font-sans">Level 4</span>
                <span className="font-bold text-amber-300 text-[11px]">Smart Relays</span>
              </div>
              <div className="p-2 rounded-lg bg-[#040e24] border border-blue-900/50">
                <span className="text-[10px] text-slate-400 block font-sans">Level 5</span>
                <span className="font-bold text-emerald-300 text-[11px]">PIR Occupancy</span>
              </div>
              <div className="p-2 rounded-lg bg-[#040e24] border border-blue-900/50">
                <span className="text-[10px] text-slate-400 block font-sans">Level 6</span>
                <span className="font-bold text-white text-[11px]">Light / Fan / AC</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Architecture Note:</strong> The prototype uses simulated IoT telemetry. In real physical deployment, smart IoT relays and sub-metered Modbus switches connect directly to lighting circuits, ceiling fans, and VRV/split AC contactors. When real hardware is provisioned, this exact remote control dashboard communicates via MQTT/REST webhooks with zero code rework.
            </p>
          </div>
        </div>
      </div>

      {/* AI OPTIMIZE MODAL (Section 12) */}
      {aiOptimizeModal.isOpen && aiOptimizeModal.room && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#071738] border-2 border-emerald-500/60 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">AI Energy Optimization</h3>
                  <span className="text-xs text-emerald-300">
                    Analysis for {aiOptimizeModal.room.room_name} ({aiOptimizeModal.room.building_name})
                  </span>
                </div>
              </div>
              <button
                onClick={() => setAiOptimizeModal({ isOpen: false, room: null, wastedDevices: [], beforeWatts: 0, afterWatts: 0, savingsWatts: 0 })}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">
              Occupancy sensors confirmed <strong>0 occupants</strong> for <strong>{aiOptimizeModal.room.unoccupied_duration_minutes || 35} minutes</strong>. Turning OFF these unoccupied loads eliminates wasted continuous draw.
            </p>

            <div className="bg-[#051126] border border-blue-900/40 p-3.5 rounded-xl space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Recommended Devices to Turn OFF:
              </span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {aiOptimizeModal.wastedDevices.map((d) => (
                  <div key={d.device_id} className="flex items-center justify-between text-xs text-slate-200 py-1 border-b border-blue-900/20">
                    <span className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>{d.device_name} ({d.device_type.toUpperCase()})</span>
                    </span>
                    <span className="font-mono text-amber-300 font-bold">{d.power_watts}W</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Impact Metric Comparison */}
            <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-[#051026] border border-blue-900/40">
                <span className="text-[10px] text-slate-400 block">Current Draw</span>
                <span className="font-mono font-bold text-sm text-rose-400">{aiOptimizeModal.beforeWatts}W</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#051026] border border-blue-900/40">
                <span className="text-[10px] text-slate-400 block">After Setback</span>
                <span className="font-mono font-bold text-sm text-emerald-400">0W</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#051026] border border-blue-900/40">
                <span className="text-[10px] text-slate-400 block">Power Reduction</span>
                <span className="font-mono font-bold text-sm text-emerald-300">-{aiOptimizeModal.savingsWatts}W</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center text-xs text-emerald-200">
              Estimated Monthly Saving: ~₹{Math.round(((aiOptimizeModal.savingsWatts * 8 * 26) / 1000) * 8.5).toLocaleString()}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setAiOptimizeModal({ isOpen: false, room: null, wastedDevices: [], beforeWatts: 0, afterWatts: 0, savingsWatts: 0 })}
                className="px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyAiRecommendation}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>APPLY RECOMMENDATION</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK ACTION CONFIRMATION MODAL (Section 13) */}
      {bulkConfirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#071738] border-2 border-rose-500/60 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400 flex items-center justify-center text-rose-300 flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Confirm Bulk Remote Action</h3>
                <span className="text-xs text-rose-300 uppercase tracking-wider font-semibold">
                  {bulkConfirmModal.type} level shutoff
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">
              Are you sure you want to turn OFF all controllable devices in <strong>{bulkConfirmModal.targetName}</strong>?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setBulkConfirmModal({ isOpen: false, type: 'room', targetName: '', action: () => {} })}
                className="px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={bulkConfirmModal.action}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Yes, Turn OFF Devices
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONNECT NEW DEVICE MODAL (Section 7) */}
      {connectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#071738] border border-blue-900/60 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-blue-900/40">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">Connect New Device</h3>
              </div>
              <button
                onClick={() => setConnectModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConnectNewDevice} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Institution</label>
                  <input
                    type="text"
                    disabled
                    value={institution.name}
                    className="w-full px-3 py-2 bg-[#051026] text-slate-300 rounded-xl border border-blue-900/40 text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Target Room *</label>
                  <select
                    value={newDeviceForm.roomId}
                    onChange={(e) => setNewDeviceForm({ ...newDeviceForm, roomId: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-[#051026] text-white rounded-xl border border-blue-900/60 text-xs focus:outline-none"
                  >
                    {allRooms.map((r) => (
                      <option key={r.room_id} value={r.room_id} className="bg-slate-900">
                        {r.building_name} · {r.room_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Device Type *</label>
                  <select
                    value={newDeviceForm.deviceType}
                    onChange={(e) => setNewDeviceForm({ ...newDeviceForm, deviceType: e.target.value as SmartDeviceType })}
                    className="w-full px-3 py-2 bg-[#051026] text-white rounded-xl border border-blue-900/60 text-xs focus:outline-none"
                  >
                    <option value="light" className="bg-slate-900">💡 Light (20W)</option>
                    <option value="fan" className="bg-slate-900">🌀 Fan (70W)</option>
                    <option value="ac" className="bg-slate-900">❄️ AC (1200W)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Connection Protocol</label>
                  <select
                    value={newDeviceForm.connectionType}
                    onChange={(e) => setNewDeviceForm({ ...newDeviceForm, connectionType: e.target.value })}
                    className="w-full px-3 py-2 bg-[#051026] text-white rounded-xl border border-blue-900/60 text-xs focus:outline-none"
                  >
                    <option value="IoT / MQTT" className="bg-slate-900">IoT / MQTT Broker</option>
                    <option value="REST API" className="bg-slate-900">REST API Webhook</option>
                    <option value="Modbus TCP" className="bg-slate-900">Modbus TCP Relay</option>
                    <option value="Zigbee / Matter" className="bg-slate-900">Zigbee / Matter Hub</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Device Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Light 4, High Bay Fan 3, VRV AC Unit 2"
                  value={newDeviceForm.deviceName}
                  onChange={(e) => setNewDeviceForm({ ...newDeviceForm, deviceName: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-[#051026] text-white rounded-xl border border-blue-900/60 text-xs placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Device ID (Optional)</label>
                <input
                  type="text"
                  placeholder="Auto-generated if left empty"
                  value={newDeviceForm.deviceId}
                  onChange={(e) => setNewDeviceForm({ ...newDeviceForm, deviceId: e.target.value })}
                  className="w-full px-3 py-2 bg-[#051026] text-white rounded-xl border border-blue-900/60 text-xs placeholder-slate-500 focus:outline-none"
                />
              </div>

              {testResult && (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono">
                  {testResult}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTestingConnection}
                  className="px-3 py-2 bg-[#0a1e45] hover:bg-[#102d64] text-blue-300 text-xs font-semibold rounded-xl border border-blue-800/40 flex items-center gap-1.5 transition-colors"
                >
                  <Radio className={`w-3.5 h-3.5 ${isTestingConnection ? 'animate-spin text-amber-400' : ''}`} />
                  <span>{isTestingConnection ? 'Testing Gateway...' : 'Test Connection'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setConnectModalOpen(false)}
                    className="px-3 py-2 text-slate-400 hover:text-white text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Connect Device</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
