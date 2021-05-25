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
   * 临时：Creep的职责(Role)（老版本）
   */
   role: AnyRoleName;
  /**
   * 临时：采集者记录采集点编号
   */
   node: number;
  /**
   * 临时：建造者的模式
   */
   model: string;
}


// 扩展原型的接口
interface Creep {
  /**
   * Creep的基础名称
   *
   * 例如“ABC1”中“ABC”就是基础名称，1是编号
   */
  baseName: string;
  /**
   * Creep的编号
   *
   * 例如“ABC1”中“ABC”就是基础名称，1是编号
   */
  index: number;
  /**
   * 本回合执行recycleNearby是否成功的标记
   */
  recycling: boolean;
  /**
   * 根据Creep的Role执行不同的运行脚本
   */
  run(): void;
  /**
   * 根据虫子的name解析出自定属性基础名称(baseName)和编号(index)
   */
  analyzeName(): boolean;
  /**
   * 获取基础名称(baseName)，如果还未解析则进行解析
   */
  getBasename(): string;
  /**
   * 获取编号(index)，如果还未解析则进行解析
   */
  getIndex(): number;
  /**
   * 获取职责名称
   */
  getRole(): AnyRoleName;
  /**
   * 获取当前缓存的目标object
   *
   * 由于不确认缓存的目标是什么，请注意安全
   */
  getTarget(): any;

  recycleNearby(res_type?: ResourceConstant): ScreepsReturnCode;
  isRecycling(): boolean;
  obtainEnergyFromNearestContainer(capacity_min: number): void;
}



/**
 * 当前Creep需要补充能量
 */
declare const ENERGY_NEED: ENERGY_NEED;
/**
 * 当前Creep的能量足够，不需要补充
 */
declare const ENERGY_ENOUGH: ENERGY_ENOUGH;

type ENERGY_STATUS =
    | ENERGY_NEED
    | ENERGY_ENOUGH;

type ENERGY_NEED = 0;
type ENERGY_ENOUGH = 1;


/**
 * 当前Creep正在空闲，等待新的指令
 */
declare const WORK_IDLE: WORK_IDLE;
/**
 * 当前Creep正在担任运输者职责，补充母巢或是扩展的能量
 */
declare const WORK_TRANSPORTER_SPAWN: WORK_TRANSPORTER_SPAWN;
/**
 * 当前Creep正在担任运输者职责，补充塔的能量
 */
declare const WORK_TRANSPORTER_TOWER: WORK_TRANSPORTER_TOWER;
/**
 * 当前Creep正在担任运输者职责，将当前房间的container里多余的能量带到storage
 */
declare const WORK_TRANSPORTER_STORAGE: WORK_TRANSPORTER_STORAGE;


type WORK_STATUS =
     | WORK_IDLE
     | WORK_TRANSPORTER_SPAWN
     | WORK_TRANSPORTER_TOWER
     | WORK_TRANSPORTER_STORAGE;

type WORK_IDLE = 0;
type WORK_TRANSPORTER_SPAWN = 1;
type WORK_TRANSPORTER_TOWER = 2;
type WORK_TRANSPORTER_STORAGE = 10;
