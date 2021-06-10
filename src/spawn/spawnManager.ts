import {
    SPAWN_TYPE_IN_ROOM, SPAWN_TYPE_OUTSIDE,
    ENERGY_NEED, WORK_IDLE
} from '@/global/constant';

import { SPAWN_BASE_PRIORITY_HIGH, SPAWN_BASE_PRIORITY_MID, SPAWN_BASE_PRIORITY_LOW } from './configBase'
import { SPAWN_OUTSIDE_PRIORITY_HIGH, SPAWN_OUTSIDE_PRIORITY_LOW } from './configOutside'

/**
 * 孵化情况检查管理模块
 */
export default function(): void{
    Game.allLivedCreeps = countLivedCreeps();

    for (const room_name in Game.rooms){
        const room = Game.rooms[room_name];
        if (room.controller && room.controller.my){
            if (room.spawns.length == 0){
                console.log(`房间[${room.name}]没有找到Spawn`);
                continue;
            }
            if (room.spawns.filter((spawn) => { return spawn.spawning == null; }).length == 0){
                continue;
            }
            checkSpawn(room);
        }
    }
}

/**
 * 检查现有的工蚁生存情况，不包括named
 *
 * @returns 按room_code为索引，对应值是按basename为索引的，值为该basename中所有存活的index编号
 */
const countLivedCreeps = function(){
    const lived_creeps: Record<string, LivedCreeps> = {};
    const check = (name: string) => {
        const creep = Game.creeps[name];
        if (creep.named) return;

        const room_code = creep.roomCode;
        const base_name = creep.baseName;

        if (!(room_code in lived_creeps)) lived_creeps[room_code] = {}
        if (!(base_name in lived_creeps[room_code])) lived_creeps[room_code][base_name] = [];

        // 统计各base_name的creep的index
        lived_creeps[room_code][base_name].push(creep.index);
    }
    for (const name in Game.creeps){
        check(name);
    }
    return lived_creeps;
}


/**
 * 按房间检测是否需要重生
 * @param room 房间名称
 * @returns 是否成功生成
 */
const checkSpawn = function (room: Room){
    const code_lived_creeps = Game.allLivedCreeps[room.code] || {};
    // 检查本房间高优先级蚂蚁
    if (checkSpawnBase(room, code_lived_creeps, SPAWN_BASE_PRIORITY_HIGH)) return;
    // 检查本房间相关外矿的高优先级
    for (const outside_room_name of room.memory.roomConfig.outside){
        if (checkSpawnOutside(room, outside_room_name, SPAWN_OUTSIDE_PRIORITY_HIGH)) return;
    }
    // 检查本房间中优先级蚂蚁
    if (checkSpawnBase(room, code_lived_creeps, SPAWN_BASE_PRIORITY_MID)) return;
    // 检查本房间相关外矿的低优先级
    for (const outside_room_name of room.memory.roomConfig.outside){
        if (checkSpawnOutside(room, outside_room_name, SPAWN_OUTSIDE_PRIORITY_LOW)) return;
    }
    // 检查本房间低优先级蚂蚁
    if (checkSpawnBase(room, code_lived_creeps, SPAWN_BASE_PRIORITY_LOW)) return;
}



const checkSpawnBase = function(room: Room, lived_creeps: LivedCreeps, spawn_config : Map<string, SpawnConfig>) {
    for (const [base_name, config] of spawn_config){
        // 该basename的creeps存活数量
        const config_all = lived_creeps[base_name] || [];
        const config_valid_creeps = verifyCreeps(room, room.name, config, lived_creeps);

        const amount = config.amount(room);

        if (config_valid_creeps.length >= amount) continue;
        if (!config.needSpawn(room)) continue;

        // basename数量不足时进行刷新
        const max = config.advance ? amount + 1 : amount

        for (let index=1;index<=max;index++){
            if (config_all.indexOf(index) == -1){
                spawnCreep(room, room.name, config, index);
                return true;
            }
        }
    }
    return false;
}

