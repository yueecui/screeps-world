interface CreepMemory {
    /** Creep的职责 */
    role: ANY_ROLE_NAME
    /** 同一职责下的不同模式 */
    mode: ANY_CREEP_MODE
    /** Creep的工作状态 */
    work: WORK_STATUS
    /** Creep的能量状态 */
    energy: ENERGY_STATUS
    /** Creep出生的房间 */
    born: string
    /** Creep所属的房间 */
    belong?: string


    /** Creep工作的目标room */
    room: string
    /** Creep当前的工作目标 */
    t: Id<any> | null
    /** Creep当前的获取能量的目标 */
    et: Id<AnyStoreStructure> | null
    /** Creep当前的工作目标队列*/
    queue: Id<any>[] | null

    /** 采集者记录采集点编号*/
    node: number

    /** 指定站着的位置 */
    stay?: [number, number]


    /**
     * 【过期】Creep的职责(Role)
     */
    r: ANY_ROLE_NAME;
    /**
     * 【过期】Creep的能量持有状态，只有具备CARRY模块的才有该属性
     */
    e: ENERGY_STATUS;
    /**
     * 【过期】Creep的工作状态
     */
    w: WORK_STATUS;
    /**
     * 指定站着的位置
     */
    flag?: string;

}


type ENERGY_STATUS =
        | ENERGY_NEED
        | ENERGY_ENOUGH;

type ENERGY_NEED = 0;
type ENERGY_ENOUGH = 1;

type WORK_STATUS =
         | WORK_MOVE
         | WORK_IDLE
         | WORK_NORMAL
         | WORK_TRANSPORTER_SPAWN
         | WORK_TRANSPORTER_TOWER
         | WORK_TRANSPORTER_CONTROLLER
         | WORK_TRANSPORTER_TOMBSTONE
         | WORK_TRANSPORTER_STORAGE_MINERAL
         | WORK_TRANSPORTER_STORAGE_ENERGY
         | WORK_HARVEST
         | WORK_UPGRADE
         | WORK_BUILD
         | WORK_REPAIR;

type WORK_IDLE = 0;
type WORK_MOVE = 1;
type WORK_NORMAL = 2;
type WORK_HARVEST = 11;
type WORK_UPGRADE = 12;
type WORK_BUILD = 13;
type WORK_REPAIR = 14;
type WORK_TRANSPORTER_SPAWN = 21;
type WORK_TRANSPORTER_TOWER = 22;
type WORK_TRANSPORTER_CONTROLLER = 23;
type WORK_TRANSPORTER_TOMBSTONE = 24;
type WORK_TRANSPORTER_STORAGE_MINERAL = 25;
type WORK_TRANSPORTER_STORAGE_ENERGY = 26;


type ANY_CREEP_MODE =
        | MODE_NONE
        | MODE_HARVEST_ENERGY
        | MODE_HARVEST_MINERAL
        | MODE_SPAWN
        | MODE_CONTROLLER
        | MODE_HELP
        | MODE_BUILDER
        | MODE_REPAIRER;

// 无模式
type MODE_NONE = -1;
// 搬运者的模式
type MODE_HARVEST_ENERGY = 0;
type MODE_HARVEST_MINERAL = 1;
// 搬运者的模式
type MODE_SPAWN = 0;
type MODE_CONTROLLER = 1;
type MODE_OUTSIDE = 2;
type MODE_HELP = 9;
// 建造者的模式
type MODE_BUILDER = 0;
type MODE_REPAIRER = 1;
