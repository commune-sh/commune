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

export function full_alias(room_alias) {
  return `#${room_alias}:${PUBLIC_HOMESERVER_NAME}`;
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
  const topicEvent = room.currentState.getStateEvents('m.room.topic')[0];
  return {
    room_id: room.roomId,
    name: nameEvent ? nameEvent.getContent().name : room.name,
    avatar_url: avatarEvent ? avatarEvent.getContent().url : '',
    canonical_alias: aliasEvent ? aliasEvent.getContent().alias : '',
    topic: topicEvent ? topicEvent.getContent().topic : '',
  };
}

export function processSpaces(rooms) {
  let spacesMap = {};

  rooms.forEach(room => {
    const roomId = room.roomId;
    const parentEvents = room.currentState.getStateEvents('m.space.parent');
    const childEvents = room.currentState.getStateEvents('m.space.child');

    if (!spacesMap[roomId]) {
      spacesMap[roomId] = { children: [], roomInfo: {} };
    }

    parentEvents.forEach(event => {
      const parentId = event.getStateKey();
      if (!spacesMap[parentId]) {
        spacesMap[parentId] = { children: [], roomInfo: {} };
      }
      if (!spacesMap[parentId].children.includes(roomId)) {
        spacesMap[parentId].children.push(roomId);
      }
    });

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

  function buildHierarchy(spaceId, spacesMap, visited = new Set()) {
    if (visited.has(spaceId)) {
      return null;  
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

  let hierarchy = {};
  Object.keys(spacesMap).forEach(spaceId => {
    if (!Object.values(spacesMap).some(space => space.children.includes(spaceId))) {
      hierarchy[spaceId] = buildHierarchy(spaceId, spacesMap);
    }
  });

  return hierarchy;
}

export function processRooms(rooms) {
  let items = []
  rooms.forEach(room => {
    let item = getRoomInfo(room);
    const childEvents = room.currentState.getStateEvents('m.space.child');
    if(childEvents.length > 0) {
      item.children = [];
      childEvents.forEach(event => {
        const childId = event.getStateKey();
        item.children.push(childId);
      })
    }
    items.push(item);
  })
  return items;
}


export function buildHierarchy(data) {
  console.log("data is", data)
    // Create a dictionary to store rooms by their room_id
    const roomDict = {};
    data.rooms.forEach(room => {
        room.children = []; // Initialize children array
        roomDict[room.room_id] = room;
    });

    // Iterate over rooms and attach children to parents
    data.rooms.forEach(room => {
        if (room.children_state) {
            room.children_state.forEach(child => {
                const childRoomId = child.state_key;
                if (roomDict[childRoomId]) {
                    room.children.push(roomDict[childRoomId]);
                }
            });
            delete room.children_state;  // Remove children_state after processing
        }
    });

    // Collect top-level rooms (those that are not children of any other room)
    const topLevelRooms = data.rooms.filter(room => {
        return !data.rooms.some(r => {
            return r.children.some(child => child.room_id === room.room_id);
        });
    });

    return topLevelRooms;
}

export function buildSpacesHierarchy(data) {
      // Create a dictionary to store rooms by their room_id
    const roomDict = {};
    data.rooms.forEach(room => {
        if (room.children_state && room.children_state.length > 0) {
            room.children = []; // Initialize children array for rooms with children
            roomDict[room.room_id] = room;
        }
    });

    // Attach child rooms to their respective parent rooms
    Object.values(roomDict).forEach(room => {
        room.children_state.forEach(child => {
            const childRoomId = child.state_key;
            if (roomDict[childRoomId]) {
                room.children.push(roomDict[childRoomId]);
            }
        });
        delete room.children_state;  // Remove children_state after processing
    });

    // Collect top-level parent rooms (those that are not children of any other parent room)
    const topLevelParentRooms = Object.values(roomDict).filter(room => {
        return !Object.values(roomDict).some(r => r.children.includes(room));
    });

    return topLevelParentRooms;
}

export function buildPublicSpaces(rooms) {
      const roomMap = new Map();
    rooms.forEach(room => {
        roomMap.set(room.room_id, {...room, children: []});
    });

    // Organize the children rooms and track the child room IDs
    rooms.forEach(room => {
        if (room.children && room.children.length > 0) {
            room.children.forEach(childId => {
                if (roomMap.has(childId) && roomMap.get(childId).children.length > 0) {
                    roomMap.get(room.room_id).children.push(roomMap.get(childId));
                }
            });
        }
    });

    // Filter out rooms that are children of other rooms
    const topLevelParents = Array.from(roomMap.values()).filter(room => {
        return rooms.every(r => !(r.children && r.children.includes(room.room_id)));
    });

    return topLevelParents;
}

