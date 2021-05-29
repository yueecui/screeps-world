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
   * Creep当前的目标
   */
  t: Id<any> | null;
  /**
   * Creep当前的目标队列
   */
  queue: Id<any>[] | null;


  /**
   * 临时：采集者记录采集点编号
   */
   node: number;
  /**
   * 临时：建造者的模式
   */
   model: string;
}


type ENERGY_STATUS =
    | ENERGY_NEED
    | ENERGY_ENOUGH;

type ENERGY_NEED = 0;
type ENERGY_ENOUGH = 1;

type WORK_STATUS =
     | WORK_IDLE
     | WORK_TRANSPORTER_SPAWN
     | WORK_TRANSPORTER_TOWER
     | WORK_TRANSPORTER_STORAGE
     | WORK_HARVESTER;

type WORK_STATUS_HAS_TASK =
     | WORK_TRANSPORTER_SPAWN
     | WORK_TRANSPORTER_TOWER;

type WORK_IDLE = 0;
type WORK_TRANSPORTER_SPAWN = 1;
type WORK_TRANSPORTER_TOWER = 2;
type WORK_TRANSPORTER_STORAGE = 10;
type WORK_HARVESTER = 11;
