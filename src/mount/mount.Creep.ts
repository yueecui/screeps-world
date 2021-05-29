import { roleHarvester } from '@/creeps/role.Harvester';
import { roleTransporter } from '@/creeps/role.Transporter';
import { roleBuilder } from '@/creeps/role.Builder';
import { roleUpgrader } from '@/creeps/role.Upgrader';

import {
    RoleNameHarvester,
    ENERGY_NEED, ENERGY_ENOUGH,
    WORK_IDLE, WORK_TRANSPORTER_SPAWN,
    TASK_WAITING, TASK_ACCEPTED,
    CONTAINER_TYPE_SOURCE,
    PLAN_PAY,
} from '@/constant';


const roleMap: Record<AnyRoleName, AnyRole> = {
    '采集': roleHarvester,
    '运输': roleTransporter,
    '建造': roleBuilder,
    '升级': roleUpgrader,
}

// 任务队列最大长度
const TASK_QUEUE_MAX = 5;

export const creepExtension = function () {
    Creep.prototype.baseName = '';
    Creep.prototype.index = 0;
    Creep.prototype.recycling = false;

    Creep.prototype.run = function(){
        if (this.spawning){
            return;
        }
        // if (this.getRole() == 'Upgrader'){
        //     return roleMap['Builder'].run(this);
        // }
        if (this.getRole() == undefined){
            this.say('没有配置角色');
        }else{
            roleMap[this.getRole()].run(this);
        }
    };

    Creep.prototype.analyzeName = function () {
        const find = /([^\d]+)(\d+)/.exec(this.name);
        if (find){
            this.baseName = find[1];
            this.index = parseInt(find[2]) || 0;
            return true;
        }else{
            this.baseName = '未知';
            this.index = -1;
            return false;
        }
    }

    Creep.prototype.getBasename = function () {
        if (this.baseName == ''){
            this.analyzeName();
        }
        return this.baseName;
    }
    Creep.prototype.getIndex = function(){
        if (this.index == 0){
            this.analyzeName();
        }
        return this.index;
    }

    Creep.prototype.getRole = function(){
        return this.memory.r;
    }

    Creep.prototype.getTarget = function(){
        return this.memory.t ? Game.getObjectById(this.memory.t) : null;
    }

    Creep.prototype.clearTarget = function(){
        this.memory.t = null;
    }

    Creep.prototype.unshiftTarget = function(){
        if (this.memory.queue && this.memory.t){
            this.memory.queue.unshift(this.memory.t)
        }
        this.clearTarget();
    }

    Creep.prototype.clearQueue = function(){
        if (this.memory.queue){
            for (const id in this.memory.queue){
                switch(this.memory.w){
                    case WORK_TRANSPORTER_SPAWN:
                        if (id in this.room.memory.taskSpawn){
                            this.room.memory.taskSpawn[id] = {
                                cName: null,
                                stat: TASK_WAITING,
                            };
                        }
                        break;
                }
            }
        }
        this.memory.queue = [];
    }

    // ------------------------------------------------------------
    // 能量相关
    // ------------------------------------------------------------

    // 更新虫子当前的能量状态
    Creep.prototype.updateEnergyStatus = function(){
        if (this.memory.e == ENERGY_NEED && this.store.getFreeCapacity() == 0){
            this.memory.e = ENERGY_ENOUGH;
        }else if (this.memory.e == ENERGY_ENOUGH && this.store[RESOURCE_ENERGY] == 0){
            this.memory.e = ENERGY_NEED;
        }
    },

    // 从房间里存储器获取能量
    Creep.prototype.obtainEnergy = function(opt){
        let target = this.getTarget() as StructureContainer | StructureStorage | null;

        if (!target || (target.structureType != STRUCTURE_CONTAINER && target.structureType != STRUCTURE_STORAGE)){
            target = this.findEnergyStore(opt);
        }

        if (target){
            const result = this.withdraw(target, RESOURCE_ENERGY);
            switch(result){
                case ERR_NOT_IN_RANGE:
                    this.moveTo(target);
                    break;
                default:
                    this.clearTarget();
                    this.memory.e = ENERGY_ENOUGH;
                    break;
            }
        }else{
            this.say('无法获得能量')
        }
    },

    Creep.prototype.findEnergyStore = function(opt){
        let structures: Array<StructureContainer | StructureStorage> = [];
        if (opt && opt.container){
            _.each(
                _.filter(this.room.memory.containers, (config) => {
                    return opt!.container!.indexOf(config.type) > -1;
                }),
                (config) => {
                    const container = this.room.getStructureById(config.id);
                    if (container && container.store[RESOURCE_ENERGY] > 0){
                        structures.push(container);
                    }
                }
            )
        }
        if ((opt
            && opt.storage != undefined ? opt.storage : true)
            && this.room.storage
            && this.room.storage.store[RESOURCE_ENERGY] > 0){
            structures.push(this.room.storage)
        }
        // 根据最小需求量过滤
        const min_amount = opt && opt.min_amount ? opt.min_amount : this.store.getFreeCapacity(RESOURCE_ENERGY);
        structures = _.filter(structures, (structure) => {
            return this.room.getStructureEnergyCapacity(structure) >= min_amount;
        });
        if (structures.length > 0){
            structures.sort((a, b) => {
                return this.pos.getRangeTo(a) - this.pos.getRangeTo(b);
            })
            const structure = structures[0];
            this.memory.t = structure.id;
            if (structure.structureType == STRUCTURE_CONTAINER){
                this.room.bookingContainer(this.name, structure.id, PLAN_PAY, this.store.getFreeCapacity(RESOURCE_ENERGY));
            }
            return structure;
        }else{
            this.room.unbookingContainer(this.name);
            this.memory.t = null;
            return null;
        }
    }

    // ------------------------------------------------------------
    // 工作事务相关
    // ------------------------------------------------------------

    // 检查是否需要设置工作状态为搬运孵化能量
    Creep.prototype.checkWorkTransporterSpawn = function(){
        if (this.memory.w != WORK_TRANSPORTER_SPAWN
            && this.room.hasUnqueueSpawnEnergyStores()){
                // 设定工作状态
                this.clearQueue();
                this.clearTarget();
                this.updateQueueSpawnEnergyStore();
                this.memory.w = WORK_TRANSPORTER_SPAWN;
        }
    },

    // 执行WORK_TRANSPORTER_SPAWN
    Creep.prototype.doWorkTransporterSpawn = function(){
        if (this.memory.e == ENERGY_NEED){
            this.obtainEnergy({
                container: [CONTAINER_TYPE_SOURCE],
                storage: true,
            });
        }else{
            // 没有找到下个目标的情况下，返回false，并且把工作置为IDLE
            if (!this.setNextTargetSpawnEnergyStore()){
                this.memory.w = WORK_IDLE;
                return;
            }
            const target = this.getTarget() as SpawnEnergyStoreStructure;
            if (this.store.getFreeCapacity() > 0 && (target.store.getFreeCapacity(RESOURCE_ENERGY) > this.store[RESOURCE_ENERGY])){
                this.memory.e = ENERGY_NEED;
                this.unshiftTarget();
                this.obtainEnergy({
                    container: [CONTAINER_TYPE_SOURCE],
                    storage: true,
                });
            }else{
                const result = this.transfer(target, RESOURCE_ENERGY);
                switch(result){
                    case OK:
                        // 如果当前的容量不足以填满目标，则将目标放回队列里
                        if (this.store[RESOURCE_ENERGY] >= target.store.getFreeCapacity(RESOURCE_ENERGY)){
                            delete this.room.memory.taskSpawn[this.memory.t!];
                            this.clearTarget();
                        }else{
                            this.unshiftTarget();
                        }
                        break;
                    case ERR_NOT_IN_RANGE:
                        this.moveTo(target);
                        break;
                }
            }
        }
    },

    // 将下一个需要存能量的建筑ID设为memory.t
    Creep.prototype.updateQueueSpawnEnergyStore = function(){
        // 队列不存在的话，获取一下队列
        if (!this.memory.queue || this.memory.queue.length == 0){
            // 获取目标队列
            let targets = this.room.getUnqueueSpawnEnergyStores();
            targets.sort((a, b) => {
                return this.pos.getRangeTo(a) - this.pos.getRangeTo(b);
            });
            this.memory.queue = [];
            for (const t of targets){
                this.memory.queue.push(t.id);
                this.room.memory.taskSpawn![t.id] = {
                    cName: this.name,
                    stat: TASK_ACCEPTED,
                };
                if (this.memory.queue.length > TASK_QUEUE_MAX){
                    break;
                }
            }
        }
        return this.memory.queue.length > 0;
    }


    // 将下一个需要存能量的建筑ID设为memory.t
    Creep.prototype.setNextTargetSpawnEnergyStore = function(){
        // 如果已经有目标了，则直接继续
        if (this.memory.t){
            return true;
        }
        // 从队列里获取第一个目标，如果没有则完成事务
        if (this.updateQueueSpawnEnergyStore()){
            this.memory.t = _.head(this.memory.queue!);
            this.memory.queue = _.drop(this.memory.queue!);
            return true;
        }else{
            this.clearTarget();
            return false;
        }
    }

    // ------------------------------------------------------------
    // 执行操作
    // ------------------------------------------------------------

    // 拾取虫子周围掉落的能量
    // 返回值
    // OK -> 拾取成功
    // ERR_FULL -> 当前剩余存储量太多
    // ERR_NOT_FOUND -> 没有找到合适的目标
    Creep.prototype.recycleNearby = function(res_type = RESOURCE_ENERGY){
        if (this.store.getFreeCapacity() == 0){
            return ERR_FULL;
        }
        // this.recycling = false;
        // 判断拾取附近的墓碑
        const find_tombstone = this.room.find(FIND_TOMBSTONES, { filter: (obj) => { return obj.store[res_type] && this.pos.isNearTo(obj); } })
        for (const find of find_tombstone){
            this.withdraw(find, res_type);
            this.recycling = true;
            break;
        }
        // 判断拾取附近的废墟
        const find_ruins = this.room.find(FIND_RUINS, { filter: (obj) => { return obj.store[res_type] && this.pos.isNearTo(obj); } })
        for (const find of find_ruins){
            this.withdraw(find, res_type);
            this.recycling = true;
            break;
        }
        // 判断拾取附近的掉落物
        const find_dropped = this.room.find(FIND_DROPPED_RESOURCES, { filter: (obj) => { return obj.resourceType == res_type && this.pos.isNearTo(obj); } });
        for (const find of find_dropped){
            // 采集者不拿已经堆满的container上的掉落能量
            if (this.memory.r == RoleNameHarvester){
                const lookfor_container = this.room.lookAt(find).filter((r) => {
                    return (r.type == 'structure'
                            && (r.structure as StructureContainer).structureType == STRUCTURE_CONTAINER
                            && (r.structure as StructureContainer).store.getFreeCapacity(RESOURCE_ENERGY) == 0
                            );
                });
                if (lookfor_container.length > 0){
                    continue;
                }
            }
            this.pickup(find);
            this.recycling = true;
            break;
        }
        if (this.recycling){
            return OK;
        }else{
            return ERR_NOT_FOUND;
        }
    }

    // 返回本回合执行recycleNearby是否成功
    // 成功的情况下，在其他代码里需要阻拦其他withdraw和pickup操作
    Creep.prototype.isRecycling = function () {
        return this.recycling;
    }

    // 从Room中离当前自己最近的container获取能量
    Creep.prototype.obtainEnergyFromNearestContainer = function(capacity_min){
        // if (this.room.storage && this.room.storage.store[RESOURCE_ENERGY] > 0){
        //     if (this.withdraw(this.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
        //         this.moveTo(this.room.storage)
        //     }
        //     return;
        // }
        capacity_min = capacity_min || 0;
        let target = Game.getObjectById(this.memory.t!);
        if (!(target && target.structureType == STRUCTURE_CONTAINER && target.storeCapacity)){
            let find_containers = this.room.find(FIND_STRUCTURES, {filter: function(st){
                return (st.structureType == STRUCTURE_CONTAINER && st.storeCapacity && st.store[RESOURCE_ENERGY] > capacity_min)
            }});

            find_containers.sort((a, b) => {
                return this.pos.getRangeTo(a) - this.pos.getRangeTo(b);
            });
            target = find_containers[0];
        }

        if (this.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
            this.moveTo(target)
        }
    }
}
