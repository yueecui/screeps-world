// 节省Memory空间用常数
const FALSE: FALSE = 0;
const TRUE: TRUE = 1;

// ROOM布局类型
// 后续全改掉后可能会取消该参数
const LAYOUT_FREE: LAYOUT_FREE = 0
const LAYOUT_SADAHARU: LAYOUT_SADAHARU = 1

// 运输任务类型
const TASK_NORMAL_SPAWN_ENERGY: TASK_NORMAL_SPAWN_ENERGY = 1
const TASK_HARU_SPAWN_ENERGY: TASK_HARU_SPAWN_ENERGY = 2
const TASK_CONTROLLER_ENERGY: TASK_CONTROLLER_ENERGY = 3
const TASK_TOWER_ENERGY: TASK_TOWER_ENERGY = 4
const TASK_LAB_ENERGY: TASK_LAB_ENERGY = 5
const TASK_STORE_SOURCE: TASK_STORE_SOURCE = 11
const TASK_STORE_MINERAL: TASK_STORE_MINERAL = 12
const TASK_RECYCLE_TOMBSTONE: TASK_RECYCLE_TOMBSTONE = 41
const TASK_RECYCLE_RUIN: TASK_RECYCLE_RUIN = 42

// 运输优先级
const TASK_PRIORITY_HIGH: TASK_PRIORITY_HIGH = 0
const TASK_PRIORITY_MIDDLE: TASK_PRIORITY_MIDDLE = 1
const TASK_PRIORITY_LOW: TASK_PRIORITY_LOW = 2

// Creep的角色名
const ROLE_GOTO_RECYCLE: ROLE_GOTO_RECYCLE = '回收';
const ROLE_MANUAL: ROLE_MANUAL = '手动';

const ROLE_HARVESTER: ROLE_HARVESTER = '采集';
const ROLE_TRANSPORTER: ROLE_TRANSPORTER = '运输';
const ROLE_BUILDER: ROLE_BUILDER = '建造';
const ROLE_UPGRADER: ROLE_UPGRADER = '升级';
const ROLE_MASTERMIND: ROLE_MASTERMIND = '主脑';

const ROLE_SCOUT: ROLE_SCOUT = '斥候';
const ROLE_ENGINEER: ROLE_ENGINEER = '工兵';
const ROLE_ATTACKER: ROLE_ATTACKER = '攻击';

/** 房间内工蚁 */
const SPAWN_TYPE_IN_ROOM: SPAWN_TYPE_IN_ROOM = 1;
/** 房间外工蚁 */
const SPAWN_TYPE_OUTSIDE: SPAWN_TYPE_OUTSIDE = 2;

// Creep工作进程的状态码

/**
 * 当前Creep需要补充能量
 */
const ENERGY_NEED: ENERGY_NEED = 0;
/**
 * 当前Creep的能量足够，不需要补充
 */
const ENERGY_ENOUGH: ENERGY_ENOUGH = 1;


/**
 * 当前Creep正在空闲，等待新的指令
 */
const WORK_IDLE: WORK_IDLE = 0;
/**
 * 当前Creep正在前往工作场所
 */
const WORK_MOVE: WORK_MOVE = 1;
/**
 * 单一模式正常工作的蚂蚁
 */
const WORK_NORMAL: WORK_NORMAL = 2;


/**
 * 当前Creep正在进行采集
 */
 const WORK_HARVEST: WORK_HARVEST = 11;

 /**
  * 当前Creep正在升级控制器
  */
 const WORK_UPGRADE: WORK_UPGRADE = 12;
 /**
  * 当前Creep正在进行建造
  */
 const WORK_BUILD: WORK_BUILD = 13;
 /**
  * 当前Creep正在进行修理
  */
 const WORK_REPAIR: WORK_REPAIR = 14;
// 运输类工作
/**
 * 当前Creep正在担任运输者职责，补充母巢或是扩展的能量
 */
