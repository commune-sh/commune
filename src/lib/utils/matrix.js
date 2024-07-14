import { PUBLIC_HOMESERVER, PUBLIC_HOMESERVER_NAME } from '$env/static/public';

export function convertFromMXC(url) {
  let stripped = url.replace('mxc://', '');
  return `${PUBLIC_HOMESERVER}/_matrix/media/r0/download/${stripped}`;
}

export function thumbnail_from_MXC(url, height, width) {
  let stripped = url.replace('mxc://', '');
  return `${PUBLIC_HOMESERVER}/_matrix/media/v3/thumbnail/${stripped}?width=${width}&height=${height}&method=crop`;
}

export function room_alias_from_ID(room_id) {
  const parts = room_id.split(":"); 
  if (parts.length > 1) { 
    const local_part = parts[0]; 
    return local_part.substring(1); 
  } else {
    return null; 
  }
}

export function get_local_part(room_id_or_alias) {
  return room_id_or_alias.replace(/^[\#!](.*?):.*$/, '$1');
}

export function is_local_room(room_id) {
  if(!room_id) return false;
  const parts = room_id.split(':');
  const domain = parts[1];
  return domain === PUBLIC_HOMESERVER_NAME;
}

export function naiveRoomIDCheck(room_id) {
  if (typeof room_id !== 'string') {
    return false;
  }
  return room_id.includes('!') || room_id.includes(':');
}

function getRoomInfo(room) {
  if (!room) return {};
  const nameEvent = room.currentState.getStateEvents('m.room.name')[0];
  const avatarEvent = room.currentState.getStateEvents('m.room.avatar')[0];
  const aliasEvent = room.currentState.getStateEvents('m.room.canonical_alias')[0];
  return {
    room_id: room.roomId,
    name: nameEvent ? nameEvent.getContent().name : room.name,
    avatar_url: avatarEvent ? avatarEvent.getContent().url : '',
    canonical_alias: aliasEvent ? aliasEvent.getContent().alias : '',
  };
}

export function processRooms(rooms) {
  let spacesMap = {};

  rooms.forEach(room => {
    const roomId = room.roomId;
    const parentEvents = room.currentState.getStateEvents('m.space.parent');
    const childEvents = room.currentState.getStateEvents('m.space.child');

    if (!spacesMap[roomId]) {
      spacesMap[roomId] = { children: [], roomInfo: {} };
    }

    // Process parent events
    parentEvents.forEach(event => {
      const parentId = event.getStateKey();
      if (!spacesMap[parentId]) {
        spacesMap[parentId] = { children: [], roomInfo: {} };
      }
      if (!spacesMap[parentId].children.includes(roomId)) {
        spacesMap[parentId].children.push(roomId);
      }
    });

    // Process child events
    childEvents.forEach(event => {
      const childId = event.getStateKey();
      if (!spacesMap[roomId].children.includes(childId)) {
        spacesMap[roomId].children.push(childId);
      }
      if (!spacesMap[childId]) {
        spacesMap[childId] = { children: [], roomInfo: {} };
      }
    });

    spacesMap[roomId].roomInfo = getRoomInfo(room);

  });

  // Function to build nested space hierarchy
  function buildHierarchy(spaceId, spacesMap, visited = new Set()) {
    if (visited.has(spaceId)) {
      return null;  // Avoid cycles
    }
    visited.add(spaceId);

    const space = spacesMap[spaceId];
    if (space) {
      const children = space.children.map(childId => buildHierarchy(childId, spacesMap, visited)).filter(child => child !== null);
      return { ...space.roomInfo, children };
    } else {
      return { id: spaceId, children: [] };
    }
  }

  // Build the hierarchy for all top-level spaces
  let hierarchy = {};
  Object.keys(spacesMap).forEach(spaceId => {
    if (!Object.values(spacesMap).some(space => space.children.includes(spaceId))) {
      hierarchy[spaceId] = buildHierarchy(spaceId, spacesMap);
    }
  });

  return hierarchy;
}
