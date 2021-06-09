/** 运输任务 */
interface Task<T extends TASK_ANY>{
    /** 任务类型 */
    type: T
    /** 搬运来源 */
    source: TaskSource<T>
    /** 搬运目标 */
    target: TaskTarget<T>
    /** 当前执行的creep */
    creep?: Id<Creep>
    /** 搬运货物信息，计算时会从来源处扣除 */
    cargo: {[P in ResourceConstant]?: number}
}

type TaskSource<T extends TASK_ANY>
    = T extends TASK_NORMAL_SPAWN_ENERGY | TASK_HARU_SPAWN_ENERGY | TASK_CONTROLLER_ENERGY | TASK_TOWER_ENERGY | TASK_LAB_ENERGY
    ? Id<StructureContainer | StructureStorage | StructureTerminal>
    : T extends TASK_STORE_SOURCE | TASK_STORE_MINERAL
    ? Id<StructureContainer>
    : T extends TASK_RECYCLE_TOMBSTONE
    ? Id<Tombstone>
    : T extends TASK_RECYCLE_RUIN
    ? Id<Ruin>
    : never

type TaskTarget<T extends TASK_ANY>
    = T extends TASK_NORMAL_SPAWN_ENERGY
    ? Id<StructureExtension|StructureSpawn>
    : T extends TASK_HARU_SPAWN_ENERGY
    ? number
    : T extends TASK_CONTROLLER_ENERGY
    ? Id<StructureContainer>
    : T extends TASK_TOWER_ENERGY
    ? Id<StructureTower>
    : T extends TASK_LAB_ENERGY
    ? Id<StructureLab>
    : T extends TASK_STORE_SOURCE | TASK_STORE_MINERAL | TASK_RECYCLE_TOMBSTONE | TASK_RECYCLE_RUIN
    ? undefined  // 这些存到storage / terminal，不需要特定的target
    : never

type TASK_ANY =
    |TASK_NORMAL_SPAWN_ENERGY
    |TASK_HARU_SPAWN_ENERGY
    |TASK_CONTROLLER_ENERGY
    |TASK_TOWER_ENERGY
    |TASK_LAB_ENERGY
    |TASK_STORE_SOURCE
    |TASK_STORE_MINERAL
    |TASK_RECYCLE_TOMBSTONE
    |TASK_RECYCLE_RUIN

type TASK_NORMAL_SPAWN_ENERGY = 1
type TASK_HARU_SPAWN_ENERGY = 2
type TASK_CONTROLLER_ENERGY = 3
type TASK_TOWER_ENERGY = 4
type TASK_LAB_ENERGY = 5
type TASK_STORE_SOURCE = 11
type TASK_STORE_MINERAL = 12
type TASK_RECYCLE_TOMBSTONE = 41
type TASK_RECYCLE_RUIN = 42


interface Room {
    /** 增加任务 */
    addTask(): void;
}


// 先存到Memory里
// 后面稳定再改到global里
interface RoomMemory {
    tasks: Task<TASK_ANY>[]
}
