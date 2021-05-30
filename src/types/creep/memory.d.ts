interface CreepMemory {
  /**
   * Creep的职责(Role)
   */
  r: AnyRoleName;
  /**
   * Creep的能量持有状态，只有具备CARRY模块的才有该属性
   */
  e: ENERGY_STATUS;
  /**
   * Creep的工作状态
   */
  w: WORK_STATUS;
  /**
   * Creep当前的工作目标队列
   */
   queue: Id<any>[] | null;
  /**
   * Creep当前的工作目标
   */
  t: Id<any> | null;
  /**
   * Creep当前的能量目标
   */
  et?: Id<AnyStoreStructure> | null;
  /**
   * 采集者记录采集点编号
   */
  node: number;
  /**
   * Creep的模式
   *
   * 不同类型的模式不同
   */
  mode: number;
}


type ENERGY_STATUS =
    | ENERGY_NEED
    | ENERGY_ENOUGH;

type ENERGY_NEED = 0;
type ENERGY_ENOUGH = 1;

type WORK_STATUS =
     | WORK_GOTO
     | WORK_IDLE
     | WORK_TRANSPORTER_SPAWN
     | WORK_TRANSPORTER_TOWER
     | WORK_TRANSPORTER_CONTROLLER
     | WORK_TRANSPORTER_STORAGE
     | WORK_HARVEST
     | WORK_UPGRADE
     | WORK_BUILD
     | WORK_REPAIR;

type WORK_GOTO = -1
type WORK_IDLE = 0;
type WORK_TRANSPORTER_SPAWN = 1;
type WORK_TRANSPORTER_TOWER = 2;
type WORK_TRANSPORTER_CONTROLLER = 3;
type WORK_TRANSPORTER_STORAGE = 10;
type WORK_HARVEST = 11;
type WORK_UPGRADE = 12;
type WORK_BUILD = 13;
type WORK_REPAIR = 14;

type ANY_CREEP_MODE =
    | MODE_BUILDER
    | MODE_REPAIRER;

type MODE_BUILDER = 0;
type MODE_REPAIRER = 1;
