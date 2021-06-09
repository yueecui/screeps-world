interface RoleConfig{
  basename?: string;
  /**
   * 身体配件组成
   */
  body?: BodyPartConstant[];
  /**
   * 身体配件组成生成代码，如果填写此项的话，会根据对应code，用算法来生成身体配件方案
   */
  body_code?: string;
  /**
   * 有专用名字的
   *
   * 该类配置不生成编号
   */
  named?: boolean;
  /**
   * 维持数量
   */
  amount: number;
  /**
   * （预计废弃）提前生成时间
   */
  aheadTime?: number;
  /**
   * 初期memory，因为不一定是完整的memory所以这里不声明成 CreepMemory
   */
  memory: Record<string, any>;
  /**
   * 视为存活的条件
   */
  liveCondition?: LivedCondition;
  /**
   * 重生条件
   */
  respawnCondition?: RespawnCondition;
}

interface SpawnConfig{
  type: ANY_SPAWN_TYPE;
  baseName: string
  advance: boolean
  memory: (spawn_room: Room, work_room_name?: string) => Record<string, any>
  amount: (spawn_room: Room, work_room_name?: string) => number
  body: (spawn_room: Room) => BodyPartConstant[]
  /** 判断是否将当前creep视为存活状态 */
  isLive: (spawn_room: Room, creep: Creep) => boolean
  /** 判断当前room的状态是否满足重新孵化的条件 */
  needSpawn: (spawn_room: Room, work_room_name?: string) => boolean
}

type ANY_SPAWN_TYPE =
    | SPAWN_TYPE_IN_ROOM
    | SPAWN_TYPE_OUTSIDE

type SPAWN_TYPE_IN_ROOM = 1
type SPAWN_TYPE_OUTSIDE = 2

/**
 * 视为存活的条件
 */
interface LivedCondition{
  /**
   * 重生提前时间，不设置为不提前
   *
   * 设置为0时，会计算生成时间，根据生成时间进行提前
   *
   * 设置大于0时，会在生成时间的基础上额外进行加时（例如填写一个移动时间，可以保证前后2个交接顺利）
   */
   advanceTime?: number;
}

/**
 * 重生条件
 */
interface RespawnCondition{

}

type ANY_ROLE_NAME =
    | ROLE_GOTO_RECYCLE
    | ROLE_MANUAL

    | ROLE_HARVESTER
    | ROLE_TRANSPORTER
    | ROLE_BUILDER
    | ROLE_UPGRADER
    | ROLE_MASTERMIND

    | ROLE_SCOUT
    | ROLE_ENGINEER
    | ROLE_ATTACKER

type ROLE_GOTO_RECYCLE = '回收';
type ROLE_MANUAL = '手动';

type ROLE_HARVESTER = '采集';
type ROLE_TRANSPORTER = '运输';
type ROLE_BUILDER = '建造';
type ROLE_UPGRADER = '升级';
type ROLE_MASTERMIND = '主脑';

type ROLE_SCOUT = '斥候';
type ROLE_ATTACKER = '攻击';
type ROLE_ENGINEER = '工兵';

type AnyRole =
    | CreepRole
    | Transporter
    | Builder
    | Upgrader
    | Attacker
    | Engineer;

interface CreepRole {
  run(creep: Creep): void;
  updateStatus(creep: Creep): void;
  execute(creep: Creep): void;
}


interface Transporter extends CreepRole{
  otherRoom(creep: Creep): void;
}

interface Builder extends CreepRole{
  findRepairTarget(creep: Creep): Structure|null;
  repairTarget(creep: Creep, target: Structure): void;
  findBuildTarget(creep: Creep): ConstructionSite|null;
  buildTarget(creep: Creep, target:ConstructionSite): void;
  findRepairWall(creep: Creep): StructureWall|null;
  repairTargetWall(creep: Creep, target: StructureWall): void;
  findRepairRampart(creep: Creep): StructureRampart|null;
  repairTargetRampart(creep: Creep, target: StructureRampart): void;
}

interface Upgrader extends CreepRole{
}

interface Attacker extends CreepRole{
}

interface Engineer extends CreepRole{

}
