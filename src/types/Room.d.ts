interface RoomMemory {
  /**
   * 强制清除缓存的标记
   */
  flagPurge: boolean;
  /**
   * room里的source缓存
   *
   * 只生成一次，只要sources这个key存在就不会再刷新
   */
  sources: Array<sourceStatus>;
  /**
   * 是否需要检查孵化用能量
   *
   * 1.孵化后自动标记
   * 2.周期性检查
   */
  flagSpawnEnergy: boolean;
  /**
   * 当前还需要补充能量的孵化用建筑物
   */
  taskSpawn: Record<string, TASK_STATUS>;
  /**
   * room中tower的id缓存
   */
  towers: Array<Id<StructureTower>>;
  /**
   * 当前还需要补充能量的塔
   */
  taskTowers: Record<string, TASK_STATUS>;
  /**
   * room中，container的ID缓存
   *
   * container需要手工调用Room.addContainer添加（但会定期自动检测是否存在，不存在就会自动移除）
   */
  containers: Array<containerStatus>;
  /**
   * 目前运输的能量计划
   *
   * 用于辅助计算能量存储建筑可用能量
   */
  energyPlan: EnergyPlan[];
}

/**
 * source缓存的状态
 */
interface sourceStatus {
  /**
   * source ID
   */
  s: Id<Source>;
  /**
   * 对应的container
   *
   * 当Room.addContainer执行时，会判断新添加的container是不是在某个source周围1格，
   * 如果是的话会进行关联绑定
   */
  c: Id<StructureContainer> | null;
}

/**
 * container缓存的状态
 */
 interface containerStatus{
  id: Id<StructureContainer>;
  type: ANY_CONTAINER_TYPE;
}

type ANY_CONTAINER_TYPE =
    | CONTAINER_TYPE_SOURCE
    | CONTAINER_TYPE_CONTROLLER;
type CONTAINER_TYPE_SOURCE = 0;  // 临接source的container，存量变多后会转移到storage
type CONTAINER_TYPE_CONTROLLER = 1;  // 用于给upgrader提取能量的container

/**
 * 运输中的能量计划
 */
interface EnergyPlan{
  cid: Id<Creep>,
  sid: Id<StructureContainer>,
  t: PLAN_TYPE,
  a: number,
}

type PLAN_TYPE =
    | PLAN_INCOME
    | PLAN_PAY;
type PLAN_INCOME = 0; // 预计收入
type PLAN_PAY = 1;  // 预计支出

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
    structure: Record<string, AnyStructure | null>  // 因为ID类型不同，只能当成字符串存下来，使用时需要注意
  };
  /**
   * 房间需要强制刷新各种缓存
   */
  clearCache(): void;
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
   * 初始化memory
   */
  initMemory(): void;
  /**
   * 初始化source数据
   */
  initSources(): void;
  /**
   * 试图添加source对应的container
   */
  addSourceContainer(container: StructureContainer): void;
  /**
   * 移除了一个container，检查是否为source对应的，如果是就移除
   */
  removeSourceContainer(container_id: Id<StructureContainer>): void;
  /**
   * 缓存room中特定建筑的Id
   */
  cacheMyStructuresId(): void;
  /**
   * 检查房间内是否孵化用能量没满，如果没满则缓存出所有没满的建筑列表
   */
  checkSpawnEnergy(): void;
  /**
   * 获取房间扩展(Extension)的最大容量
   * @return number 根据controller等级返回容量值
   */
  getExtensionMaxCapacity(): number;
  /**
   * 获取所有还没有排入队列的需要补充孵化能量的建筑
   * @return array 每个元素是一个建筑的实例
   */
  getUnqueueSpawnEnergyStores(): SpawnEnergyStoreStructure[];
  /**
   * 检查房间内的tower是否需要补充能量
   */
  checkTowerEnergy(): void;
  /**
   * 添加一个container
   *
   * 这个方法一般手工调用
   * @param id 需要添加的container id
   * @param type container的类型，用于用途判断
   */
  addContainer(id: Id<StructureContainer>, type: ANY_CONTAINER_TYPE): void;
  /**
   * 移除一个container
   *
   * 这个方法会在定期检查时自动调用
   * @param id 需要移除的container id
   */
  removeContainer(id: Id<StructureContainer>): void;
  /**
   * 周期性检查container，移除不存在的
   */
  checkContainerStatus(): void;
  /**
   * 预定要变化container的energy
   *
   * @param creep_id 预定使用的creep id
   * @param container_id 预定的container id
   * @param type 预定类型（是存入还是取出）
   * @param amount 预定数量
   */
  bookingContainer(creep_id: Id<Creep>, container_id: Id<StructureContainer>, type: PLAN_TYPE, amount: number): void;
  /**
   * 取消预定要变化container的energy
   *
   * @param id 需要取消预定的creep id，会取消该creep的所有预定
   */
  unbookingContainer(id: Id<Creep>): void;
  /**
   * 获取指定id的container在计算预定额度后的能量数值
   *
   * @param id 指定的continaer id
   * @returns number 计算额度后的能量数值
   */
   getContainerEnergyCapacity(id: StructureContainer): number;
  /**
   * 检查房间内的container是否能量过盛（需要转存到storage中）
   */
   getFullSourceContainers(): StructureContainer[];
}
