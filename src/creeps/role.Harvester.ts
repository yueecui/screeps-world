const SOURCE_NODES = [
  {node: '5bbcab0c9099fc012e632ae6', container: '60aa34c759123005a22b9120'},  // W35N57 上方采集点
  {node: '5bbcab0c9099fc012e632ae8', container: '60aa044fea027425aec64b83'},  // W35N57 下方采集点
]

const WORK_GATHER_ENERGY = 0;
const WORK_STORAGE = 1;

export const roleHarvester: Harvester = {
    run: function(creep) {
        creep.recycleNearby(); // 回收周围的能量
        this.updateWorkStatus(creep);
        this.execute(creep);
    },
    // 根据能量状态切换工作模式
    updateWorkStatus: function(creep){
        if (creep.memory.w == WORK_GATHER_ENERGY && creep.store.getFreeCapacity() == 0){
            creep.memory.w = WORK_STORAGE;
        }else if (creep.memory.w == WORK_STORAGE && creep.store[RESOURCE_ENERGY] == 0){
            creep.memory.w = WORK_GATHER_ENERGY;
        }
    },
    execute: function(creep){
        console.log(JSON.stringify(creep.memory));
        var container = Game.getObjectById(SOURCE_NODES[creep.memory.node].container as Id<StructureContainer>);
        if (creep.pos.getRangeTo(container!) == 0){
            creep.drop(RESOURCE_ENERGY);
        }
        if (creep.memory.w == WORK_GATHER_ENERGY){
            var source_node = Game.getObjectById(SOURCE_NODES[creep.memory.node].node as Id<Source>);
            var result = creep.harvest(source_node!);
            if(result == ERR_NOT_IN_RANGE || result == ERR_NOT_ENOUGH_RESOURCES) {
                creep.moveTo(source_node!);
            }
        }else if (creep.memory.w == WORK_STORAGE){
            creep.moveTo(container!)
        }
    }
};
