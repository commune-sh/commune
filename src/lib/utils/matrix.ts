export function convertFromMXC(url: string, homeserver_url: string) {
    let stripped = url.replace('mxc://', '');
    return `${homeserver_url}/_matrix/client/v1/media/download/${stripped}`;
}

export function processURL(url: string, homeserver_url: string) {
    if(!url) return
    if(url.startsWith('mxc://')) {
        return convertFromMXC(url, homeserver_url)
    }
    if(url.startsWith('https://') || url.startsWith('http://')) {
        return url
    }
}


export function thumbnailURL(url, width, height, method) {
    if(!url) return
    if(url.includes('mxc://')) {
        return thumbnail_from_MXC(url, width, height, method)
    }
    return url
}

export function room_alias_from_ID(room_id: string) {
    const parts = room_id.split(":"); 
    if (parts.length > 1) { 
        const local_part = parts[0]; 
        return local_part.substring(1); 
    } else {
        return null; 
    }
}

export function strip_hash(room_id_or_alias: string) {
    if(!room_id_or_alias) return
    return room_id_or_alias.replace(/^[\#!]/, '');
}


export function get_local_part(room_id_or_alias: string) {
    return room_id_or_alias.replace(/^[\#!](.*?):.*$/, '$1');
}

export function canonical_alias(room_alias: string, homeserver_name: string) {
    if(!room_alias) return false
    const is_already_alias = isRoomAlias(room_alias)
    if(is_already_alias) {
        return room_alias
    }
    return `#${room_alias}:${homeserver_name}`;
}

export function cleanDisplayname(name: string) {
    if(name.includes('_ooye_')) {
        return name.replace('_ooye_', '')
    }
}

export function is_local_room(room_id: string, homeserver_name: string): boolean {
    if(!room_id || !homeserver_name) return false;
    const domain = get_domain(room_id);
    return domain === homeserver_name;
}

export function get_domain(id_or_alias: string) {
    if(!id_or_alias) return
    const index = id_or_alias.indexOf(':');
    const domain = id_or_alias.slice(index + 1);
    return domain;
}

export function processHash(hash: string) {
    if(hash.includes('/')) {
        const parts = hash.split('/');
        const valid = isRoomIDOrAlias(parts[0])
        if(valid) {
            return {
                space: parts[0],
                room: parts[1]
            }
        }
    }
    const valid = isRoomIDOrAlias(hash)
    if(valid) {
        return {
            space: hash,
        }
    }
}

export function isRoomIDOrAlias(id_or_alias: string) {
    if(!id_or_alias) return false
    return (id_or_alias.startsWith('!') || id_or_alias.startsWith('#')) &&
        id_or_alias.includes(':');
}

export function isRoomAlias(alias: string) {
    if(!alias) return false
    return alias.startsWith('#') && alias.includes(':');
}

export function naiveRoomIDCheck(room_id: string) {
    if (typeof room_id !== 'string') {
        return false;
    }
    return room_id.startsWith('!') && room_id.includes(':');
}

export function naiveOSTCheck(origin_server_ts: string) {
    if(!origin_server_ts) return false
    const regex = /[0-9]/;
    return regex.test(origin_server_ts)
}

export function naiveAliasCheck(alias: string) {
    if(!alias) return false
    const regex = /[a-zA-Z-0-9]/;
    return regex.test(alias)
}

export function aliasFromName(name: string) {
    let slug = name.replace(/\s+/g, '-')
    if(slug.includes('#')){
        slug = slug.replaceAll('#', '')
    }
    return slug.toLowerCase()
}

export function aliasFromSender(sender: string) {
    if(!sender) return 
    return sender.replace(/^[\@](.*?):.*$/, '$1');
}

function buildRoom(room: any) {
    if (!room) return {};
    const roomEvent = room.currentState.getStateEvents('m.room.create')[0];
    const roomTypeEvent = room.currentState.getStateEvents('commune.room.type')[0];
    const nameEvent = room.currentState.getStateEvents('m.room.name')[0];
    const avatarEvent = room.currentState.getStateEvents('m.room.avatar')[0];
    const bannerEvent = room.currentState.getStateEvents('commune.room.banner')[0];
    const aliasEvent = room.currentState.getStateEvents('m.room.canonical_alias')[0];
    const topicEvent = room.currentState.getStateEvents('m.room.topic')[0];

    let item = {
        room_id: room.roomId,
        type: roomEvent ? roomEvent.getContent().type : '',
        room_type: roomTypeEvent ? roomTypeEvent.getContent().type : '',
        origin_server_ts: roomEvent ? roomEvent.getTs() : '',
        name: nameEvent ? nameEvent.getContent().name : room.name,
        avatar_url: avatarEvent ? avatarEvent.getContent().url : '',
        banner_url: bannerEvent ? bannerEvent.getContent().url : '',
        canonical_alias: aliasEvent ? aliasEvent.getContent().alias : '',
        topic: topicEvent ? topicEvent.getContent().topic : '',
    }

    if(item.name) {
        item.commune_alias = aliasFromName(item.name)
    } else {
        item.commune_alias = aliasFromName(`Untitled Room`)
    }

    return item;
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

        spacesMap[roomId].roomInfo = buildRoom(room);

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

export function processRooms(unprocessed) {
    let processed = []
    unprocessed.forEach(room => {
        let item = buildRoom(room);
        const childEvents = room.currentState.getStateEvents('m.space.child');
        if(childEvents.length > 0) {
            item.children = [];
            childEvents.forEach(event => {
                const childId = event.getStateKey();
                item.children.push(childId);
            })
        }
        processed.push(item);
    })

    processed.forEach(room => {
        if(room?.children?.length > 0) {
            let items = [];
            room.children.forEach( c => {
                let item = processed.find(r => r.room_id == c)
                if(item) {
                    items.push(item)
                }
            })
            items?.sort((a, b) => {
                return a.origin_server_ts - b.origin_server_ts
            })
            items.forEach(c => {
                let b = items.filter(r => r.room_id != c.room_id && r.commune_alias == c.commune_alias)
                b.forEach(x => {
                    x.commune_alias = `${x.commune_alias}-${x.origin_server_ts}`
                })
            })
        }
    })

    return processed;
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


export function buildSpaces(rooms) {
    const roomMap = new Map();
    rooms.forEach(room => {
        roomMap.set(room.room_id, { ...room, children: [] });
    });

    const childrenRoomIds = new Set();

    rooms.forEach(room => {
        room?.children?.forEach(childId => {
            if (roomMap.has(childId)) {
                const childRoom = roomMap.get(childId);
                roomMap.get(room.room_id).children.push(childRoom);
                childrenRoomIds.add(childId);
            }
        });
    });

    const parents = rooms.filter(room => !childrenRoomIds.has(room.room_id)).map(room => roomMap.get(room.room_id));
    return parents.filter(room => room.type == 'm.space');
}


export function strayRooms(rooms) {
    const roomMap = new Map();
    rooms.forEach(room => {
        roomMap.set(room.room_id, { ...room, children: [] });
    });

    const childrenRoomIds = new Set();

    rooms.forEach(room => {
        room?.children?.forEach(childId => {
            if (roomMap.has(childId)) {
                const childRoom = roomMap.get(childId);
                roomMap.get(room.room_id).children.push(childRoom);
                childrenRoomIds.add(childId);
            }
        });
    });

    const parents = rooms.filter(room => !childrenRoomIds.has(room.room_id)).map(room => roomMap.get(room.room_id));
    return parents.filter(room => room.type != 'm.space');
}

export function processRoomStates(rooms) {
    let room_state = {}
    rooms.forEach(room => {
        let items = []
        room.currentState.events.forEach(events => {
            events.forEach(event => {
                items.push(event.event)
            })
        })
        room_state[room.roomId] = items
    });

    return room_state
}