const WORK_TRANSPORTER_SPAWN: WORK_TRANSPORTER_SPAWN = 21;
/**
 * 当前Creep正在担任运输者职责，补充塔的能量
 */
const WORK_TRANSPORTER_TOWER: WORK_TRANSPORTER_TOWER = 22;
/**
 * 当前Creep正在担任运输者职责，为控制器container补充能量
 */
const WORK_TRANSPORTER_CONTROLLER: WORK_TRANSPORTER_CONTROLLER = 23;
/**
 * 捡拾墓碑
 */
const WORK_TRANSPORTER_TOMBSTONE: WORK_TRANSPORTER_TOMBSTONE = 24;
/**
 * 当前Creep正在担任运输者职责，将当前房间的container里多余的矿物带到storage
 */
const WORK_TRANSPORTER_STORAGE_MINERAL: WORK_TRANSPORTER_STORAGE_MINERAL = 25;
/**
 * 当前Creep正在担任运输者职责，将当前房间的container里多余的能量带到storage
 */
const WORK_TRANSPORTER_STORAGE_ENERGY: WORK_TRANSPORTER_STORAGE_ENERGY = 26;


// Room状态码
/**
 * 任务正在等待状态
 */
const TASK_WAITING: TASK_WAITING = 0;
/**
 * 任务已经被某个虫子接受
 */
const TASK_ACCEPTED: TASK_ACCEPTED = 1;

/**
 * 能量计划类型：预计收入
 */
const PLAN_INCOME: PLAN_INCOME = 0;
/**
 * 能量计划类型：预计支出
 */
const PLAN_PAY: PLAN_PAY = 1;

/** container类型：未设定类型 */
const CONTAINER_TYPE_NONE: CONTAINER_TYPE_NONE = 0;
/** container类型：存储供给给upgrader的能量 */
const CONTAINER_TYPE_CONTROLLER: CONTAINER_TYPE_CONTROLLER = 1;
/** container类型：存储source产出 */
const CONTAINER_TYPE_SOURCE: CONTAINER_TYPE_SOURCE = 2;
/** container类型：存储mineral产出 */
const CONTAINER_TYPE_MINERAL: CONTAINER_TYPE_MINERAL = 3;

/** 未设定类型 */
const LINK_TYPE_NONE: LINK_TYPE_NONE = 0;
 /** 临接storage的link */
const LINK_TYPE_STORAGE: LINK_TYPE_STORAGE = 1;
/** 临接controller的link */
const LINK_TYPE_CONTROLLER: LINK_TYPE_CONTROLLER = 2;
/** 临接source的link */
const LINK_TYPE_SOURCE: LINK_TYPE_SOURCE = 3;

// Creep工作模式代码

/** 无指定模式 */
const MODE_NONE: MODE_NONE = -1;

/** 采集能量的采集者 */
const MODE_HARVEST_ENERGY: MODE_HARVEST_ENERGY = 0;
/** 采集矿物的采集者 */
const MODE_HARVEST_MINERAL: MODE_HARVEST_MINERAL = 1;

/**
 * 优先提供孵化器能量的运输者
 */
const MODE_SPAWN: MODE_SPAWN = 0;
/**
 * 优先提供控制器能量的运输者
 */
const MODE_CONTROLLER: MODE_CONTROLLER = 1;
/**
 * 外矿的运输者
 */
const MODE_OUTSIDE: MODE_OUTSIDE = 2;
/**
 * 救灾运输者
 */
const MODE_HELP: MODE_HELP = 9;

/**
 * 优先建筑的builder
 */
const MODE_BUILDER: MODE_BUILDER = 0;
/**
 * 优先修理的builder
 */
const MODE_REPAIRER: MODE_REPAIRER = 1;

// 使用能量的优先级
const PRIORITY_NONE: PRIORITY_NONE = 0;
const PRIORITY_CONTAINER: PRIORITY_CONTAINER = 1;
const PRIORITY_STORAGE: PRIORITY_STORAGE = 2;
