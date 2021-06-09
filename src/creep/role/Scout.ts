export const roleScout = {
    run: function(creep: Creep) {
        this.updateStatus(creep);
        this.execute(creep);
	},

    // 判断工作模式
    updateStatus: function(creep: Creep){
    },

    // 根据工作模式执行
    execute: function(creep: Creep){
        if (creep.memory.room == null){
            creep.say('⁉️');
            return;
        }
        if (creep.room.name != creep.memory.room){
            const pos = new RoomPosition(25, 25, creep.memory.room);
            creep.moveTo(pos);
            return;
        }

        if (creep.room.memory.creepConfig.stay.SC == undefined){
            for(let x=5;x<46;x++){
                for (let y=5;y<46;y++){
                    if (creep.room.getTerrain().get(x, y) != TERRAIN_MASK_WALL){
                        creep.room.memory.creepConfig.stay.SC = [x, y];
                        creep.goToStay();
                        return;
                    }
                }
            }
        }else{
            const pos = new RoomPosition(creep.room.memory.creepConfig.stay.SC[0], creep.room.memory.creepConfig.stay.SC[1], creep.room.name);
            if (creep.pos.getRangeTo(pos) == 0){
                creep.say('📡');
                creep.room.visual.text(
                    '侦查中',
                    creep.pos,
                    {
                        color: '#ffae67',
                        font: 0.4,
                        stroke: '#000000'
                    }
                )
            }else{
                creep.goToStay();
            }
        }
    },
};
