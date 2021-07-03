const find_structure = (x:number, y:number, room: Room) => {
    const look = new RoomPosition(x, y, room.name).lookFor(LOOK_STRUCTURES)
    return _.find(look, (struct) => { return struct.isActive() && (struct.structureType == STRUCTURE_EXTENSION || struct.structureType == STRUCTURE_SPAWN) });
}

export class SadaData {
    public room: Room;
    public config: SadaharuConfig;
    public centerSpawn: Id<StructureSpawn>|null = null;
    public leftSpawn: Id<StructureSpawn>|null = null;
    public rightSpawn: Id<StructureSpawn>|null = null;
    public haru: HaruData[] = [];

    private _energyOrder?: Id<StructureExtension|StructureSpawn>[]

    constructor(room: Room, sada_config: SadaharuConfig){
        this.room = room;
        this.config = sada_config;
        this.init();
    }

    private init = () => {
        // 找center spawn
        {
            const found = find_structure(this.config.center[0]+1, this.config.center[1]-1, this.room);
            if (found && found instanceof StructureSpawn){
                this.centerSpawn = found.id;
            }
        }
        // 找haru
        for (const haru_config of this.config.haru){
            this.haru.push(new HaruData(this.room, haru_config));
        }
    }

    get energyOrder() {
        if (this._energyOrder == undefined){
            const order: Id<StructureExtension|StructureSpawn>[] = [];
            if (this.centerSpawn) order.push(this.centerSpawn);

            for (const haru of this.haru){
                const member = [...haru.mainMember, ...haru.subMember].map(
                    (struct_id) => {
                        return Game.getObjectById(struct_id as Id<StructureExtension|StructureSpawn>)!;
                    }
                )
                let center_pos: RoomPosition;
                if (this.room.storage){
                    center_pos = this.room.storage.pos;
                }else{
                    const center_spawn = Game.getObjectById(this.centerSpawn!);
                    if (center_spawn){
                        center_pos = center_spawn.pos;
                    }else{
                        center_pos = new RoomPosition(25, 25, this.room.name);
                    }
                }
                member.sort((a, b) =>{ return center_pos.getRangeTo(a) - center_pos.getRangeTo(b); });
                order.push(...member.map((struct)=>{return struct.id;}));
            }
            this._energyOrder = order;
        }
        return this._energyOrder;
    }
}


class HaruData{
    room: Room
    config: HaruConfig
    mainPos: RoomPosition|null = null
    mainMember: (Id<StructureSpawn|StructureExtension>)[] = []
    middleMember: Id<StructureExtension>[] = []
    subPos: RoomPosition|null = null
    subMember: Id<StructureExtension>[] = []
    energyMax: number = 0

    constructor(room: Room, haru_config: HaruConfig){
        this.room = room
        this.config = haru_config;
        this.init();
    }

    private init = () => {
        this.mainPos = new RoomPosition(this.config[0], this.config[1], this.room.name);
        let offset = {
            struct1: [0, 0],
            struct2: [0, 0],
            sub: [0, 0]
        }
        switch (this.config[2]){
            case TOP_LEFT:
                offset = {
                    struct1: [0, 1],
                    struct2: [1, 0],
                    sub: [-1, -1]
                };break;
            case TOP_RIGHT:
                offset = {
                    struct1: [0, 1],
                    struct2: [-1, 0],
                    sub: [1, -1]
                };break;
            case BOTTOM_LEFT:
                offset = {
                    struct1: [0, -1],
                    struct2: [1, 0],
                    sub: [-1, 1]
                };break;

            case BOTTOM_RIGHT:
                offset = {
                    struct1: [0, -1],
                    struct2: [-1, 0],
                    sub: [1, 1]
                };break;
        }
        // 查找main（第一个）
        {
            const found = find_structure(this.config[0]+offset.struct1[0], this.config[1]+offset.struct1[1], this.room);
            if (found && (found instanceof StructureSpawn || found instanceof StructureExtension)) { this.mainMember.push(found.id); }
        }
        // 查找main（第二个）
        {
            const found = find_structure(this.config[0]+offset.struct2[0], this.config[1]+offset.struct2[1], this.room);
            if (found && (found instanceof StructureSpawn || found instanceof StructureExtension)) { this.mainMember.push(found.id); }
        }
        // 查找sub和middle
        this.subPos = new RoomPosition(this.config[0]+offset.sub[0], this.config[1]+offset.sub[1], this.room.name);
        const found = this.subPos.findInRange(FIND_MY_STRUCTURES, 1, { filter: (struct) => { return struct.isActive() && struct.structureType == STRUCTURE_EXTENSION;}}) as StructureExtension[];
        for (const extension of found){
            if (extension.pos.getRangeTo(this.mainPos) == 1){
                this.middleMember.push(extension.id);
            }else{
                this.subMember.push(extension.id);
            }
        }

        // 统计能量
        for (const id of [...this.mainMember, ...this.middleMember, ...this.subMember]){
            const obj = Game.getObjectById(id as Id<StructureExtension|StructureSpawn>);
            if (obj instanceof StructureSpawn){
                this.energyMax += 300;
            }else if (obj instanceof StructureExtension){
                this.energyMax += this.room.getExtensionMaxCapacity();
            }
        }
    }

    get energy(){
        // 因为可能会变，不缓存
        let energy = 0;
        for (const id of [...this.mainMember, ...this.middleMember, ...this.subMember]){
            const struct = Game.getObjectById(id as Id<StructureSpawn|StructureExtension>);
            if (struct){
                energy += struct.store[RESOURCE_ENERGY];
            }else{
                global.cache.rooms[this.room.name].init = false;
            }
        }
        return energy;
    }
}
