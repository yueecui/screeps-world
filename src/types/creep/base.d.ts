// Creep基础方法接口扩展
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
   * 设定工作状态
   */
  setWorkState(state: WORK_STATUS): void;
  /**
   * 获取工作状态
   */
  getWorkState(): WORK_STATUS;
  /**
   * 设定能量状态
   */
  setEnergyState(state: ENERGY_STATUS): void;
  /**
   * 获取能量状态
   */
  getEnergyState(): ENERGY_STATUS;
  /**
   * 设定当前缓存的目标object id
   */
  setTarget(id: Id<any>): void;
  /**
   * 获取当前的目标object id
   */
  getTarget(): string | null;
  /**
   * 获取当前缓存的目标object
   *
   * 由于不确认缓存的目标是什么，请注意安全
   */
  getTargetObject(): any;
  /**
   * 清除当前缓存的目标object ID
   */
  clearTarget(): void;
  /**
   * 将当前缓存的目标塞回队列的第一个
   */
  unshiftTarget(): void;
  /**
   * 清除当前缓存的目标队列
   */
  clearQueue(): void;
  /**
   * 检查一个id是否在target或是queue中
   */
  inTaskQueue(id: Id<any>): boolean;
  /**
   * 更新队列：WORK_TRANSPORTER_SPAWN
   * @returns boolean 更新后的队列是否大于0
   */
  acceptTaskSpawn(): boolean;
  /**
   * 根据任务队列，设定下一个目标
   * @returns true表示设定成功，false表示已经没有目标了
   */
  setNextTarget(): boolean;
}

interface obtainEnergyOpt{
  min_amount?: number,
  container?: ANY_CONTAINER_TYPE[];
  storage?: boolean;
}
