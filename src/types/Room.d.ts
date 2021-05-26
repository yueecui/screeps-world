interface RoomMemory {
  /**
   * 是否需要检查孵化用能量
   *
   * 1.孵化后自动标记
   * 2.周期性检查
   */
  needCheckSpawnEnergy: boolean;
  /**
   * 当前还需要补充能量的孵化用建筑物
   */
  spawnEnergyStores?: {
    unqueued: Id<SpawnEnergyStoreStructure>[];
    queued: Id<SpawnEnergyStoreStructure>[];
  }
  towers: Array<Id<StructureTower>>;
}

type SpawnEnergyStoreStructure = StructureExtension | StructureSpawn;

interface Room {
  /**
   * 各种缓存信息
   */
  cache: {
    structure?: Record<string, AnyStructure>  // 因为ID类型不同，只能当成字符串存下来，使用时需要注意
  };
  /**
   * 房间定期检查
   */
  periodicInspection(): void;
  /**
   * 检查房间内是否孵化用能量没满，如果没满则缓存出所有没满的建筑列表
   */
  CheckSpawnEnergy(): void;

  getTower(): Array<Id<StructureTower>>;
}
