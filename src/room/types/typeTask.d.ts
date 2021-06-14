/** 任务 */
interface Task{
    /** 当前接受了任务的creep */
    creep: Id<Creep>|null
    /** 源集合 */
    from: Id<AnyStoreStructure>[]
    /** 目标集合 */
    to?: Id<AnyStoreStructure>[]
    /** 如果是haru，则haru的index */
    haruIndex?: number;
    /** 任务类型 */
    type: TASK_ANY
    /** 货物信息 */
    cargo: Record<ResourceConstant, number>
}

type TASK_ANY =
    |TASK_SPAWN_ENERGY
    |TASK_CONTROLLER_ENERGY
    |TASK_TOWER_ENERGY
    |TASK_STORE_ENERGY
    |TASK_RECYCLE_TOMBSTONE
    |TASK_RECYCLE_RUIN
    |TASK_STORE_MINERAL

type TASK_SPAWN_ENERGY = 1
type TASK_CONTROLLER_ENERGY = 2
type TASK_TOWER_ENERGY = 3
type TASK_STORE_ENERGY = 4
type TASK_RECYCLE_TOMBSTONE = 5
type TASK_RECYCLE_RUIN = 6
type TASK_STORE_MINERAL = 7

interface Room {
    /** 巡查任务 */
    inspectTask(): void;
}


// 先存到Memory里
// 后面稳定再改到global里
interface RoomMemory {
    tasks: Task[]
}
