import { SmartDevice, SmartRoom, SmartFloor, SmartBuildingDeviceHierarchy, SmartDeviceType, DeviceConnectionStatus } from '../types/smartDevice';
import { Institution } from '../types/institution';

export const DEFAULT_DEVICE_POWER: Record<SmartDeviceType, number> = {
  light: 20,
  fan: 70,
  ac: 1200,
};

export function generateInstitutionDeviceHierarchy(institution: Institution): SmartBuildingDeviceHierarchy[] {
  const isHospital = institution.type === 'Hospital';
  const isIndustry = institution.type === 'Industrial Facility' || institution.type === 'Industrial Estate';
  const isCorporate = institution.type === 'Corporate Campus';
  const isSchool = institution.type === 'School';

  // Use institution buildings, or default to primary blocks
  const targetBuildings = institution.buildings && institution.buildings.length > 0
    ? institution.buildings.slice(0, 4)
    : [
        { id: 'b-block-a', name: 'Block A (Engineering)' },
        { id: 'b-block-b', name: 'Block B (Academic)' },
        { id: 'b-library', name: 'Central Library' },
      ];

  return targetBuildings.map((b, bIdx) => {
    const buildingId = b.id || `b-${bIdx + 1}`;
    const buildingName = b.name || `Building ${bIdx + 1}`;

    const floors: SmartFloor[] = [
      {
        floor_id: `${buildingId}-f0`,
        floor_name: 'Ground Floor',
        building_id: buildingId,
        rooms: [],
      },
      {
        floor_id: `${buildingId}-f1`,
        floor_name: 'First Floor',
        building_id: buildingId,
        rooms: [],
      },
      {
        floor_id: `${buildingId}-f2`,
        floor_name: 'Second Floor',
        building_id: buildingId,
        rooms: [],
      },
    ];

    // Seed room names based on institution type
    const roomTemplates = isHospital
      ? [
          { name: 'ICU Unit 101', floor: 0, occ: 8, temp: 21, isWastage: false, lightsOn: 2, fansOn: 0, acOn: 2 },
          { name: 'Emergency Trauma Bay', floor: 0, occ: 14, temp: 22, isWastage: false, lightsOn: 4, fansOn: 0, acOn: 2 },
          { name: 'OPD Consultation 103', floor: 0, occ: 0, temp: 26, isWastage: true, dur: 40, lightsOn: 2, fansOn: 2, acOn: 1 },
          { name: 'Surgical OT #1', floor: 1, occ: 6, temp: 19, isWastage: false, lightsOn: 4, fansOn: 0, acOn: 2 },
          { name: 'General Ward 202', floor: 1, occ: 18, temp: 24, isWastage: false, lightsOn: 3, fansOn: 4, acOn: 1 },
          { name: 'Doctors Duty Room 204', floor: 1, occ: 0, temp: 25, isWastage: true, dur: 35, lightsOn: 2, fansOn: 1, acOn: 1 },
          { name: 'Pathology Lab 301', floor: 2, occ: 5, temp: 22, isWastage: false, lightsOn: 3, fansOn: 0, acOn: 1 },
          { name: 'Administrative Hall 302', floor: 2, occ: 12, temp: 24, isWastage: false, lightsOn: 4, fansOn: 2, acOn: 1 },
        ]
      : isIndustry
      ? [
          { name: 'Machining Line 101', floor: 0, occ: 12, temp: 29, isWastage: false, lightsOn: 6, fansOn: 4, acOn: 0 },
          { name: 'Control Room 102', floor: 0, occ: 4, temp: 23, isWastage: false, lightsOn: 2, fansOn: 0, acOn: 2 },
          { name: 'Tool Room 103', floor: 0, occ: 0, temp: 27, isWastage: true, dur: 25, lightsOn: 3, fansOn: 2, acOn: 1 },
          { name: 'Assembly Bay 201', floor: 1, occ: 20, temp: 28, isWastage: false, lightsOn: 5, fansOn: 4, acOn: 1 },
          { name: 'Quality Lab 202', floor: 1, occ: 3, temp: 22, isWastage: false, lightsOn: 3, fansOn: 0, acOn: 1 },
          { name: 'Supervisor Cabin 204', floor: 1, occ: 0, temp: 24, isWastage: true, dur: 35, lightsOn: 2, fansOn: 1, acOn: 1 },
          { name: 'Testing Chamber 301', floor: 2, occ: 2, temp: 22, isWastage: false, lightsOn: 2, fansOn: 0, acOn: 1 },
          { name: 'Conference Room 302', floor: 2, occ: 8, temp: 23, isWastage: false, lightsOn: 3, fansOn: 0, acOn: 1 },
        ]
      : isCorporate
      ? [
          { name: 'Open Workstation Bay 101', floor: 0, occ: 45, temp: 23, isWastage: false, lightsOn: 6, fansOn: 0, acOn: 3 },
          { name: 'Client Reception 102', floor: 0, occ: 4, temp: 24, isWastage: false, lightsOn: 2, fansOn: 0, acOn: 1 },
          { name: 'Huddle Room 103', floor: 0, occ: 0, temp: 25, isWastage: true, dur: 20, lightsOn: 2, fansOn: 0, acOn: 1 },
          { name: 'Development Bay 201', floor: 1, occ: 38, temp: 23, isWastage: false, lightsOn: 6, fansOn: 0, acOn: 3 },
          { name: 'Server Core 202', floor: 1, occ: 1, temp: 19, isWastage: false, lightsOn: 1, fansOn: 0, acOn: 2 },
          { name: 'Executive Boardroom 204', floor: 1, occ: 0, temp: 23, isWastage: true, dur: 35, lightsOn: 3, fansOn: 0, acOn: 2 },
          { name: 'Training Room 301', floor: 2, occ: 18, temp: 24, isWastage: false, lightsOn: 4, fansOn: 0, acOn: 2 },
          { name: 'Cafeteria Lounge 302', floor: 2, occ: 25, temp: 25, isWastage: false, lightsOn: 4, fansOn: 4, acOn: 2 },
        ]
      : [
          // College / University / School default
          { name: 'Lecture Hall 101', floor: 0, occ: 32, temp: 27, isWastage: false, lightsOn: 2, fansOn: 2, acOn: 1 },
          { name: 'Seminar Room 102', floor: 0, occ: 18, temp: 26, isWastage: false, lightsOn: 2, fansOn: 2, acOn: 1 },
          { name: 'Tutorial Room 103', floor: 0, occ: 0, temp: 28, isWastage: false, lightsOn: 0, fansOn: 0, acOn: 0 },
          { name: 'Computer Lab 201', floor: 1, occ: 28, temp: 22, isWastage: false, lightsOn: 3, fansOn: 0, acOn: 2 },
          { name: 'Physics Lab 202', floor: 1, occ: 24, temp: 26, isWastage: false, lightsOn: 3, fansOn: 4, acOn: 1 },
          { name: 'Smart Classroom 204', floor: 1, occ: 0, temp: 24, isWastage: true, dur: 35, lightsOn: 2, fansOn: 2, acOn: 1 },
          { name: 'Faculty Cabin 301', floor: 2, occ: 4, temp: 25, isWastage: false, lightsOn: 2, fansOn: 1, acOn: 1 },
          { name: 'Research Scholar Bay 302', floor: 2, occ: 6, temp: 24, isWastage: false, lightsOn: 2, fansOn: 2, acOn: 1 },
        ];

    roomTemplates.forEach((t, rIdx) => {
      // Distribute across buildings
      if (bIdx > 0 && rIdx % 2 !== 0 && t.name !== 'Smart Classroom 204') return;

      const floorObj = floors[t.floor] || floors[0];
      const roomId = `room-${buildingId}-f${t.floor}-${rIdx + 1}`;
      const prefix = bIdx === 0 ? '' : `${b.name.split(' ')[0]} - `;
      const finalRoomName = prefix ? `${prefix}${t.name}` : t.name;

      // Create devices for this room
      const devices: SmartDevice[] = [];
      const numLights = 3;
      const numFans = 2;
      const numAcs = 1;

      // Lights (20W each)
      for (let l = 1; l <= numLights; l++) {
        const isLightOn = l <= t.lightsOn;
        devices.push({
          device_id: `LIGHT-${buildingId.slice(0, 3).toUpperCase()}-${rIdx + 1}-0${l}`,
          device_name: `Light ${l}`,
          device_type: 'light',
          institution_id: institution.id,
          building_id: buildingId,
          building_name: buildingName,
          floor_id: floorObj.floor_id,
          floor_name: floorObj.floor_name,
          room_id: roomId,
          room_name: finalRoomName,
          status: isLightOn ? 'ON' : 'OFF',
          power_watts: 20,
          connection_status: l === 1 ? 'CONNECTED' : 'SIMULATED',
          control_enabled: true,
          last_updated: '2 mins ago',
          mode: 'simulation',
        });
      }

      // Fans (70W each)
      for (let f = 1; f <= numFans; f++) {
        const isFanOn = f <= t.fansOn;
        devices.push({
          device_id: `FAN-${buildingId.slice(0, 3).toUpperCase()}-${rIdx + 1}-0${f}`,
          device_name: `Fan ${f}`,
          device_type: 'fan',
          institution_id: institution.id,
          building_id: buildingId,
          building_name: buildingName,
          floor_id: floorObj.floor_id,
          floor_name: floorObj.floor_name,
          room_id: roomId,
          room_name: finalRoomName,
          status: isFanOn ? 'ON' : 'OFF',
          power_watts: 70,
          connection_status: 'SIMULATED',
          control_enabled: true,
          last_updated: '1 min ago',
          mode: 'simulation',
        });
      }

      // ACs (1200W each)
      for (let a = 1; a <= numAcs; a++) {
        const isAcOn = a <= t.acOn;
        devices.push({
          device_id: `AC-${buildingId.slice(0, 3).toUpperCase()}-${rIdx + 1}-0${a}`,
          device_name: `AC ${a}`,
          device_type: 'ac',
          institution_id: institution.id,
          building_id: buildingId,
          building_name: buildingName,
          floor_id: floorObj.floor_id,
          floor_name: floorObj.floor_name,
          room_id: roomId,
          room_name: finalRoomName,
          status: isAcOn ? 'ON' : 'OFF',
          power_watts: 1200,
          connection_status: 'SIMULATED',
          control_enabled: true,
          last_updated: 'Just now',
          mode: 'simulation',
        });
      }

      const roomObj: SmartRoom = {
        room_id: roomId,
        room_name: finalRoomName,
        floor_id: floorObj.floor_id,
        floor_name: floorObj.floor_name,
        building_id: buildingId,
        building_name: buildingName,
        occupancy: t.occ,
        temp_c: t.temp,
        is_unoccupied_wastage: t.isWastage,
        unoccupied_duration_minutes: t.dur || 35,
        devices,
      };

      floorObj.rooms.push(roomObj);
    });

    return {
      building_id: buildingId,
      building_name: buildingName,
      floors: floors.filter((f) => f.rooms.length > 0),
    };
  });
}
