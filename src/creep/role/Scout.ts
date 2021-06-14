export default function (creep: Creep) {
    if (creep.mode == 1){
        tempScout(creep);
    }else{
        outsideScout(creep);
    }
}


const outsideScout = function (creep: Creep) {
    if (creep.memory.room == null || creep.memory.room == creep.bornRoom){
        creep.say('⁉️');
        return;
    }
    if (creep.room.name != creep.memory.room){
        const pos = new RoomPosition(25, 25, creep.memory.room);
        creep.moveTo(pos, {reusePath: 50, visualizePathStyle:{}});
        return;
    }

    let stay = creep.memory.stay ?? Memory.rooms[creep.memory.room]?.creepConfig.stay.SC
    if (stay == undefined){
        for(let x=5;x<46;x++){
            for (let y=5;y<46;y++){
                if (creep.room.getTerrain().get(x, y) != TERRAIN_MASK_WALL){
                    creep.memory.stay = [x, y];
                }
            }
        }
    }

    let stay_pos = new RoomPosition(stay[0], stay[1], creep.memory.room);
    if (creep.pos.getRangeTo(stay_pos) == 0){
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

const pos_order = [
    new RoomPosition(12, 2,  'W42N50'),
    new RoomPosition(46, 17, 'W49N50'),
    new RoomPosition(41, 4,  'W50N51'),
    new RoomPosition(47, 16,  'W50N54'),
    new RoomPosition(21, 37,  'W49N54'),
]

const tempScout = function(creep: Creep){
    const pos = pos_order[creep.memory.node];
    Memory.rooms.W41N54.spawnConfig.amount.SC = 0;
    if (pos){
        if (creep.pos.isNearTo(pos)){
            creep.memory.node += 1;
        }else{
            creep.moveTo(pos, {reusePath: 50, visualizePathStyle:{}});
        }
    }else{
        Game.notify(`到达目的地，剩余tick：${creep.ticksToLive}`);
        creep.suicide();
    }
}
