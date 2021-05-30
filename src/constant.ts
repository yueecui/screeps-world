// Creep的角色名

export const ROLE_HARVESTER: ROLE_HARVESTER = '采集';
export const ROLE_TRANSPORTER: ROLE_TRANSPORTER = '运输';
export const ROLE_BUILDER: ROLE_BUILDER = '建造';
export const ROLE_UPGRADER: ROLE_UPGRADER = '升级';
export const ROLE_ATTACKER: ROLE_ATTACKER = '攻击';


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
export const WORK_GOTO: WORK_GOTO = -1;
// 运输类工作

/**
 * 当前Creep正在担任运输者职责，补充母巢或是扩展的能量
 */
export const WORK_TRANSPORTER_SPAWN: WORK_TRANSPORTER_SPAWN = 1;
/**
 * 当前Creep正在担任运输者职责，补充塔的能量
 */
export const WORK_TRANSPORTER_TOWER: WORK_TRANSPORTER_TOWER = 2;
/**
 * 当前Creep正在担任运输者职责，为控制器container补充能量
 */
export const WORK_TRANSPORTER_CONTROLLER: WORK_TRANSPORTER_CONTROLLER = 3;
/**
 * 当前Creep正在担任运输者职责，将当前房间的container里多余的能量带到storage
 */
export const WORK_TRANSPORTER_STORAGE: WORK_TRANSPORTER_STORAGE = 10;
/**
 * 当前Creep正在进行采集
 */
export const WORK_HARVEST_ENERGY: WORK_HARVEST_ENERGY = 21;
/**
 * 当前Creep正在进行采集
 */
 export const WORK_HARVEST_MINERAL: WORK_HARVEST_MINERAL = 22;
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

/**
 * container类型：存储source产出
 *
 * 存量变多后会转移到storage
 */
export const CONTAINER_TYPE_SOURCE: CONTAINER_TYPE_SOURCE = 0;
/**
 * container类型：存储供给给upgrader的能量
 */
export const CONTAINER_TYPE_CONTROLLER: CONTAINER_TYPE_CONTROLLER = 1;


// Creep工作模式代码

/**
 * 无指定模式
 */
 export const MODE_NONE: MODE_NONE = -1;

/**
 * 优先提供孵化器能量的运输者
 */
export const MODE_HARVEST_ENERGY: MODE_HARVEST_ENERGY = 0;
/**
 * 优先提供控制器能量的运输者
 */
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
