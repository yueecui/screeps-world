type HaruConfig = [number, number, DirectionConstant, DirectionConstant?]

interface SadaharuConfig {
    /** 中心的定位坐标 */
    center: [number, number]
    /** 8组扩展的定位坐标，以及往哪个方向扩展（只能是斜的方向），第四个参数是最后2组扩展，表示spawn位置的 */
    haru: HaruConfig[]
    /** lab区的定位坐标，以及“上”的方向（只能是正的方向） */
    lab: [number, number]
}

declare interface SadaData{
    room: Room;
    config: SadaharuConfig;
    centerSpawn: Id<StructureSpawn>|null;
    leftSpawn: Id<StructureSpawn>|null;
    rightSpawn: Id<StructureSpawn>|null;
    haru: HaruData[];

    // 能量使用顺序
    energyOrder: Id<StructureSpawn|StructureExtension>[]
}

declare interface HaruData{
    room: Room
    config: HaruConfig
    mainPos: RoomPosition|null
    mainMember: (Id<StructureSpawn|StructureExtension>)[]
    subPos: RoomPosition|null
    subMember: Id<StructureExtension>[]
    energyMax: number

    // 计算属性
    /** 当前可用能量 */
    energy: number
}
