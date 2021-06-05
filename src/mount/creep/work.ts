import {
    ENERGY_NEED, ENERGY_ENOUGH,
    WORK_IDLE,
    CONTAINER_TYPE_CONTROLLER,
    WORK_HARVEST,
    WORK_GOTO,
    WORK_REPAIR,
    MODE_HARVEST_ENERGY,
    MODE_HARVEST_MINERAL,
    ROLE_GOTO_RECYCLE,
} from '@/constant';

export const creepExtensionHarvester = function () {
    // ------------------------------------------------------
    // 采集能量
    // ------------------------------------------------------

    Creep.prototype.harvesterIdleCheck = function(){
        const room = this.memory.room ? Game.rooms[this.memory.room] : this.room;
        // 没有视野的情况下先移动过去开视野
        if (!room){
            this.setWorkState(WORK_GOTO);
            return;
        }
        if (this.getMode() == MODE_HARVEST_ENERGY){
            const source_node = Game.getObjectById(this.room.sources[this.memory.node].id)!;
            // 如果采集点没有能量，则不变化状态
            if (source_node.energy > 0){
                if (this.pos.isNearTo(source_node)){
                    this.setWorkState(WORK_HARVEST)
                }else{
                    this.setWorkState(WORK_GOTO);
                }
            }
        }else if (this.getMode() == MODE_HARVEST_MINERAL){
            const mineral_node = Game.getObjectById(this.room.mineral.id)!;
            // 矿点储藏量挖光的话，就自动回收
            if (mineral_node.mineralAmount == 0 && mineral_node.ticksToRegeneration > 0){
                this.setRole(ROLE_GOTO_RECYCLE);
            }
            this.setWorkState(WORK_GOTO);
        }
    }


    // 采集能量的错误检查
    Creep.prototype.harvesterErrorCheck = function(){
        const room = this.memory.room ? Game.rooms[this.memory.room] : this.room;
        let room_memory = room ? room.memory : Memory.rooms[this.memory.room];
        if (!room_memory || !room_memory.data){
            this.say('ROOM没有数据');
            return true;
        }
        if (this.getMode() == MODE_HARVEST_ENERGY){
            if (this.memory.node == undefined){
                this.say('没配置采集点');
                return true;
            }else if (room_memory.data.sources.length < this.memory.node + 1){
                this.say('没有足够的采集点');
                return true;
            }
            const source_info = room_memory.data.sources[this.memory.node];
            if (source_info.container == null && source_info.link == null){
                this.say(`${this.memory.node}号没有存储容器`);
                return true;
            }
            return false;
        }else if (this.getMode() == MODE_HARVEST_MINERAL){
            const mineral_info = room_memory.data.mineral;
            if (mineral_info){
                if (mineral_info.container == null || !Game.getObjectById(mineral_info.container)){
                    this.say(`矿藏没有存储容器`);
                    return true;
                }
                return false;
            }else{
                return true;
            }
        }
        return false;
    }


     // 前往采集点
     Creep.prototype.harvesterGoTo = function(){
        const room = this.memory.room ? Game.rooms[this.memory.room] : this.room;

        let target: RoomPosition|null = null;
        if (this.getMode() == MODE_HARVEST_ENERGY){
            if (room){
                const node_info = room.sources[this.memory.node];
                target = new RoomPosition(node_info.workPos[0], node_info.workPos[1], room.name);
            }else if (Memory.rooms[this.memory.room]){
                const node_info = Memory.rooms[this.memory.room].data.sources[this.memory.node];
                target = new RoomPosition(node_info.workPos[0], node_info.workPos[1], this.memory.room);
            }else{
                this.say('没有目标ROOM的视野');
            }
        }else if (this.getMode() == MODE_HARVEST_MINERAL){
            const container = Game.getObjectById(this.room.mineral.container!);
            if (container){
                target = container.pos;
            }
        }
        if (!target) return;

        if (this.pos.getRangeTo(target) == 0){
            this.setWorkState(WORK_HARVEST);
            this.harvesterDoWork();
        }else{
            if (room && room.name == this.room.name){
                this.moveTo(target)
            }else{
                this.moveTo(target, { reusePath: 30 });
            }
        }
    }

    // 执行 WORK_HARVEST_ENERGY
    Creep.prototype.harvesterDoWork = function(){
        const room = this.memory.room ? Game.rooms[this.memory.room] : this.room;
        if (!room){
            this.say('目标ROOM无视野');
            this.setWorkState(WORK_GOTO)
            this.harvesterGoTo();
        }

        let target: Source | Mineral | Deposit | null = null;
        if (this.getMode() == MODE_HARVEST_ENERGY){
            target = Game.getObjectById(this.room.sources[this.memory.node].id)!;
        }else if (this.getMode() == MODE_HARVEST_MINERAL){
            target = Game.getObjectById(this.room.mineral.id)!;
        }
        if (!target) return;

        if (this.pos.isNearTo(target)){
            // TODO：需要调整下LINK版
            if (target instanceof Source && target.energy == 0){
                this.setWorkState(WORK_REPAIR);
                this.harvesterDoWorkRepair();
            }else if (target instanceof Mineral && target.mineralAmount == 0 && target.ticksToRegeneration > 0){
                this.setRole(ROLE_GOTO_RECYCLE);
            }else{
                this.harvest(target);
            }
        }
    }

    // 执行 WORK_REPAIR
    Creep.prototype.harvesterDoWorkRepair = function(){
        let target = this.getTargetObject() as AnyStructure | null;
        // 目标不存在或是不值得修一下的话就换个目标
        if (!target || (target.hitsMax - target.hits < this.getActiveBodyparts(WORK) * 100)){
            const found = this.pos.findInRange(FIND_STRUCTURES, 3, {filter: (struct) => {
                // 返回生命值不满，是路或是容器
                return struct.hitsMax - struct.hits >= this.getActiveBodyparts(WORK) * 100  && (struct.structureType == STRUCTURE_CONTAINER
                    || struct.structureType == STRUCTURE_ROAD);
            }});
            if (found.length > 0){
                target = found[0];
                this.setTarget(target.id);
            }else{
                this.clearTarget();
                this.setWorkState(WORK_IDLE);
                return;
            }
        }

        this.repair(target);
        if (this.store[RESOURCE_ENERGY] < this.getActiveBodyparts(WORK)){
            const container = Game.getObjectById(this.room.sources[this.memory.node].container!)!;
            if (this.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_ENOUGH_RESOURCES){
                this.clearTarget();
                this.setWorkState(WORK_IDLE);
            }
        }
    }


    // ------------------------------------------------------
    // 升级
    // ------------------------------------------------------

    // 执行 WORK_UPGRADE
    Creep.prototype.doWorkUpgrade = function(){
        if (this.getEnergyState() == ENERGY_NEED){
            this.obtainEnergy({
                container: [CONTAINER_TYPE_CONTROLLER],
                storage: false,
            });
        }else{
            if (this.store[RESOURCE_ENERGY] == 0){
                this.setEnergyState(ENERGY_NEED);
                this.obtainEnergy({
                    container: [CONTAINER_TYPE_CONTROLLER],
                    storage: false,
                });
            }
            if (this.room.name == 'W35N57'){
                if (this.pos.x != 29 || this.pos.y != 20+this.getIndex()){
                    this.moveTo(29, 20+this.getIndex())
                }
            }else if (this.room.name == 'W41N54'){
                if (this.getIndex() >= 4){
                    if (this.pos.x != 9 || this.pos.y != 3+this.getIndex()){
                        this.moveTo(9, 3+this.getIndex())
                    }
                }else{
                    if (this.pos.x != 8 || this.pos.y != 6+this.getIndex()){
                        this.moveTo(8, 6+this.getIndex())
                    }
                }
            }else{
                if (this.getIndex() >= 4){
                    if (this.pos.x != 42 || this.pos.y != 11+this.getIndex()){
                        this.moveTo(42, 11+this.getIndex())
                    }
                }else{
                    if (this.pos.x != 42 || this.pos.y != 14+this.getIndex()){
                        this.moveTo(42, 14+this.getIndex())
                    }
                }

            }

            switch(this.upgradeController(this.room.controller!)){
                case ERR_NOT_ENOUGH_RESOURCES:
                    this.setEnergyState(ENERGY_NEED);
                    this.obtainEnergy({
                        container: [CONTAINER_TYPE_CONTROLLER],
                        storage: false,
                    });
                    break;
            }
        }
    }

    // ------------------------------------------------------
    // 建造
    // ------------------------------------------------------

    // 寻找一个需要建造的目标
    // 如果找到就设定上工作状态
    // Creep.prototype.findBuildTarget = function(){
    //     if (this.getWorkState() != WORK_TRANSPORTER_SPAWN
    //         && this.room.hasUnqueueTaskSpawn()){
    //         // 设定工作状态
    //         this.clearQueue();
    //         this.clearTarget();
    //         this.setWorkState(WORK_TRANSPORTER_SPAWN);
    //         this.acceptTaskSpawn();
    //         return true;
    //     }
    //     return false;
    // }
}
