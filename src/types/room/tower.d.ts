interface Room {
  /**
   * 获取塔的最大能量
   * @return number 容量，目前是固定1000
   */
  getTowerMaxCapacity(): number;
  /**
   * 检查房间内的tower是否需要补充能量
   */
  checkTowerEnergy(): void;

  /**
   * 获取所有还没有排入队列的需要补充孵化能量的建筑
   * @return array 每个元素是一个建筑的实例
   */
  getUnqueueTaskTower(): StructureTower[];
  /**
   * 检查是否还有没进入队列的孵化能量建筑，协助creep判断是否需要进入搬运状态
   * @return boolean 判断结果
   */
  hasUnqueueTaskTower(): boolean;
}
