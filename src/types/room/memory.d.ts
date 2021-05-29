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
  sources: Array<sourceInfo>;
  /**
   * 本房间最后一次孵化的时间
   *
   * 用于判断是否要再次进行孵化
   */
  lastSpawnTime: number;
  /**
   * 当前还需要补充能量的孵化用建筑物
   */
  taskSpawn: Record<string, taskInfo>;
  /**
   * room中tower的id缓存
   */
  towers: Array<Id<StructureTower>>;
  /**
   * 当前还需要补充能量的塔
   */
  taskTowers: Record<string, taskInfo>;
  /**
   * room中，container的ID缓存
   *
   * container需要手工调用Room.addContainer添加（但会定期自动检测是否存在，不存在就会自动移除）
   */
  containers: Array<containerInfo>;
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
 interface sourceInfo {
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
 * 任务信息状态
 */
 interface taskInfo{
  cName: string | null;
  stat: TASK_STATUS;
}

type TASK_STATUS =
    | TASK_WAITING
    | TASK_ACCEPTED;

type TASK_WAITING = 0;
type TASK_ACCEPTED = 1;


/**
 * container缓存的状态
 */
interface containerInfo{
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
  cName: string,
  sid: Id<StructureContainer>,
  t: PLAN_TYPE,
  a: number,
}

type PLAN_TYPE =
    | PLAN_INCOME
    | PLAN_PAY;
type PLAN_INCOME = 0; // 预计收入
type PLAN_PAY = 1;  // 预计支出

