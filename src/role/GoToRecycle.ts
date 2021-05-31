/**
 * 将蚂蚁设为“回收”，其会自动回到Spawn被回收掉
 */
export const roleGoToRecycle: CreepRole = {
    run: function(creep) {
        this.execute(creep);
	},

    // 判断工作模式
    updateStatus: function(creep){
    },

    // 根据工作模式执行
    execute: function(creep){
        let target;
        if (creep.room.name == 'W35N57'){
            target = Game.spawns['Spawn1'];
        }else{
            target = Game.spawns['Shanghai'];
        }


        if (creep.pos.isNearTo(target)){
            target.recycleCreep(creep);
        }else{
            creep.moveTo(target);
        }
    },
};
