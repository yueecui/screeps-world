export const RoleNameHarvester: RoleNameHarvester = '采集';
export const RoleNameTransporter: RoleNameTransporter = '运输';
export const RoleNameBuilder: RoleNameBuilder = '建造';
export const RoleNameUpgrader: RoleNameUpgrader = '升级';

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
