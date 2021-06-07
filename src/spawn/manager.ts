import {
    SPAWN_TYPE_IN_ROOM, SPAWN_TYPE_OUTSIDE,
    ENERGY_NEED, WORK_IDLE
} from '@/constant';

import { SPAWN_BASE_PRIORITY_HIGH, SPAWN_BASE_PRIORITY_MID, SPAWN_BASE_PRIORITY_LOW } from './configBase'
import { SPAWN_OUTSIDE_PRIORITY_HIGH, SPAWN_OUTSIDE_PRIORITY_LOW } from './configOutside'

type LivedCreeps = Record<string, number[]>;

/**
 * 孵化情况检查管理模块
 */
export const SpawnManager = {
    run: function(): void{
        const all_lived_creeps = this.countLivedCreeps();

        for (const room_name in Game.rooms){
            const room = Game.rooms[room_name];
            if (room.controller && room.controller.my){
                if (room.spawns.length == 0){
                    console.log(`房间[${room.name}]没有找到Spawn`);
                    continue;
                }
                this.checkSpawn(room, all_lived_creeps);
            }
        }
    },

    /**
     * 检查现有的工蚁生存情况，不包括named
     *
     * @returns 按room_code为索引，对应值是按basename为索引的，值为该basename中所有存活的index编号
     */
    countLivedCreeps: function(){
        const lived_creeps: Record<string, LivedCreeps> = {};
        for (const name in Game.creeps){
            const creep = Game.creeps[name];
            if (creep.named) continue;

            const room_code = creep.roomCode;
            const base_name = creep.baseName;

            if (!(room_code in lived_creeps)) lived_creeps[room_code] = {}
            if (!(base_name in lived_creeps[room_code])) lived_creeps[room_code][base_name] = [];

            // 统计各base_name的creep的index
            lived_creeps[room_code][base_name].push(creep.index);
        }
        return lived_creeps;
    },

    /**
     * 按房间检测是否需要重生
     * @param room 房间名称
     * @param all_lived_creeps 当前存活的creeps情况
     * @returns 是否成功生成
     */
    checkSpawn: function (room: Room, all_lived_creeps: Record<string, LivedCreeps>){
        // 检查本房间高优先级蚂蚁
        if (this.checkSpawnBase(room, all_lived_creeps[room.code], SPAWN_BASE_PRIORITY_HIGH)) return;
        // 检查本房间相关外矿的高优先级
        for (const outside_room_name of room.memory.config.outside){
            if (this.checkSpawnOutside(room, all_lived_creeps, outside_room_name, SPAWN_OUTSIDE_PRIORITY_HIGH)) return;
        }
        // 检查本房间中优先级蚂蚁
        if (this.checkSpawnBase(room, all_lived_creeps[room.code], SPAWN_BASE_PRIORITY_MID)) return;
        // 检查本房间相关外矿的低优先级
        for (const outside_room_name of room.memory.config.outside){
            if (this.checkSpawnOutside(room, all_lived_creeps, outside_room_name, SPAWN_OUTSIDE_PRIORITY_LOW)) return;
        }
        // 检查本房间低优先级蚂蚁
        if (this.checkSpawnBase(room, all_lived_creeps[room.code], SPAWN_BASE_PRIORITY_LOW)) return;
    },

    checkSpawnBase: function(room: Room, lived_creeps: LivedCreeps, spawn_config : Map<string, SpawnConfig>) {
        for (const [base_name, config] of spawn_config){
            // 该basename的creeps存活数量
            const config_all = lived_creeps[base_name] || [];
            const config_valid_creeps = this.verifyCreeps(room, room.code, config, lived_creeps);

            const amount = config.amount(room);

            if (config_valid_creeps.length >= amount) continue;
            if (!config.needSpawn(room)) continue;

            // basename数量不足时进行刷新
            const max = config.advance ? amount + 1 : amount

            for (let index=1;index<=max;index++){
                if (config_all.indexOf(index) == -1){
                    this.spawnCreep(room, room.name, config, index);
                    return true;
                }
            }
        }
        return false;
    },

    /** 外矿用的 */
    checkSpawnOutside: function(spawn_room: Room, all_lived_creeps: Record<string, LivedCreeps>, work_room_name: string, spawn_config : Map<string, SpawnConfig>) {
        const work_room_code = this.getRoomCode(work_room_name);
        if (work_room_code == null){
            console.log(`[${spawn_room.name}]配置的外矿[${work_room_name}]在Memory没有找到数据`);
            return false;
        }
        const code_lived_creeps = all_lived_creeps[work_room_code];

        for (const [base_name, config] of spawn_config){
            // 该basename的creeps存活数量
            const config_all = code_lived_creeps[base_name] || [];
            const config_valid_creeps = this.verifyCreeps(spawn_room, work_room_code, config, code_lived_creeps);

            const amount = config.amount(spawn_room);

            if (config_valid_creeps.length >= amount) continue;
            if (!config.needSpawn(spawn_room, work_room_name)) continue;

            // basename数量不足时进行刷新
            const max = config.advance ? amount + 1 : amount

            for (let index=1;index<=max;index++){
                if (config_all.indexOf(index) == -1){
                    this.spawnCreep(spawn_room, work_room_name, config, index);
                    return true;
                }
            }
        }
        return false;
    },

    getRoomCode: function(room_name: string) {
        if (Memory.rooms[room_name] && Memory.rooms[room_name].config){
            return Memory.rooms[room_name].config.code;
        }else{
            return null
        }
    },

    /**
     * 检查creep的有效性
     * @param room spawn所在的room对象
     * @param code creep的前缀code
     * @param config spawn config
     * @param lived_creeps
     * @returns 该code + basename的creep被判为有效存活的index列表
     */
    verifyCreeps: function(room: Room, code: string, config: SpawnConfig, lived_creeps: LivedCreeps): number[] {
        let base_name = config.baseName;

        const valid_creeps: number[] = [];
        // 只包括按规则生成的，不包括named
        for (const index of (lived_creeps[base_name] || [])){
            const name = `${code}-${config.baseName}${index}`;
            const creep = Game.creeps[name];
            if (this.isValidCreep(room, code, config, creep)){
                valid_creeps.push(creep.index);
            }
        }
        return valid_creeps;
    },

    /**
     * 判断当前creep是否还视为存活
     * @param room spawn所在的room对象
     * @param code creep的前缀code
     * @param config spawn config
     * @param creep 用于判断的creep
     * @returns true表示视为存活，false表示不存活（会进行respawn）
     */
    isValidCreep: function (room: Room, code: string, config: SpawnConfig, creep: Creep) {
        if (config.advance){
            const advance_tick = config.body(room).length * 3 + room.getSpawnAdvanceTime(config.baseName);
            if (!creep.ticksToLive || creep.ticksToLive <= advance_tick){
                return false;
            }
        }
        return config.isLive(room, creep);
    },

    spawnCreep: function(spawn_room: Room, work_room_name: string, config: SpawnConfig, index: number){
        const new_name = `${this.getRoomCode(work_room_name)}-${config.baseName}${index}`;
        const body = config.body(spawn_room);

        const memory = JSON.parse(JSON.stringify(config.memory(spawn_room, work_room_name)));

        if (body.indexOf(CARRY) > -1){
            memory.energy = ENERGY_NEED;
        }
        if (body.indexOf(WORK) > -1){
            memory.work = WORK_IDLE;
        }

        const spawn = spawn_room.spawns.filter((spawn) => {
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
