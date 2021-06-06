// Creep基础方法接口扩展
interface Creep {
  // 内部属性
  _roomCode: string;
  _baseName: string;
  _index: number;

  // 普通属性
  /** 本回合执行recycleNearby是否成功的标记 */
  recycling: boolean;

  // 引用属性
  named: boolean;
  baseName: string;
  index: number;
  roomCode: string;
  /** 该creep属于哪个room */
  belong: string;

  role: ANY_ROLE_NAME;
  /** 同一个ROLE的不同MODE */
  mode: ANY_CREEP_MODE;
  work: WORK_STATUS;
  target: Id<any> | null;
  energy: ENERGY_STATUS;
  energyTarget: Id<AnyStoreStructure> | null;

  /** 根据Creep的Role执行不同的运行脚本 */
  run(): void;
  /** 根据虫子的name解析出自定属性基础名称(baseName)和编号(index) */
  analyzeName(): void;

  /** 清除当前缓存的目标队列 */
  clearQueue(): void;
  /** 检查一个id是否在target或是queue中 */
  inTaskQueue(id: Id<any>): boolean;
  /** 更新队列：WORK_TRANSPORTER_SPAWN
   * @returns boolean 更新后的队列是否大于0 */
  acceptTaskSpawn(): boolean;
  /** 根据任务队列，设定下一个目标
   * @returns true表示设定成功，false表示已经没有目标了 */
  setNextTarget(): boolean;
  /** 移动到等待地点，如果没有指定则原地发呆 */
  goToStay(): void;
}

interface obtainEnergyOpt{
  min_amount?: number,
  container?: ANY_CONTAINER_TYPE[];
  storage?: boolean;
}
