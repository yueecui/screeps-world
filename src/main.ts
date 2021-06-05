import { Mount } from 'mount/mount';
// 对原型进行扩展
Mount.init();

import { ErrorMapper } from "utils/ErrorMapper";
import { Automatic } from 'utils/Automatic';
import { ManagerCreeps } from '@/spawn/manager.Creeps';

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
module.exports.loop = () => {
    // 自动事务
    Automatic.run();

    // 修改原型
    // prototypeMain.init();

    // 保存bucket
    if (Game.cpu.bucket == 10000){
        Game.cpu.generatePixel();
    }

    // 小虫管理器检查当前单位数量是否正常
    ManagerCreeps.check();

    // 检查所有自己的房间
    for(const name in Game.rooms) {
        const room = Game.rooms[name];
        if (room.my){
            room.tickCheck();

            // 检查塔
            if (room.memory.data.towers){
                for (const tower_id of room.memory.data.towers){
                    const tower = Game.getObjectById(tower_id);
                    if (tower){
                        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                        if(closestHostile) {
                            tower.attack(closestHostile);
                            continue
                        }

                        const found = room.find(FIND_MY_STRUCTURES, {filter: (struct) => {
                            return struct.structureType == STRUCTURE_RAMPART && struct.hits < 300;
                        }})
                        if (found.length){
                            tower.repair(found[0]);
                        }
                    }
                }
            }
        }
    }

    // 运转所有小虫
    for(const name in Game.creeps) {
        Game.creeps[name].run();
    }

    // 临时运转LINK
    const room = Game.rooms['W35N57'];
    const mm_link = Game.getObjectById(room.memory.links[0])!;
    for (let i=1;i<room.memory.links.length;i++){
        const link = Game.getObjectById(room.memory.links[i])!;
        if (link.store[RESOURCE_ENERGY] > 0){
            link.transferEnergy(mm_link);
        }
    }
};
