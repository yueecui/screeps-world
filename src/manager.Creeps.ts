import {
  ENERGY_NEED, ENERGY_ENOUGH,
  WORK_IDLE, WORK_TRANSPORTER_SPAWN, WORK_TRANSPORTER_TOWER, WORK_TRANSPORTER_STORAGE
} from '@/constant';

const BODY_CONFIG: Record<string, BodyConfig> = {
  'WORKER_BASE': [WORK, CARRY, MOVE],  // 300，道路上1tick，平原上2tick
  'WORKER_HELP': [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE], // 救灾机器人

  // RCL 2可用
  'WORKER_R2': [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE],  // WORK*4 + CARRY*2 + MOVE*1 = 550 用于挖资源
  'CARRYER_R2': [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], // CARRY*6 + MOVE*3 = 450，储量300  用于搬运资源
  'BUILDER_R2': [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], // WORK*2 + CARRY*4 + MOVE*3 = 550，道路上1tick，平原上2tick  用于建造建筑物

  // RCL 3可用
  'WORKER_R3': [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE],  // WORK*6 + CARRY*2 + MOVE*2 = 800 用于挖资源
  'CARRYER_R3': ["carry","carry","carry","carry","carry","carry","carry","carry","carry","carry",
          "move","move","move","move","move"], // CARRY*10 + MOVE*5 = 750 储量500 用于搬运资源
  'WORKER_R3B': [WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE],  // WORK*7 + CARRY*1 + MOVE*1 = 800 原地挖资源  7个WORK已经可以挖完3000的矿点
  'BUILDER_R3': [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], // WORK*4 + CARRY*4 + MOVE*4 = 800

  // RCL 4可用
  '采集者R4': [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
              WORK, CARRY, MOVE, MOVE, MOVE],  // WORK*11 + CARRY*1 + MOVE*3 = 1300
  '升级者R4': [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
              CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],  // WORK*10 + CARRY*2 + MOVE*4 = 1300
}

// key值：型号名称，生成的creep会用型号+序号的形式自动取名
// body body组成数组
// amount 至少维持的数量
// aheadTime 如果有生命时间少于aheadTime的，提前<aheadTime>值tick，生成下一个，以免断档
// : Map<string, RoleConfig>
const ACTIVE_ROLE_CONFIG = new Map([
  // 收集者
  ['TR', { basename:'',body: BODY_CONFIG['CARRYER_R3'], amount: 1, aheadTime: 80, memory: {r:'运输', e: 0} }],   // W35N57 将各个节点额外的能量搬运到Storage
  ['GA-B', { body: BODY_CONFIG['采集者R4'], amount: 1, aheadTime: 80, memory: {r:'采集', node:1} }],  // W35N57 下方矿点采集
  ['GA-A', { body: BODY_CONFIG['采集者R4'], amount: 1, aheadTime: 80, memory: {r:'采集', node:0} }],  // W35N57 下方矿点采集
  // 建造者
  // ['BD-B', { body: BODY_CONFIG['BUILDER_R3'], amount: 1, memory: {r:'建造', mode:0} }],  // 建造优先
  ['BD-R', { body: BODY_CONFIG['BUILDER_R3'], amount: 1, memory: {r:'建造', mode:1} }],  // 修理优先
  ['UP-A', { body: BODY_CONFIG['升级者R4'], amount: 3, memory: {r:'升级'} }],
]);

const OTHER_ROLE_CONFIG = new Map([
  // 救灾
  ['Rescue', { body: null, amount: 1, memory: {r:'运输', e: 0} }],   // W35N57 救灾机器人
]);


export const ManagerCreeps: Record<string, any> = {
  check: function() {
    if (Game.spawns['Spawn1'].spawning){
      return ERR_BUSY;
    }
    if (Game.spawns['Spawn1'].room.find(FIND_MY_CREEPS).length == 0){
      return this.selfRescue();
    }

    const all_creeps = {} as Record<string, any>;
    const valid_creeps = {} as Record<string, any>;
    for (const name in Game.creeps){
      const creep = Game.creeps[name];
      const m = creep.getBasename();
      if (m != 'unknown'){
        all_creeps[m] = all_creeps[m] || [];
        valid_creeps[m] = valid_creeps[m] || [];
        all_creeps[m].push(creep.getIndex());

        const config = ACTIVE_ROLE_CONFIG.get(m);
        if (!(config && config.aheadTime && creep.ticksToLive! <= config.aheadTime)){
          valid_creeps[m].push(creep.getIndex());
        }
      }
    }

    for (const [basename,config] of ACTIVE_ROLE_CONFIG){
      config.basename = basename;
      const role_all = all_creeps[basename] || []
      const role_valid = valid_creeps[basename] || []

      const count = role_valid.length || 0;
      if (count >= config.amount){
        continue;
      }
      const max = config.aheadTime ? config.amount + 1 : config.amount
      for (let index=1;index<=max;index++){
        if (role_all.indexOf(index) == -1){
          return this.spawnCreep(config, index);
        }
      }
    }
  },

  spawnCreep: function(config: Record<string, any>, index: number){
    const memory = JSON.parse(JSON.stringify(config.memory));
    if (config.body.indexOf(CARRY) > -1){
      memory.e = ENERGY_NEED;
    }
    memory.w = WORK_IDLE;
    const result = Game.spawns['Spawn1'].spawnCreep(config.body, config.basename+index, {memory: memory, directions: [RIGHT]}); //, TOP_RIGHT, BOTTOM_RIGHT, TOP, TOP_LEFT
    if (result == OK){
      Game.spawns['Spawn1'].room.memory.lastSpawnTime = Game.time;
    }
    return result;
  },

  selfRescue: function () {
    const config_name = 'Rescue'
    const room = Game.spawns['Spawn1'].room;
    if (room.energyAvailable < 300){
      return ERR_NOT_ENOUGH_ENERGY;
    }
    const config = JSON.parse(JSON.stringify(OTHER_ROLE_CONFIG.get(config_name)));
    config.basename = config_name;
    config.body = [];
    for (let i=0;i<Math.floor(room.energyAvailable/150);i++){
      config.body.push(...[CARRY, CARRY, MOVE]);
    }
    return this.spawnCreep(config, 1);
  },
};
