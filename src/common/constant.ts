export const FALSE: FALSE = 0;
export const TRUE: TRUE = 1;

// 运输任务类型
export const TASK_NORMAL_SPAWN_ENERGY: TASK_NORMAL_SPAWN_ENERGY = 1
export const TASK_HARU_SPAWN_ENERGY: TASK_HARU_SPAWN_ENERGY = 2
export const TASK_CONTROLLER_ENERGY: TASK_CONTROLLER_ENERGY = 3
export const TASK_TOWER_ENERGY: TASK_TOWER_ENERGY = 4
export const TASK_LAB_ENERGY: TASK_LAB_ENERGY = 5
export const TASK_STORE_SOURCE: TASK_STORE_SOURCE = 11
export const TASK_STORE_MINERAL: TASK_STORE_MINERAL = 12
export const TASK_RECYCLE_TOMBSTONE: TASK_RECYCLE_TOMBSTONE = 41
export const TASK_RECYCLE_RUIN: TASK_RECYCLE_RUIN = 42

// 运输优先级
export const TASK_PRIORITY_LOW: TASK_PRIORITY_LOW = 1
export const TASK_PRIORITY_MEDIUM: TASK_PRIORITY_MEDIUM = 2
export const TASK_PRIORITY_HIGH: TASK_PRIORITY_HIGH = 3

export const TASK_PRIORITY_LOW_NAME: TASK_PRIORITY_LOW_NAME = 'low'
export const TASK_PRIORITY_MEDIUM_NAME: TASK_PRIORITY_MEDIUM_NAME = 'medium'
export const TASK_PRIORITY_HIGH_NAME: TASK_PRIORITY_HIGH_NAME = 'high'

// 运输状态
export const TASK_STATUS_INIT: TASK_STATUS_INIT = 0
export const TASK_STATUS_ORDER: TASK_STATUS_ORDER = 1
export const TASK_STATUS_OBTAIN: TASK_STATUS_OBTAIN = 2
export const TASK_STATUS_DELIVER: TASK_STATUS_DELIVER = 3


// Creep的角色名

export const ROLE_GOTO_RECYCLE: ROLE_GOTO_RECYCLE = '回收';
export const ROLE_MANUAL: ROLE_MANUAL = '手动';

export const ROLE_HARVESTER: ROLE_HARVESTER = '采集';
export const ROLE_TRANSPORTER: ROLE_TRANSPORTER = '运输';
export const ROLE_BUILDER: ROLE_BUILDER = '建造';
export const ROLE_UPGRADER: ROLE_UPGRADER = '升级';
export const ROLE_MASTERMIND: ROLE_MASTERMIND = '主脑';

export const ROLE_SCOUT: ROLE_SCOUT = '斥候';
export const ROLE_ENGINEER: ROLE_ENGINEER = '工兵';
export const ROLE_ATTACKER: ROLE_ATTACKER = '攻击';

/** 房间内工蚁 */
export const SPAWN_TYPE_IN_ROOM: SPAWN_TYPE_IN_ROOM = 1;
/** 房间外工蚁 */
export const SPAWN_TYPE_OUTSIDE: SPAWN_TYPE_OUTSIDE = 2;

// Creep工作进程的状态码

/**
 * 当前Creep需要补充能量
 */
export const ENERGY_NEED: ENERGY_NEED = 0;
/**
 * 当前Creep的能量足够，不需要补充
 */
export const ENERGY_ENOUGH: ENERGY_ENOUGH = 1;


/**
 * 当前Creep正在空闲，等待新的指令
 */
export const WORK_IDLE: WORK_IDLE = 0;
/**
 * 当前Creep正在前往工作场所
 */
export const WORK_MOVE: WORK_MOVE = 1;
/**
 * 单一模式正常工作的蚂蚁
 */
export const WORK_NORMAL: WORK_NORMAL = 2;


/**
 * 当前Creep正在进行采集
 */
 export const WORK_HARVEST: WORK_HARVEST = 11;

 /**
  * 当前Creep正在升级控制器
  */
 export const WORK_UPGRADE: WORK_UPGRADE = 12;
 /**
  * 当前Creep正在进行建造
  */
 export const WORK_BUILD: WORK_BUILD = 13;
 /**
  * 当前Creep正在进行修理
  */
 export const WORK_REPAIR: WORK_REPAIR = 14;
