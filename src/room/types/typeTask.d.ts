interface Room {
    /** 本tick本room已经发布的任务数量，从1开始 */
    taskIndex: number;
    /** 创建运输任务 */
    createTask<T extends TASK_ANY>(task: Task<T>, force?: boolean): boolean;
    /** 判断运输任务是否已经添加 */
    hasTask(task: Task<TASK_ANY>): boolean;

    /** 分配运输任务 */
    assignTaskMain(): void;
    /** 分配高优先级的纯能量任务 */
    assignEnergyTask(task_queue: Task<TASK_ANY>[]): void;
    /** 分配中低优先级的混合任务 */
    assignComplexTask(task_queue: Task<TASK_ANY>[]): void;
    /** 拆分运输任务 */
    splitTask(task: Task<TASK_ANY>, remain_capacity: number): void;
    /** 按容量分配任务 */
    assignTaskbyCapacity(task_queue: Task<TASK_ANY>[], start_pos: RoomPosition, capacity: number): string[];

    /** 将运输任务发送给蚂蚁 */
    sendTask(creep: Creep, task_queue: Task<TASK_ANY>[], task_id_array: string[]): void;

    /** 根据房间等级等情况，获得通用源 */
    getCommonSource(task: Task<TASK_ANY>): (StructureStorage|StructureTerminal|StructureContainer|StructureLink)[];
}

// 先存到Memory里
// 后面稳定再改到global里
interface RoomMemory {
    /** 任务 */
    task: {
        high: Task<TASK_ANY>[],
        medium: Task<TASK_ANY>[],
        low: Task<TASK_ANY>[],
        doing: {[key:string]: Task<TASK_ANY>},
        status: {[key:string]: TaskId}
    }
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
    /** 搬运货物信息 */
    cargo: TaskCargo
    /** 优先级 */
    priority: TASK_PRIORITY_ANY
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
    state?: TASK_STATUS_ANY
    /** 预定的物资，计算时会从来源处扣除 */
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
    | TASK_PRIORITY_LOW
    | TASK_PRIORITY_MEDIUM
    | TASK_PRIORITY_HIGH

type TASK_PRIORITY_LOW = 1
type TASK_PRIORITY_MEDIUM = 2
type TASK_PRIORITY_HIGH = 3

type TASK_PRIORITY_NAME_ANY =
    | TASK_PRIORITY_LOW_NAME
    | TASK_PRIORITY_MEDIUM_NAME
    | TASK_PRIORITY_HIGH_NAME

type TASK_PRIORITY_LOW_NAME = 'low'
type TASK_PRIORITY_MEDIUM_NAME = 'medium'
type TASK_PRIORITY_HIGH_NAME = 'high'

type cargoOrder = {
    id: Id<AnyStoreStructure>
    room: string
    type: ResourceConstant
    amount: number
}

type TASK_STATUS_ANY =
    |TASK_STATUS_INIT
    |TASK_STATUS_ORDER
    |TASK_STATUS_OBTAIN
    |TASK_STATUS_DELIVER

type TASK_STATUS_INIT = 0
type TASK_STATUS_ORDER = 1
type TASK_STATUS_OBTAIN = 2
type TASK_STATUS_DELIVER = 3
