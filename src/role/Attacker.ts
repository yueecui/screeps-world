import { WORK_IDLE, WORK_UPGRADE } from "@/constant";
import { getMaxListeners } from "process";


export const roleAttacker: Attacker = {
    run: function(creep) {
        // this.updateStatus(creep);
        this.execute(creep);
	},

    // 判断工作模式
    updateStatus: function(creep){
        // switch(creep.getWorkState()){
        //     case WORK_UPGRADE:
        //         break;
        //     case WORK_IDLE:
        //         creep.setWorkState(WORK_UPGRADE);
        //         break;
        // }
    },

    // 根据工作模式执行
    execute: function(creep){
        const flag = Game.flags['Attack'];
        if (!flag){
            return;
        }

        if (creep.pos.isNearTo(flag)){
            const target_creep = _.filter(flag.pos.lookFor(LOOK_CREEPS), (look) => {
                return (look.owner != undefined && !look.my);
            });
            if (target_creep[0]){
                creep.attack(target_creep[0]);
                return;
            }
            const target_structre = _.filter(flag.pos.lookFor(LOOK_STRUCTURES), (look) => {
                if ('owner' in look){
                    return !(look as OwnedStructure).my
                }else{
                    return false;
                }
            });
            if (target_structre[0]){
                creep.attack(target_structre[0]);
                return;
            }
            const found_creeps = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 1)
            if (found_creeps.length > 0){
                creep.attack(found_creeps[0]);
                return;
            }
        }else{
            creep.moveTo(flag, {visualizePathStyle:{}});
        }

        // creep.recycleNearby(); // 回收周围的能量

        // switch(creep.getWorkState()){
        //     case WORK_UPGRADE:
        //         creep.doWorkUpgrade();
        //         break;
        //     case WORK_IDLE:
        //         break;
        //     default:
        //         creep.setWorkState(WORK_IDLE);
        // }
    },
};
