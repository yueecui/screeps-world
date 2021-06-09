import { WORK_IDLE, WORK_UPGRADE } from "@/utils/constant";
import { getMaxListeners } from "process";


export const roleEngineer: Engineer = {
    run: function(creep) {
        // this.updateStatus(creep);
        this.execute(creep);
	},

    // 判断工作模式
    updateStatus: function(creep){

    },

    // 根据工作模式执行
    execute: function(creep){
        if (creep.memory.room == null){
            creep.say('⁉️');
            return;
        }
        if (creep.room.name != creep.memory.room){
            const pos = new RoomPosition(25, 25, creep.memory.room);
            creep.moveTo(pos);
            return;
        }

        const controller = creep.room.controller!;
        if (creep.pos.isNearTo(controller)){
            // 已经有人占领的情况下回收
            if (controller.owner){
                creep.role ='回收';
            }
            if (controller.reservation){
                if (controller.reservation.username == 'Yuee'){
                    creep.reserveController(controller);
                }else{
                    creep.attackController(controller);
                }
            }else{
                creep.reserveController(controller);
            }
        }else{
            creep.moveTo(controller);
        }

    },
};
