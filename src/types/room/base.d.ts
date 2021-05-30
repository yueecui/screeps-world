type AnySpawnEnergyStoreStructure = StructureExtension | StructureSpawn;


interface Room {
  /**
   * 缓存room中特定建筑的Id
   */
   cacheMyStructuresId(): void;
  /**
   * 根据id获得建筑的实例
   *
   * 如果cache中有则从cache中获取，否则使用getObjectById
   * @return 建筑实例
   */
  getStructureById<T extends AnyStructure>(id: Id<T>): T | null;
  /**
   * 根据id list获得一组建筑的实例
   *
   * 如果cache中有则从cache中获取，否则使用getObjectById
   * @returns result 每个元素是建筑实例
   * @returns missed_id 没有查找到的id
   */
  getStructureByIdArray<T extends AnyStructure>(id_list: Id<T>[]): [T[], Id<T>[]];

  /**
   * 房间定期检查
   */
  tickCheck(): void;
  /**
   * 检查room的各个任务队列是否存在错误，如果存在就自动修复
   */
  checkTaskError(): void;
  /**
   * 初始化memory
   */
  initMemory(): void;
  /**
   * 初始化source数据
   */
  initSources(): void;
}
