/**
 * 本模式主要是用来处理一些临时操作
 */
export const roleManual: CreepRole = {
    run: function(creep) {
        this.execute(creep);
	},

    // 判断工作模式
    updateStatus: function(creep){
    },

    // 根据工作模式执行
    execute: function(creep){
        const target = Game.spawns['Spawn1'];

        if (creep.pos.isNearTo(target)){
            target.recycleCreep(creep);
        }else{
            creep.moveTo(target);
        }
    },
};
