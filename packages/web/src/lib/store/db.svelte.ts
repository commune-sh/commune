import { openDB, type IDBPDatabase, type DBSchema } from 'idb';

const DB_NAME = 'CommuneDB';
const DB_VERSION = 1;

const STORES = {
    SPACE_ROOMS: 'spaceRooms',
    SPACE_HIERARCHY: 'spaceHierarchy',
    ROOM_STATES: 'roomStates',
} as const;

interface MatrixDBSchema extends DBSchema {
    [STORES.SPACE_ROOMS]: {
        key: string; 
        value: {
            space: string;
            rooms: string[]; 
            lastUpdated: number;
        };
        indexes: {
            'lastUpdated': number;
            'space': string;
        };
    };
    [STORES.SPACE_HIERARCHY]: {
        key: string; 
        value: {
            space_id: string;
            hierarchy: any; 
            lastUpdated: number;
        };
        indexes: {
            'lastUpdated': number;
        };
    };
    [STORES.ROOM_STATES]: {
        key: string; 
        value: {
            room_id: string;
            state: any; 
            space: string;
            lastUpdated: number;
        };
        indexes: {
            'lastUpdated': number;
            'space': string;
        };
    };
}

type MatrixDB = IDBPDatabase<MatrixDBSchema>;

export const dbState = $state<{
    db: MatrixDB | null;
    isInitializing: boolean;
    initError: Error | null;
}>({
    db: null,
    isInitializing: false,
    initError: null
});

export function createDBStore() {

    async function initDB() {
        if (dbState.db || dbState.isInitializing) return;

        dbState.isInitializing = true;
        dbState.initError = null;

        try {
            const database = await openDB<MatrixDBSchema>(DB_NAME, DB_VERSION, {
                upgrade(db) {
                    // Space rooms
                    if (!db.objectStoreNames.contains('spaceRooms')) {
                        const spaceRooms = db.createObjectStore('spaceRooms', {
                            keyPath: 'space'
                        });
                        spaceRooms.createIndex('lastUpdated', 'lastUpdated');
                        spaceRooms.createIndex('space', 'space');
                    }

                    // Space hierarchy
                    if (!db.objectStoreNames.contains('spaceHierarchy')) {
                        const spaceHierarchy = db.createObjectStore('spaceHierarchy', {
                            keyPath: 'space'
                        });
                        spaceHierarchy.createIndex('lastUpdated', 'lastUpdated');
                    }

                    // Room states
                    if (!db.objectStoreNames.contains('roomStates')) {
                        const roomStates = db.createObjectStore('roomStates', {
                            keyPath: 'room_id'
                        });
                        roomStates.createIndex('lastUpdated', 'lastUpdated');
                        roomStates.createIndex('space', 'spaceId');
                    }
                }
            });

            dbState.db = database;
        } catch (error) {
            dbState.initError = error as Error;
            console.error('Failed to initialize database:', error);
        } finally {
            dbState.isInitializing = false;
        }
    }

    async function ensureReady(): Promise<MatrixDB> {
        if (dbState.db) return dbState.db;

        if (dbState.isInitializing) {
            // Wait for initialization to complete
            while (dbState.isInitializing) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }

        if (!dbState.db) {
            if (dbState.initError) {
                throw dbState.initError;
            }
            await initDB();
        }

        if (!dbState.db) {
            throw new Error('Database failed to initialize');
        }

        return dbState.db;
    }

    async function setRoomStates(roomStates: Array<{ room_id: string; state: any }>, space: string) {
        const database = await ensureReady();
        const tx = database.transaction(STORES.ROOM_STATES, 'readwrite');
        const store = tx.objectStore(STORES.ROOM_STATES);

        const promises = roomStates.map(({ room_id, state }) =>
            store.put({
                room_id,
                state,
                space,
                lastUpdated: Date.now()
            })
        );

        await Promise.all(promises);
        await tx.done;
    }

    async function getRoomState(roomId: string) {
        const database = await ensureReady();
        const result = await database.get(STORES.ROOM_STATES, roomId);
        return result ? result.state : null;
    }

    async function getRoomStatesForSpace(spaceId: string) {
        const database = await ensureReady();
        const tx = database.transaction(STORES.ROOM_STATES, 'readonly');
        const index = tx.objectStore(STORES.ROOM_STATES).index('space');

        const results = await index.getAll(spaceId);
        const stateMap = new Map();

        results.forEach(result => {
            stateMap.set(result.room_id, result.state);
        });

        return stateMap;
    }

    return {
        initDB,
        ensureReady,
        setRoomStates,
        getRoomState,
        getRoomStatesForSpace,
    };
}
