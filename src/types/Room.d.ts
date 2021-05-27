interface RoomMemory {
  /**
   * 强制清除缓存的标记
   */
  flagPurge?: boolean;
  /**
   * 是否需要检查孵化用能量
   *
   * 1.孵化后自动标记
   * 2.周期性检查
   */
  flagSpawnEnergy?: boolean;
  /**
   * 当前还需要补充能量的孵化用建筑物
   */
  taskSpawn?: Record<string, TASK_STATUS>;
  /**
   * room中tower的id缓存
   */
  towers?: Array<Id<StructureTower>>;
  /**
   * 当前还需要补充能量的塔
   */
  taskTowers?: Record<string, TASK_STATUS>;
  /**
   * room中，用来临时存储energy的container的ID缓存
   *
   * container需要手工维护
   *
   * 这类container的能量可以用于被提取，并且超过一定额度后会自动运送到同room的storage里
   */
  energyContainers?: Array<Id<StructureContainer>>;
  /**
   * 需要搬运走能量的container
   */
  taskEC?: Record<string, TASK_STATUS>;
}

type SpawnEnergyStoreStructure = StructureExtension | StructureSpawn;

type TASK_STATUS =
    | TASK_WAITING
    | TASK_ACCEPTED;

type TASK_WAITING = 0;
type TASK_ACCEPTED = 1;

interface Room {
  /**
   * 按tick的缓存信息
   */
  cache: {
    structure: Record<string, AnyStructure>  // 因为ID类型不同，只能当成字符串存下来，使用时需要注意
  };
  /**
   * 房间需要强制刷新各种缓存
   */
  clearCache(): void;
  getStructureById<T extends AnyStructure>(id: Id<T>): T;
  getStructureByIdArray<T extends AnyStructure>(id: Id<T>[]): T[];
  /**
   * 房间定期检查
   */
  tickCheck(): void;
  /**
   * 缓存room中特定建筑的Id
   */
   cacheMyStructuresId(): void;
  /**
   * 检查房间内是否孵化用能量没满，如果没满则缓存出所有没满的建筑列表
   */
   CheckSpawnEnergy(): void;
  /**
   * 获取房间扩展(Extension)的最大容量
   * @return number 容量
   */
   getExtensionMaxCapacity(): number;
   getUnqueueSpawnEnergyStores(): SpawnEnergyStoreStructure[];
  /**
   * 检查房间内的tower是否需要补充能量
   */
   CheckTowerEnergy(): void;
  /**
   * 检查房间内的container是否能量过盛（需要转存到storage中）
   */
   CheckContainerEnergy(): void;
}
