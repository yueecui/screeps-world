interface Room {
  /**
   * 获取房间扩展(Extension)的最大容量
   * @return number 根据controller等级返回容量值
   */
  getExtensionMaxCapacity(): number;
  /**
   * 检查房间内是否孵化用能量没满，如果没满则缓存出所有没满的建筑列表
   */
   checkSpawnEnergy(): void;
   /**
    * 获取所有还没有排入队列的需要补充孵化能量的建筑
    * @return array 每个元素是一个建筑的实例
    */
   getUnqueueTaskSpawn(): AnySpawnEnergyStoreStructure[];
   /**
    * 检查是否还有没进入队列的孵化能量建筑，协助creep判断是否需要进入搬运状态
    * @return boolean 判断结果
    */
   hasUnqueueTaskSpawn(): boolean;
}
