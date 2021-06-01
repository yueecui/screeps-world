import {
    ENERGY_NEED, ENERGY_ENOUGH,
    WORK_IDLE, WORK_TRANSPORTER_SPAWN, WORK_TRANSPORTER_TOWER, WORK_TRANSPORTER_STORAGE_ENERGY
} from '@/constant';


import { ACTIVE_ROLE_CONFIG } from './R1_W35N57';
import { R2_CREEP_CONFIG } from './R2_W37N55';

const ROOM_SPAWN_CONFIG: Record<string, Map<string, RoleConfig>>= {
    'W35N57': ACTIVE_ROLE_CONFIG,  // 第一个房间
    'W37N55': R2_CREEP_CONFIG,  // 第二个房间
}


const OTHER_ROLE_CONFIG = new Map([
    // 救灾
    ['Rescue', { body: null, amount: 1, memory: {r:'运输', mode: 0} }],     // W35N57 救灾机器人
]);


export const ManagerCreeps: Record<string, any> = {
    check: function() {
        for (const room_name in ROOM_SPAWN_CONFIG){
            // 暂时先就找一个
            const spawn = _.find(Game.spawns, (spawn) => { return spawn.room.name == room_name; });
            if (spawn == undefined){
                console.log(`房间${room_name}没有找到Spawn`);
                continue;
            }
            if (spawn.spawning){
                continue;
            }
            if (spawn.room.find(FIND_MY_CREEPS).length == 0){
                this.selfRescue(spawn);
                continue;
            }
            this.roomCheck(spawn, ROOM_SPAWN_CONFIG[room_name]);
        }


    },

    roomCheck: function(spawn: StructureSpawn, room_spawn_config: Map<string, RoleConfig>){
        const all_creeps = {} as Record<string, any>;
        const valid_creeps = {} as Record<string, any>;
        for (const name in Game.creeps){
            const creep = Game.creeps[name];
            const m = creep.getBasename();
            if (m != 'unknown'){
                all_creeps[m] = all_creeps[m] || [];
                valid_creeps[m] = valid_creeps[m] || [];
                all_creeps[m].push(creep.getIndex());

                const config = room_spawn_config.get(m);
                if (!(config && config.aheadTime && creep.ticksToLive! <= config.aheadTime)){
                    valid_creeps[m].push(creep.getIndex());
                }
            }
        }

        for (const [basename,config] of room_spawn_config){
            config.basename = basename;
            if (basename == 'ENG'){
                if (Game.flags['eng1'].room){
                    const controller = Game.flags['eng1'].room!.controller!
                    if (!controller.my && controller.upgradeBlocked && controller.upgradeBlocked > 100){
                        continue;
                    }
                }else{
                    continue;
                }
            }
            const role_all = all_creeps[basename] || []
            const role_valid = valid_creeps[basename] || []

            const count = role_valid.length || 0;
            if (count >= config.amount){
                continue;
            }
            const max = config.aheadTime ? config.amount + 1 : config.amount
            for (let index=1;index<=max;index++){
                if (role_all.indexOf(index) == -1){
                    return this.spawnCreep(spawn, config, index);
                }
            }
        }
    },

    spawnCreep: function(spawn: StructureSpawn, config: Record<string, any>, index: number){
        const memory = JSON.parse(JSON.stringify(config.memory));
        if (config.body.indexOf(CARRY) > -1){
            memory.e = ENERGY_NEED;
        }
        memory.w = WORK_IDLE;
        const result = spawn.spawnCreep(config.body, config.basename+index, {memory: memory}); //, directions: [RIGHT], TOP_RIGHT, BOTTOM_RIGHT, TOP, TOP_LEFT
        console.log(spawn.name, ':',result);
        if (result == OK){
            spawn.room.memory.lastSpawnTime = Game.time;
        }
    },

    selfRescue: function (spawn: StructureSpawn) {
        const config_name = 'Rescue'
        const room = spawn.room;
        if (room.energyAvailable >= 300){
            const config = JSON.parse(JSON.stringify(OTHER_ROLE_CONFIG.get(config_name)));
            config.basename = config_name;
            config.body = [];
            for (let i=0;i<Math.floor(room.energyAvailable/150);i++){
                config.body.push(...[CARRY, CARRY, MOVE]);
            }
            this.spawnCreep(spawn, config, 1);
        }
    },
};
