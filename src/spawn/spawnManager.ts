import {
    ENERGY_NEED, ENERGY_ENOUGH,
    WORK_IDLE, WORK_TRANSPORTER_SPAWN, WORK_TRANSPORTER_TOWER, WORK_TRANSPORTER_STORAGE_ENERGY
} from '@/constant';

import { generateBodyParts } from './bodyGenerator';
import { ROOM_1_CONFIG } from './R1_W35N57';
import { ROOM_2_CONFIG } from './R2_W37N55';

const ROOM_SPAWN_CONFIG: Record<string, Map<string, RoleConfig>>= {
    'W35N57': ROOM_1_CONFIG,  // 第一个房间
    'W37N55': ROOM_2_CONFIG,  // 第二个房间
}

type LivedCreeps = Record<string, number[]>;


const OTHER_ROLE_CONFIG = new Map([
    // 救灾
    ['Rescue', { body: null, amount: 1, memory: {r:'运输', mode: 0} }],     // W35N57 救灾机器人
]);


/**
 * RCL1
 */

/**
 * 孵化情况检查管理模块
 */
export const SpawnManager = {
    run: function(): void{
        const lived_creeps = this.countLivedCreeps();
        for (const room_name in ROOM_SPAWN_CONFIG){
            this.respawnByRoom(room_name, lived_creeps);
        }
    },

    /**
     * 检查现有的creep生存情况
     *
     * @returns 按basename为索引的，值为该basename中所有存活的index编号
     */
    countLivedCreeps: function(){
        const lived_creeps: LivedCreeps = {};
        for (const name in Game.creeps){
            const creep = Game.creeps[name];
            const base_name = creep.getBaseName();
            if (base_name == '未知'){
                continue;
            }

            // 初始化base_name的计数器
            lived_creeps[base_name] = lived_creeps[base_name] || [];

            // 统计各base_name的creep的index
            lived_creeps[base_name].push(creep.getIndex());
        }
        return lived_creeps;
    },

    /**
     * 按房间检测是否需要重生
     * @param room_name 房间名称
     * @param lived_creeps 当前存活的creeps情况
     * @returns
     */
    respawnByRoom: function (room_name: string, lived_creeps: LivedCreeps){
        const spawns = Game.rooms[room_name].getMySpawns();
        if (spawns.length == 0){
            console.log(`房间${room_name}没有找到Spawn`);
            return;
        }

        for (const [base_name, config] of ROOM_SPAWN_CONFIG[room_name]){
            config.basename = base_name;
            if (config.body_code){
                config.body = generateBodyParts(config.body_code);
            }

            // 该basename的creeps存活数量
            const config_all = lived_creeps[base_name] || [];
            const config_valid_creeps = this.verifyCreeps(config, lived_creeps);

            if (config_valid_creeps.length >= config_all.length){
                continue;
            }

            // basename数量不足时进行刷新

            // if (base_name == 'ENG'){
            //     if (Game.flags['eng1'].room){
            //         const controller = Game.flags['eng1'].room!.controller!
            //         if (!controller.my && controller.upgradeBlocked && controller.upgradeBlocked > 100){
            //             continue;
            //         }
            //     }else{
            //         continue;
            //     }
            // }
            // const role_all = all_creeps[base_name] || []
            // const role_valid = valid_creeps[base_name] || []

            // const count = role_valid.length || 0;
            // if (count >= config.amount){
            //     continue;
            // }
            // const max = config.aheadTime ? config.amount + 1 : config.amount
            // for (let index=1;index<=max;index++){
            //     if (role_all.indexOf(index) == -1){
            //         return this.spawnCreep(spawn, config, index);
            //     }
            // }
        }

        // if (spawn.spawning){
        //     return;
        // }
        // // 如果房间中没有活着的spawn了，那么启用救灾流程
        // if (spawn.room.find(FIND_MY_CREEPS).length == 0){
        //     this.selfRescue(spawn);
        //     return;
        // }

    },

    verifyCreeps: function(config: RoleConfig, lived_creeps: LivedCreeps): number[] {
        const base_name = config.basename!;
        const valid_creeps: number[] = [];
        if (base_name in lived_creeps){
            if (config.named){
                if (base_name in Game.creeps){
                    valid_creeps.push(0);
                }
            }else{
                for (const index of lived_creeps[base_name]){
                    const creep = Game.creeps[base_name+index];
                    if (this.isValidCreep(creep, config)){
                        valid_creeps.push(creep.getIndex());
                    }
                }
            }
        }
        return valid_creeps;
    },

    /**
     * 判断当前creep是否还视为存活
     * @param creep 用于判断的creep
     * @param config 用于判断的config
     * @returns true表示视为存活，false表示不存活（会进行respawn）
     */
    isValidCreep: function (creep: Creep, config: RoleConfig) {
        // 没定义任何重生条件的creep，死了以后再孵化下一个
        if (config.liveCondition == undefined){
            return true;
        }
        if (config.liveCondition.advanceTime){
            const advance_tick = config.body!.length * 3 + config.liveCondition.advanceTime;
            if (!creep.ticksToLive || creep.ticksToLive <= advance_tick){
                return false;
            }
        }
        return true;
    },

    roomCheck: function(spawn: StructureSpawn, room_spawn_config: Map<string, RoleConfig>){
        const all_creeps = {} as Record<string, any>;
        const valid_creeps = {} as Record<string, any>;
        for (const name in Game.creeps){
            const creep = Game.creeps[name];
            const m = creep.getBaseName();
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
}
