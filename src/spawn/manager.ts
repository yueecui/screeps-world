import {
    ENERGY_NEED, WORK_IDLE
} from '@/constant';

import { SPAWN_CONFIG_PRIORITY_HIGH, SPAWN_CONFIG_PRIORITY_MID, SPAWN_CONFIG_PRIORITY_LOW } from './configBase'

type LivedCreeps = Record<string, number[]>;


const OTHER_ROLE_CONFIG = new Map([
    // 救灾
    ['Rescue', { body: null, amount: 1, memory: {r:'运输', mode: 0} }],     // W35N57 救灾机器人
]);


/**
 * 孵化情况检查管理模块
 */
export const SpawnManager = {
    run: function(): void{
        const all_room_lived_creeps = this.countLivedCreeps();

        for (const room_name in Game.rooms){
            const room = Game.rooms[room_name];
            if (room.controller && room.controller.my){
                this.checkSpawnByRoom(room, all_room_lived_creeps[room_name]);
            }
        }
    },

    /**
     * 检查现有的creep生存情况
     *
     * @returns 按room_name为索引，对应值是按basename为索引的，值为该basename中所有存活的index编号
     */
    countLivedCreeps: function(){
        const lived_creeps: Record<string, LivedCreeps> = {};
        for (const name in Game.creeps){
            const creep = Game.creeps[name];
            if (creep.named) continue;

            const room_name = creep.bornRoom;
            const base_name = creep.baseName;

            if (!(room_name in lived_creeps)) lived_creeps[room_name] = {}
            if (!(base_name in lived_creeps[room_name])) lived_creeps[room_name][base_name] = [];

            // 统计各base_name的creep的index
            lived_creeps[room_name][base_name].push(creep.index);
        }
        return lived_creeps;
    },

    /**
     * 按房间检测是否需要重生
     * @param room 房间名称
     * @param lived_creeps 当前存活的creeps情况
     * @returns
     */
    checkSpawnByRoom: function (room: Room, lived_creeps: LivedCreeps){
        const spawns = room.spawns;
        if (spawns.length == 0){
            console.log(`房间[${room.name}]没有找到Spawn`);
            return;
        }

        // 检查房间必要蚂蚁
        for (const spawn_config of [SPAWN_CONFIG_PRIORITY_HIGH, SPAWN_CONFIG_PRIORITY_MID, SPAWN_CONFIG_PRIORITY_LOW]){
            for (const [base_name, config] of spawn_config){
                // 该basename的creeps存活数量
                const config_all = lived_creeps[base_name] || [];
                const config_valid_creeps = this.verifyCreeps(room, config, lived_creeps);

                const amount = config.amount(room);

                if (config_valid_creeps.length >= amount) continue;
                if (!config.needSpawn(room)) continue;

                // basename数量不足时进行刷新
                const max = config.advance ? amount + 1 : amount

                for (let index=1;index<=max;index++){
                    if (config_all.indexOf(index) == -1){
                        this.spawnCreep(room, config, index);
                        return;
                    }
                }
            }
        }
    },

    verifyCreeps: function(room: Room, config: SpawnConfig, lived_creeps: LivedCreeps): number[] {
        const base_name = config.baseName!;
        const valid_creeps: number[] = [];
        // 只包括按规则生成的，不包括named
        for (const index of (lived_creeps[base_name] || [])){
            const creep = Game.creeps[`${room.code}-${base_name}${index}`];
            if (this.isValidCreep(room, config, creep)){
                valid_creeps.push(creep.index);
            }
        }
        return valid_creeps;
    },

    /**
     * 判断当前creep是否还视为存活
     * @param room spawn所在的room对象
     * @param config spawn config
     * @param creep 用于判断的creep
     * @returns true表示视为存活，false表示不存活（会进行respawn）
     */
    isValidCreep: function (room: Room, config: SpawnConfig, creep: Creep) {
        if (config.advance){
            const advance_tick = config.body(room).length * 3 + room.getSpawnAdvanceTime(config.baseName);
            if (!creep.ticksToLive || creep.ticksToLive <= advance_tick){
                return false;
            }
        }
        return config.isLive(room, creep);
    },

    spawnCreep: function(room: Room, config: SpawnConfig, index: number){
        const new_name = `${room.code}-${config.baseName}${index}`;
        const body = config.body(room);

        const memory = JSON.parse(JSON.stringify(config.memory));

        if (body.indexOf(CARRY) > -1){
            memory.energy = ENERGY_NEED;
        }
        memory.work = WORK_IDLE;

        const spawn = room.spawns.filter((spawn) => {
            return spawn.spawning != null;
        })[0];
        const result = spawn.spawnCreep(body, new_name, {memory: memory});
        switch(result){
            case OK:
                spawn.room.memory.lastSpawnTime = Game.time;
                break;
            case ERR_NAME_EXISTS:
                console.log(`${spawn.name}: ${new_name}已存在`);
                break;
            case ERR_INVALID_ARGS:
                console.log(`${spawn.name}: ${new_name}的身体代码不正确`);
                break;
        }
    },
}
