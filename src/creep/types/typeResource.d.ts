// Creep资源相关方法接口扩展
interface Creep {

  /**
   * 更新Creep的能量状态（仅对有CARRY部件的creep有效）
   */
  updateEnergyStatus(): void;
  /**
   * 从房间的container或是storage里获取能量
   * @returns boolean 能量目标是否存在
   */
  obtainEnergy(opt?: obtainEnergyOpt): boolean;
  /**
   * 寻找最合适的能量存储
   */
  findEnergyStore(opt: obtainEnergyOpt): StructureContainer | StructureStorage | StructureTerminal | null;
  /**
   * 尝试回收creep附近的掉落能量、墓碑能量、废墟能量
   * @returns true表示成功拾取到
   */
   recycleNearby(res_type?: ResourceConstant): boolean;

   /**
    * 返回本回合是否有进行回收操作
    *
    * 主要用于阻止后续进行获取类操作
    */
   isRecycling(): boolean;
}

/**
 * 请求获得能量时的参数
 */
interface obtainEnergyOpt{
  min_amount?: number,
  container?: ANY_CONTAINER_TYPE[];
  storage?: boolean;
  terminal?: boolean;
  priority?: PRIORITY_TYPE;
}

type PRIORITY_TYPE =
    | PRIORITY_NONE
    | PRIORITY_CONTAINER
    | PRIORITY_STORAGE;

type PRIORITY_NONE = 0;
type PRIORITY_CONTAINER = 1;
type PRIORITY_STORAGE = 2;
