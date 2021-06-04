type AnySpawnEnergyStoreStructure = StructureExtension | StructureSpawn;


interface Room {
  /**
   * 房间定期检查
   */
  tickCheck(): void;
  /**
   * 检查room的各个任务队列是否存在错误，如果存在就自动修复
   */
  errorCheck(): void;
  /**
   * 初始化memory
   */
  initMemory(): void;
  /**
   * 初始化source和mineral数据
   */
  initCollection(): void;
  /**
   * 缓存room中建筑的Id
   */
   cacheStructuresStatus(): void;
  /**
   * 获得room中所有我方spawns
   */
   getMySpawns(): StructureSpawn[];
    /**
     * 计算订单收益
     */
    calcPrice(order_id: string, amount?: number): void;
}
