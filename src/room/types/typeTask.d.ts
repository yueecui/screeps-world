interface Room {
    /** 本tick本room已经发布的任务数量，从1开始 */
    taskIndex: number;
    /** 创建运输任务 */
    createTask<T extends TASK_ANY>(task_info: Task<T>, priority?: TASK_PRIORITY_ANY, force?: boolean): boolean;
    /** 判断运输任务是否已经添加 */
    hasTask(task_info: Task<TASK_ANY>): boolean;

    /** 分配运输任务 */
    assignTask(): void;
    /** 将运输任务发送给蚂蚁 */
    sendTask(task: Task<TASK_ANY>, creep: Creep): TaskCargo;

    /** 根据房间等级等情况，获得通用源 */
    getCommonSource(): (StructureStorage|StructureTerminal|StructureContainer)[];
}



// 先存到Memory里
// 后面稳定再改到global里
interface RoomMemory {
    /** 未处理的运输任务队列 */
    tasks: Task<TASK_ANY>[]
    /** 进行中的运输任务队列 */
    taskDoing: {[key:string]: Task<TASK_ANY>}
    /** 发布运输任务的状态 */
    taskStatus: {[key:string]: TaskId}
}

/** 运输任务 */
interface Task<T extends TASK_ANY>{
    // 创建时参数
    /** 任务类型 */
    type: T
    /** 任务目标ID */
    object: TaskObjectId<T>
    /** 搬运货物信息，计算时会从来源处扣除 */
    cargo: TaskCargo
    /** ID，由创建时间和序号来生成 */
    id?: TaskId
    /** 任务创建时间 */
    createTime?: number;

    // 分配时参数
    /** 任务接受时间 */
    acceptTime?: number;
    /** 当前执行的creep */
    creep?: Id<Creep>

    // 执行时参数
    /** 状态编号 */
    state?: number
    /** 预定的物资 */
    order?: cargoOrder[]
}

type TaskId = string


type TaskCargo = {[P in ResourceConstant]?: number}

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


type TaskObjectId<T extends TASK_ANY>
    = T extends TASK_NORMAL_SPAWN_ENERGY | TASK_HARU_SPAWN_ENERGY | TASK_CONTROLLER_ENERGY
    ? string
    : T extends TASK_TOWER_ENERGY
    ? Id<StructureTower>
    : T extends TASK_LAB_ENERGY
    ? Id<StructureLab>
    : T extends TASK_STORE_SOURCE | TASK_STORE_MINERAL
    ? Id<StructureContainer>
    : T extends TASK_RECYCLE_TOMBSTONE
    ? Id<Tombstone>
    : T extends TASK_RECYCLE_RUIN
    ? Id<Ruin>
    : never

type TASK_PRIORITY_ANY =
    | TASK_PRIORITY_HIGH
    | TASK_PRIORITY_MIDDLE
    | TASK_PRIORITY_LOW

type TASK_PRIORITY_HIGH = 0
type TASK_PRIORITY_MIDDLE = 1
type TASK_PRIORITY_LOW = 2

type cargoOrder = {
    id: Id<AnyStoreStructure>
    type: ResourceConstant
    amount: number
}
