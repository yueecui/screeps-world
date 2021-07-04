// Creep基础方法接口扩展
interface Creep {
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
  container?: CONTAINER_TYPE_ANY[];
  storage?: boolean;
}
