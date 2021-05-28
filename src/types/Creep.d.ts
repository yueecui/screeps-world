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


// 扩展原型的接口
interface Creep {
  /**
   * 根据Creep的Role执行不同的运行脚本
   */
   run(): void;
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
  /**
   * 清除当前缓存的目标object ID
   */
  clearTarget(): void;
  /**
   * 清除当前缓存的目标队列
   */
  clearQueue(): void;
  /**
   * 更新Creep的能量状态（仅对有CARRY部件的creep有效）
   */
  updateEnergyStatus(): void;
  /**
   * 从房间的container或是storage里获取能量
   */
  obtainEnergy(opt?: obtainEnergyOpt): void;
  /**
   * 寻找最合适的能量存储
   */
  findEnergyStore(opt?: obtainEnergyOpt): StructureContainer | StructureStorage | null;
  /**
   * 检查房间的孵化能量是否足够，
   * 不足的情况下会设工作状态为WORK_TRANSPORTER_SPAWN
   */
   checkWorkTransporterSpawn(): void;
   /**
    * 执行WORK_TRANSPORTER_SPAWN
    */
   doWorkTransporterSpawn(): void;
   /**
    * 将下一个需要存能量的建筑ID设为memory.t
    * @returns true表示设定成功，false表示已经没有目标了，切回IDEL状态
    */
   nextSpawnEnergyStore(): boolean;
  /**
   * 本回合执行recycleNearby是否成功的标记
   */
  recycling: boolean;
  recycleNearby(res_type?: ResourceConstant): ScreepsReturnCode;
  isRecycling(): boolean;
  obtainEnergyFromNearestContainer(capacity_min: number): void;
}

interface obtainEnergyOpt{
  min_amount?: number,
  container?: ANY_CONTAINER_TYPE[];
  storage?: boolean;
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
     | WORK_TRANSPORTER_STORAGE;

type WORK_IDLE = 0;
type WORK_TRANSPORTER_SPAWN = 1;
type WORK_TRANSPORTER_TOWER = 2;
type WORK_TRANSPORTER_STORAGE = 10;
