// Creep的角色名

export const RoleNameHarvester: RoleNameHarvester = '采集';
export const RoleNameTransporter: RoleNameTransporter = '运输';
export const RoleNameBuilder: RoleNameBuilder = '建造';
export const RoleNameUpgrader: RoleNameUpgrader = '升级';


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
 * 当前Creep正在担任运输者职责，将当前房间的container里多余的能量带到storage
 */
export const WORK_TRANSPORTER_STORAGE: WORK_TRANSPORTER_STORAGE = 10;
/**
 * 当前Creep正在进行采集
 */
export const WORK_HARVESTER: WORK_HARVESTER = 11;


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
