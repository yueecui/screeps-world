import { CONTAINER_TYPE_SOURCE, ENERGY_NEED, MODE_NONE } from "@/constant";

/**
 * 本模式主要是用来处理一些临时操作
 */
export const roleManual: CreepRole = {
    run: function(creep) {
        // this.updateStatus(creep);
        this.execute(creep);
	},

    // 判断工作模式
    updateStatus: function(creep){
        // const target = Game.getObjectById('60b3ae741923ac26d9390519' as Id<Tombstone>);
        // if (target){
        //     if (target!.store.getUsedCapacity() > 0 && creep.store.getFreeCapacity() > 0){
        //         for (const name in target!.store){
        //             if (creep.withdraw(target!, name as ResourceConstant) == ERR_NOT_IN_RANGE){
        //                 creep.moveTo(target!);
        //                 break;
        //             };
        //         }
        //     }else{

        //     }
        // }
        // if (creep.name == 'TR-S1'){
        //     creep.moveTo(15, 15);
        // }else{
        //     for (const name in creep.store){
        //         if (creep.transfer(creep.room.storage!, name as ResourceConstant) == ERR_NOT_IN_RANGE){
        //             creep.moveTo(creep.room.storage!);
        //             break;
        //         };
        //     }
        // }


    },

    // 根据工作模式执行
    execute: function(creep){
        // 工程用
        if (creep.getMode() == 0){
            if (creep.room.name != 'W37N55'){
                if (creep.store[RESOURCE_ENERGY] == 0){
                    if (creep.withdraw(creep.room.storage!, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                        creep.moveTo(creep.room.storage!);
                        return;
                    }
                }

                if (creep.memory.node == undefined){
                    creep.memory.node = 0;
                }
                if (creep.pos.getRangeTo(Game.flags['go'+creep.memory.node]) > 0){
                    creep.moveTo(Game.flags['go'+creep.memory.node], {visualizePathStyle:{}});
                }else{
                    creep.memory.node += 1;
                }
                return;
            }

            if (Game.flags['go'+creep.memory.node]){
                if (creep.pos.getRangeTo(Game.flags['go'+creep.memory.node]) > 0){
                    creep.moveTo(Game.flags['go'+creep.memory.node], {visualizePathStyle:{}});
                }else{
                    creep.memory.node += 1;
                }
            }

            creep.updateEnergyStatus();
            creep.recycleNearby();
            if (creep.getEnergyState() == ENERGY_NEED){
                creep.obtainEnergy({
                    container: [CONTAINER_TYPE_SOURCE],
                });

                // let source;
                // if (creep.getIndex() == 1){
                //     source = Game.getObjectById('5bbcaaed9099fc012e632727' as Id<Source>)!;
                // }else{
                //     source = Game.getObjectById('5bbcaaed9099fc012e632728' as Id<Source>)!;
                // }
                // if (creep.harvest(source) == ERR_NOT_IN_RANGE){
                //     creep.moveTo(source);
                // }

            }else{
                // if (creep.getIndex() == 3){
                    const controller = Game.getObjectById('5bbcaaed9099fc012e632726' as Id<StructureController>)!;
                    if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE){
                        creep.moveTo(controller);
                    }
                    return;
                // }

                // const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
                // if (targets[0]){
                //     if (creep.build(targets[0]) == ERR_NOT_IN_RANGE){
                //         creep.moveTo(targets[0]);
                //     }
                // }




                // else{

                // }
            }

        // 占领用
        }else if (creep.getMode() == 1){
            if (creep.room.name != 'W37N55'){
                if (creep.memory.node == undefined){
                    creep.memory.node = 0;
                }
                if (creep.pos.getRangeTo(Game.flags['go'+creep.memory.node]) > 0){
                    creep.moveTo(Game.flags['go'+creep.memory.node], {visualizePathStyle:{}});
                }else{
                    creep.memory.node += 1;
                }
                return;
            }

            // if (creep.store[RESOURCE_ENERGY] == 0){
            //     if (creep.withdraw(creep.room.storage!, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
            //         creep.moveTo(creep.room.storage!);
            //         return;
            //     }
            // }
            // const flag = Game.flags['go1'];
            // if (!flag){
            //     return;
            // }

            // if (!creep.pos.isNearTo(flag)){
            //     creep.moveTo(flag, {visualizePathStyle:{}});
            // }

            // 占领
            if (creep.pos.isNearTo(creep.room.controller!)){
                if (!creep.room.controller!.my){
                    creep.claimController(creep.room.controller!);
                }
            }else{
                creep.moveTo(creep.room.controller!);
            }

            // 挖矿并升级控制器
            // if (creep.store[RESOURCE_ENERGY] == 0){
            //     const source = Game.getObjectById('5bbcaaed9099fc012e632727' as Id<Source>);
            //     if (creep.harvest(source!) == ERR_NOT_IN_RANGE){
            //         creep.moveTo(source!);
            //     }
            // }else{
            //     if (creep.upgradeController(creep.room.controller!) == ERR_NOT_IN_RANGE){
            //         creep.moveTo(creep.room.controller!);
            //     }
            // }
        }

    },
};
