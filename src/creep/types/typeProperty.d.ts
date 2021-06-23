// Creep基础属性扩展
interface Creep {
    // 内部属性
    _roomCode: string;
    _baseName: string;
    _index: number;

    // 普通属性
    /** 本回合执行recycleNearby是否成功的标记 */
    recycling: boolean;

    // 引用属性
    named: boolean;
    baseName: string;
    index: number;
    roomCode: string;
    /** 该creep属于哪个room */
    workRoom: string;
    bornRoom: string;

    role: ANY_ROLE_NAME;
    /** 同一个ROLE的不同MODE */
    mode: ANY_CREEP_MODE;
    work: WORK_STATUS;
    target: Id<any> | null;
    energy: ENERGY_STATUS;
    energyTarget: Id<AnyStoreStructure> | null;

    taskQueue: TaskId[];

    /** 计算属性 */
    stayPos: RoomPosition | null;
    inStayPos: boolean;
}