// 运输类工作
/**
 * 当前Creep正在担任运输者职责，补充母巢或是扩展的能量
 */
export const WORK_TRANSPORTER_SPAWN: WORK_TRANSPORTER_SPAWN = 21;
/**
 * 当前Creep正在担任运输者职责，补充塔的能量
 */
export const WORK_TRANSPORTER_TOWER: WORK_TRANSPORTER_TOWER = 22;
/**
 * 当前Creep正在担任运输者职责，为控制器container补充能量
 */
export const WORK_TRANSPORTER_CONTROLLER: WORK_TRANSPORTER_CONTROLLER = 23;
/**
 * 捡拾墓碑
 */
export const WORK_TRANSPORTER_TOMBSTONE: WORK_TRANSPORTER_TOMBSTONE = 24;
/**
 * 当前Creep正在担任运输者职责，将当前房间的container里多余的矿物带到storage
 */
export const WORK_TRANSPORTER_STORAGE_MINERAL: WORK_TRANSPORTER_STORAGE_MINERAL = 25;
/**
 * 当前Creep正在担任运输者职责，将当前房间的container里多余的能量带到storage
 */
export const WORK_TRANSPORTER_STORAGE_ENERGY: WORK_TRANSPORTER_STORAGE_ENERGY = 26;


// Room状态码
/**
 * 任务正在等待状态
 */
export const TASK_WAITING: TASK_WAITING = 0;
/**
 * 任务已经被某个虫子接受
 */
export const TASK_ACCEPTED: TASK_ACCEPTED = 1;

/**
 * 能量计划类型：预计收入
 */
export const PLAN_INCOME: PLAN_INCOME = 0;
/**
 * 能量计划类型：预计支出
 */
export const PLAN_PAY: PLAN_PAY = 1;

/** container类型：未设定类型 */
export const CONTAINER_TYPE_NONE: CONTAINER_TYPE_NONE = 0;
/** container类型：存储供给给upgrader的能量 */
export const CONTAINER_TYPE_CONTROLLER: CONTAINER_TYPE_CONTROLLER = 1;
/** container类型：存储source产出 */
export const CONTAINER_TYPE_SOURCE: CONTAINER_TYPE_SOURCE = 2;
/** container类型：存储mineral产出 */
export const CONTAINER_TYPE_MINERAL: CONTAINER_TYPE_MINERAL = 3;

/** 未设定类型 */
export const LINK_TYPE_NONE: LINK_TYPE_NONE = 0;
 /** 临接storage的link */
export const LINK_TYPE_STORAGE: LINK_TYPE_STORAGE = 1;
/** 临接controller的link */
export const LINK_TYPE_CONTROLLER: LINK_TYPE_CONTROLLER = 2;
/** 临接source的link */
export const LINK_TYPE_SOURCE: LINK_TYPE_SOURCE = 3;

// Creep工作模式代码

/** 无指定模式 */
export const MODE_NONE: MODE_NONE = -1;

/** 采集能量的采集者 */
export const MODE_HARVEST_ENERGY: MODE_HARVEST_ENERGY = 0;
/** 采集矿物的采集者 */
export const MODE_HARVEST_MINERAL: MODE_HARVEST_MINERAL = 1;

/**
 * 优先提供孵化器能量的运输者
 */
export const MODE_SPAWN: MODE_SPAWN = 0;
/**
 * 优先提供控制器能量的运输者
 */
export const MODE_CONTROLLER: MODE_CONTROLLER = 1;
/**
 * 外矿的运输者
 */
export const MODE_OUTSIDE: MODE_OUTSIDE = 2;
/**
 * 救灾运输者
 */
export const MODE_HELP: MODE_HELP = 9;

/**
 * 优先建筑的builder
 */
export const MODE_BUILDER: MODE_BUILDER = 0;
/**
 * 优先修理的builder
 */
export const MODE_REPAIRER: MODE_REPAIRER = 1;


export const PRIORITY_NONE: PRIORITY_NONE = 0;
export const PRIORITY_CONTAINER: PRIORITY_CONTAINER = 1;
export const PRIORITY_STORAGE: PRIORITY_STORAGE = 2;
