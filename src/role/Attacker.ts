
export const roleAttacker: Attacker = {
    run: function(creep) {
        // this.updateStatus(creep);
        this.execute(creep);
	},

    // 判断工作模式
    updateStatus: function(creep){

    },

    // 根据工作模式执行
    execute: function(creep){
        if (creep.room.name != creep.memory.room){
            const pos = new RoomPosition(6, 21, creep.memory.room);
            creep.moveTo(pos);
            return;
        }

        {
            const found = creep.room.find(FIND_HOSTILE_CREEPS);
            if (found.length){
                const target = found[0]
                if (creep.pos.isNearTo(target)){
                    creep.attack(target);
                }else{
                    creep.moveTo(target);
                }
                return;
            }
        }

        {
            const found = creep.room.find(FIND_HOSTILE_STRUCTURES);
            if (found.length){
                const target = found[0]
                if (creep.pos.isNearTo(target)){
                    creep.attack(target);
                }else{
                    creep.moveTo(target);
                }
                return;
            }
        }

        creep.role = '回收';
        // if (!creep.room.isUnderAttack && !creep.room.hasInvaderCore){

        // }
    },
};
