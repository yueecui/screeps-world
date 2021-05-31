import { WORK_IDLE, WORK_UPGRADE } from "@/constant";
import { getMaxListeners } from "process";


export const roleEngineer: Engineer = {
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
        if (!creep.memory.flag){
            return;
        }
        const flag = Game.flags[creep.memory.flag];

        if (creep.room != flag.room){
            creep.moveTo(flag, {visualizePathStyle:{}});
        }else{
            if (creep.pos.isNearTo(creep.room.controller!)){
                if (!creep.room.controller!.my){
                    creep.reserveController(creep.room.controller!);
                }else{
                    if (creep.attackController(creep.room.controller!) == ERR_TIRED){
                        if (creep.room.controller!.upgradeBlocked > 100){
                            creep.memory.r = '回收';
                        }
                    };
                }
            }else{
                creep.moveTo(creep.room.controller!);
            }
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