/** 外矿用的 */
const checkSpawnOutside = function(spawn_room: Room, room_name: string, spawn_config : Map<string, SpawnConfig>) {
    const work_room_code = getRoomCode(room_name);
    if (work_room_code == null){
        console.log(`[${spawn_room.name}]配置的外矿[${room_name}]在Memory没有找到数据`);
        return false;
    }
    const code_lived_creeps = Game.allLivedCreeps[work_room_code] || {};

    for (const [base_name, config] of spawn_config){
        // 该basename的creeps存活数量
        const config_all = code_lived_creeps[base_name] || [];
        const config_valid_creeps = verifyCreeps(spawn_room, room_name, config, code_lived_creeps);

        const amount = config.amount(spawn_room, room_name);
        if (config_valid_creeps.length >= amount) continue;
        if (!config.needSpawn(spawn_room, room_name)) continue;

        // basename数量不足时进行刷新
        const max = config.advance ? amount + 1 : amount

        for (let index=1;index<=max;index++){
            if (config_all.indexOf(index) == -1){
                if (spawnCreep(spawn_room, room_name, config, index)) return true;
            }
        }
    }
    return false;
}

const getRoomCode = function(room_name: string) {
    if (Memory.rooms[room_name] && Memory.rooms[room_name].roomConfig){
        let code = Memory.rooms[room_name].roomConfig.code;
        while (Memory.roomCodeReplace[code]){
            code = Memory.roomCodeReplace[code];
        }
        return code;
    }else{
        return null
    }
}

/**
 * 检查creep的有效性
 * @param spawn_room spawn所在的room对象
 * @param room_name creep工作的房间
 * @param config spawn config
 * @param lived_creeps
 * @returns 该code + basename的creep被判为有效存活的index列表
 */
const verifyCreeps = function(spawn_room: Room, room_name: string, config: SpawnConfig, lived_creeps: LivedCreeps): number[] {
    const room_code = getRoomCode(room_name);
    let base_name = config.baseName;

    const valid_creeps: number[] = [];
    // 只包括按规则生成的，不包括named
    for (const index of (lived_creeps[base_name] || [])){
        const name = `${room_code}-${config.baseName}${index}`;
        const creep = Game.creeps[name];
        if (isValidCreep(spawn_room, room_name, config, creep)){
            valid_creeps.push(creep.index);
        }
    }
    return valid_creeps;
}

/**
 * 判断当前creep是否还视为存活
 * @param spawn_room spawn所在的room对象
 * @param room_name creep工作的房间
 * @param config spawn config
 * @param creep 用于判断的creep
 * @returns true表示视为存活，false表示不存活（会进行respawn）
 */
const isValidCreep = function (spawn_room: Room, room_name: string, config: SpawnConfig, creep: Creep) {
    if (config.advance){
        // 正在孵化的视为存活
        if (!creep || creep.spawning) return true;

        // 检查剩余时间不足的视为死亡
        let spawn_advance_time = Memory.rooms[room_name].spawnConfig.advance[config.baseName];
        const advance_tick = config.body(spawn_room).length * 3 + (spawn_advance_time != null ? spawn_advance_time : 0);
        if (!creep.ticksToLive || creep.ticksToLive <= advance_tick){
            return false;
        }
    }
    return config.isLive(spawn_room, creep);
}

const spawnCreep =  function(spawn_room: Room, work_room_name: string, config: SpawnConfig, index: number){
    const new_name = `${getRoomCode(work_room_name)}-${config.baseName}${index}`;
    if (Game.spawningInTick.indexOf(new_name) > -1){ return false; }
    const body = config.body(spawn_room);

    const memory = JSON.parse(JSON.stringify(config.memory(spawn_room, work_room_name)));

    if (body.indexOf(CARRY) > -1){
        memory.energy = ENERGY_NEED;
    }
    memory.work = WORK_IDLE;
    memory.born = spawn_room.name;

    const spawn = spawn_room.spawns.filter((spawn) => {
        return spawn.spawning == null;
    })[0];
    const result = spawn.spawnCreep(body, new_name, {memory: memory});
    switch(result){
        case OK:
            Game.spawningInTick.push(new_name);
            spawn.room.memory.lastSpawnTime = Game.time;
            break;
        case ERR_NAME_EXISTS:
            console.log(`${spawn.name}: ${new_name}已存在`);
            break;
        case ERR_INVALID_ARGS:
            console.log(`${spawn.name}: ${new_name}的身体代码不正确`);
            break;
        // case ERR_NOT_ENOUGH_ENERGY:
        //     console.log(`${spawn.name}: ${new_name}能量不足`);
        //     break;
    }
    return true;
}
