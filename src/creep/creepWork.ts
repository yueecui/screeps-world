import {
    ENERGY_NEED, ENERGY_ENOUGH,
    WORK_IDLE,
    CONTAINER_TYPE_CONTROLLER,
    WORK_HARVEST,
    WORK_MOVE,
    WORK_REPAIR,
    MODE_HARVEST_ENERGY,
    MODE_HARVEST_MINERAL,
    ROLE_GOTO_RECYCLE,
    BOOLEAN_TRUE,
} from '@/module/constant';

export default function () {
    // ------------------------------------------------------
    // 采集能量
    // ------------------------------------------------------

    Creep.prototype.harvesterIdleCheck = function(){
        const room = this.memory.room ? Game.rooms[this.memory.room] : this.room;
        // 没有视野的情况下先移动过去开视野
        if (!room){
            this.work = WORK_MOVE;
            return;
        }
        if (this.mode == MODE_HARVEST_ENERGY){
            const source_node = Game.getObjectById(room.sources[this.memory.node].id)!;
            // 如果采集点没有能量，则不变化状态
            if (this.pos.isNearTo(source_node)){
                if (source_node.energy > 0){
                    this.work = WORK_HARVEST;
                }
                if (room.sources[this.memory.node].link != null && this.store[RESOURCE_ENERGY] >= 100){
                    const link = Game.getObjectById(room.sources[this.memory.node].link!);
                    if (link){
                        this.transfer(link, RESOURCE_ENERGY, 100);
                    }else room.memory.flagPurge = BOOLEAN_TRUE;
                }
            }else{
                this.work = WORK_MOVE;
            }
        }else if (this.mode == MODE_HARVEST_MINERAL){
            const mineral_node = Game.getObjectById(this.room.mineral.id)!;
            // 矿点储藏量挖光的话，就自动回收
            if (mineral_node.mineralAmount == 0 && mineral_node.ticksToRegeneration > 0){
                this.role = ROLE_GOTO_RECYCLE;
            }
            this.work = WORK_MOVE;
        }
    }


    // 采集者的错误检查
    Creep.prototype.harvesterErrorCheck = function(){
        const room = this.memory.room ? Game.rooms[this.memory.room] : this.room;
        let room_memory = room ? room.memory : Memory.rooms[this.memory.room];
        if (!room_memory || !room_memory.data){
            this.say('ROOM没有数据');
            return true;
        }
        if (this.mode == MODE_HARVEST_ENERGY){
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
        }else if (this.mode == MODE_HARVEST_MINERAL){
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
        if (this.mode == MODE_HARVEST_ENERGY){
            if (room){
                const node_info = room.sources[this.memory.node];
                target = new RoomPosition(node_info.workPos[0], node_info.workPos[1], room.name);
            }else if (Memory.rooms[this.memory.room]){
                const node_info = Memory.rooms[this.memory.room].data.sources[this.memory.node];
                target = new RoomPosition(node_info.workPos[0], node_info.workPos[1], this.memory.room);
            }else{
                this.say('没有目标ROOM的视野');
            }
        }else if (this.mode == MODE_HARVEST_MINERAL){
            const container = Game.getObjectById(this.room.mineral.container!);
            if (container){
                target = container.pos;
            }
        }
        if (!target) return;

        if (this.pos.getRangeTo(target) == 0){
            this.work = WORK_HARVEST;
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
            this.work = WORK_MOVE;
            this.harvesterGoTo();
        }

        let target: Source | Mineral | Deposit | null = null;
        if (this.mode == MODE_HARVEST_ENERGY){
            target = Game.getObjectById(this.room.sources[this.memory.node].id)!;
        }else if (this.mode == MODE_HARVEST_MINERAL){
            target = Game.getObjectById(this.room.mineral.id)!;
        }
        if (!target) return;

        if (this.pos.isNearTo(target)){
            // TODO：需要调整下LINK版
            if (target instanceof Source){
                if (target.energy == 0){
                    this.work = WORK_REPAIR;
                    this.harvesterDoWorkRepair();
                    return;
                }
                // 如果转换成修理模式就不存能量了
                else if (this.room.sources[this.memory.node].link != null && this.store[RESOURCE_ENERGY] >= 100){
                    const link = Game.getObjectById(this.room.sources[this.memory.node].link!);
                    if (link){
                        this.transfer(link, RESOURCE_ENERGY, 100);
                    }else this.room.memory.flagPurge = BOOLEAN_TRUE;
                }
            }else if (target instanceof Mineral){
                const container = Game.getObjectById(this.room.mineral.container!)!;
                if (container.store.getFreeCapacity() < this.getActiveBodyparts(WORK)){
                    this.say('满');
                    return;
                }
                if (target.mineralAmount == 0 && target.ticksToRegeneration > 0){
                    this.role = ROLE_GOTO_RECYCLE;
                    return;
                }
            }
            this.harvest(target);
        }
    }

    // 执行 WORK_REPAIR
    Creep.prototype.harvesterDoWorkRepair = function(){
        let target = Game.getObjectById(this.target!) as AnyStructure | null;
        // 目标不存在或是不值得修一下的话就换个目标
        if (!target || (target.hitsMax - target.hits < this.getActiveBodyparts(WORK) * 100)){
            const found = this.pos.findInRange(FIND_STRUCTURES, 3, {filter: (struct) => {
                // 返回生命值不满，是路或是容器
                return struct.hitsMax - struct.hits >= this.getActiveBodyparts(WORK) * 100  && (struct.structureType == STRUCTURE_CONTAINER
                    || struct.structureType == STRUCTURE_ROAD);
            }});
            if (found.length > 0){
                target = found[0];
                this.target = target.id;
            }else{
                this.target = null;
                this.work = WORK_IDLE;
                return;
            }
        }

        this.repair(target);
        if (this.store[RESOURCE_ENERGY] < this.getActiveBodyparts(WORK)){
            const container = Game.getObjectById(this.room.sources[this.memory.node].container!)!;
            if (container == null || this.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_ENOUGH_RESOURCES){
                this.target = null;
                this.work = WORK_IDLE;
            }
        }
    }


    // ------------------------------------------------------
    // 升级者
    // ------------------------------------------------------

    // 升级者的错误检查
    Creep.prototype.upgraderErrorCheck = function(){
        const controller = this.room.controller;
        if (!controller){
            this.say('ROOM无控制器');
            return true;
        }else if (controller.my){
            this.say('ROOM不属于我')
            return true;
        }else{
            const controller_info = this.room.memory.data.controller;
            if (controller_info.id == null){
                this.say('无升级用存储器');
                return true;
            }
            if (this.index > controller_info.workPos.length){
                this.say('没有可用工作位置');
                return true;
            }
        }
        return false;
    }

    // 执行 WORK_UPGRADE
    Creep.prototype.upgraderDoWork = function(){
        const obtain_energy = () => {
            if (this.store.getFreeCapacity() == 0){
                this.energy = ENERGY_ENOUGH;
                return;
            }
            const controller_info = this.room.memory.data.controller;
            if (controller_info.type == STRUCTURE_LINK){
                if (this.room.controllerLink && this.room.controllerLink.store[RESOURCE_ENERGY] > 0){
                    if (this.pos.isNearTo(this.room.controllerLink)){
                        if (this.withdraw(this.room.controllerLink, RESOURCE_ENERGY) == OK){
                            this.energy = ENERGY_ENOUGH;
                        }
                    }else{
                        this.moveTo(this.room.controllerLink);
                    }
                    return;
                }
            }else if (controller_info.type == STRUCTURE_CONTAINER){
                const container = Game.getObjectById(controller_info.id as Id<StructureContainer>);
                if (container){
                    if (container.store[RESOURCE_ENERGY] > 0){
                        if (this.pos.isNearTo(container)){
                            if (this.withdraw(container, RESOURCE_ENERGY) == OK){
                                this.energy = ENERGY_ENOUGH;
                            };
                        }else{
                            this.moveTo(container);
                        }
                        return;
                    }
                }else{
                    this.room.memory.flagPurge = BOOLEAN_TRUE;
                }
            }
            this.say('饿');
        }

        if (this.energy == ENERGY_NEED){
            obtain_energy();
        }else{
            if (this.store[RESOURCE_ENERGY] == 0){
                this.energy = ENERGY_NEED;
                obtain_energy();
            }

            const controller_info = this.room.memory.data.controller;
            const work_pos = controller_info.workPos[this.index-1];

            if (this.pos.x != work_pos[0] || this.pos.y != work_pos[1]){
                this.moveTo(work_pos[0], work_pos[1])
            }

            switch(this.upgradeController(this.room.controller!)){
                case ERR_NOT_ENOUGH_RESOURCES:
                    this.energy = ENERGY_NEED;
                    obtain_energy();
                    break;
            }
        }
    }

}
