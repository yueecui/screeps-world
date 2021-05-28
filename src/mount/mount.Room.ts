import { TASK_WAITING, CONTAINER_TYPE_SOURCE, PLAN_INCOME, PLAN_PAY } from "@/constant";

const CONTAINER_TO_STORAGE_MIN = 1500;

export const roomExtension = function () {
    Room.prototype.cache = {
        structure: {}
    };

    // 从tick cache获取建筑物信息，如果没有则请求→缓存→返回
    Room.prototype.getStructureById = function<T extends AnyStructure>(id: Id<T>): T|null{
        if (!(id in this.cache.structure)){
            this.cache.structure[id] = Game.getObjectById(id) as T;
        }
        return this.cache.structure[id] ? this.cache.structure[id] as T : null;
    };

    // 从tick cache获取建筑物信息，如果没有则请求→缓存→返回
    Room.prototype.getStructureByIdArray = function<T extends AnyStructure>(id_list: Id<T>[]){
        const result: T[] = [];
        const missed_id: Id<T>[] = [];
        for (const id in id_list){
            if (id == ''){
                continue;
            }
            if (!(id in this.cache.structure)){
                this.cache.structure[id] = Game.getObjectById(id as Id<T>);
            }
            if (this.cache.structure[id]){
                result.push(this.cache.structure[id] as T);
            }else{
                missed_id.push(id as Id<T>);
            }
        }
        return [result, missed_id];
    };

    // 每tick检查的主方法
    Room.prototype.tickCheck = function() {
        // 初始化memory
        this.initMemory();

        // 定期检查
        if (Game.time % 5 == 0){
            this.checkTowerEnergy();
        }
        if (this.memory.flagPurge || Game.time % 50 == 0){
            this.memory.flagSpawnEnergy = this.energyAvailable < this.energyCapacityAvailable;
        }
        if (this.memory.flagPurge || Game.time % 200 == 0){
            this.cacheMyStructuresId();   // 重新缓存特定的自己的建筑（例如塔）
            this.checkContainerStatus();  // 检查container是否存在
        }

        if (this.memory.flagPurge){
            console.log(`[${Game.time}] Room ${this.name} 强制刷新缓存完成`)
        }
        this.memory.flagPurge = false;

        // 每tick任务
        this.checkSpawnEnergy();
    };

    Room.prototype.initMemory = function(){
        if (this.memory.flagPurge == undefined){
            this.memory.flagPurge = true;
        }
        if (this.memory.sources == undefined){
            this.initSources();
        }
        if (this.memory.flagSpawnEnergy == undefined){
            this.memory.flagSpawnEnergy = true;
        }
        if (this.memory.taskSpawn == undefined){
            this.memory.taskSpawn = {}
        }
        if (this.memory.towers == undefined){
            this.cacheMyStructuresId();
        }
        if (this.memory.taskTowers == undefined){
            this.memory.taskTowers = {};
        }
        if (this.memory.containers == undefined){
            this.memory.containers = [];
        }
        if (this.memory.energyPlan == undefined){
            this.memory.energyPlan = [];
        }
    }

    // 初始化所有资源点数据
    // 每个room从上到下，从左到右存储，作为那个地图的资源点node顺序
    Room.prototype.initSources = function(){
        const found = this.find(FIND_SOURCES)
        found.sort((a, b) => {
            if (a.pos.x == b.pos.x){
                return a.pos.y - b.pos.y;
            }else{
                return a.pos.x - b.pos.x;
            }
        })
        this.memory.sources = []
        for (const source of found){
            this.memory.sources.push({
                s: source.id,
                c: null,
            })
        }
    }

    // 添加一个source container时，判断是否在某个source边上
    Room.prototype.addSourceContainer = function(container){
        for (const status of this.memory.sources){
            const source = Game.getObjectById(status.s)!;
            if (source.pos.getRangeTo(container) == 1){
                status.c = container.id;
                return;
            }
        }
    }

    // 移除一个container时，判断是否受到影响
    Room.prototype.removeSourceContainer = function(container_id){
        for (const status of this.memory.sources){
            if (status.c == container_id){
                status.c = null;
                return;
            }
        }
    }

    // 缓存特定建筑的Id
    Room.prototype.cacheMyStructuresId = function(){
        const found = this.find(FIND_MY_STRUCTURES);
        // 缓存下来，本tick当单id查询，就不必再请求getObjectById了
        _.each(found, (structure)=>{
            this.cache.structure[structure.id] = structure;
        })
        this.memory.towers = _.map(_.filter(found, {structureType: STRUCTURE_TOWER}) as StructureTower[], 'id');
    };

    // 检查孵化用能量是否充足
    Room.prototype.checkSpawnEnergy = function(){
        if (!this.memory.flagSpawnEnergy){
            return;
        }
        // 查找所有能量不满的孵化用建筑
        const found = this.find(FIND_MY_STRUCTURES, {filter: (find) => {
            return ((find.structureType == STRUCTURE_SPAWN|| find.structureType == STRUCTURE_EXTENSION)
                    && find.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
        }}) as SpawnEnergyStoreStructure[];
        // 缓存所有查询到的房间数据，减少本tick查询
        found.forEach((find) => {
            this.cache.structure[find.id] = find;
            // 将ID存储到Memory
            if (this.memory.taskSpawn && !(find.id in this.memory.taskSpawn)){
                this.memory.taskSpawn[find.id] = TASK_WAITING
            }
        })
        // 关闭标记
        this.memory.flagSpawnEnergy = false;
    }

    // 根据房间等级获取扩展的最大容量
    Room.prototype.getExtensionMaxCapacity = function(){
        if (this.controller){
            switch(this.controller.level){
                case 1:
                    return 0;
                case 7:
                    return 100;
                case 8:
                    return 200;
                default:
                    return 50;
            }
        }else{
            return 0;
        }
    }

    // 获得所有没进入孵化能量补充队列的建筑
    Room.prototype.getUnqueueSpawnEnergyStores = function(){
        const id_list: Id<SpawnEnergyStoreStructure>[] = [];
        if (this.memory.taskSpawn && Object.keys(this.memory.taskSpawn).length > 0){
            _.each(this.memory.taskSpawn, (v, k) => { if (v == TASK_WAITING){ id_list.push(k as Id<SpawnEnergyStoreStructure>) };
            });
        }
        const [result, missed_id] = this.getStructureByIdArray(id_list);
        // 如果出现了没查到数据的建筑，则移除掉这些数据
        if (missed_id.length > 0){
            for (const id of missed_id){
                delete this.memory.taskSpawn![id];
            }
        }
        return result;
    }

    // 检查tower的能量
    Room.prototype.checkTowerEnergy = function(){
        if (this.memory.towers && this.memory.towers.length > 0){
            let towers = _.map(this.memory.towers, (id)=> {return this.getStructureById(id)});
            towers = _.filter(towers, (tower) => {
                if (tower == null) { this.memory.flagPurge = true;return false; }
                return tower.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            });
            this.memory.taskTowers = {};
            _.each(towers, (tower) => { this.memory.taskTowers![tower!.id] = TASK_WAITING; });
        }
    };

    // 手工调用方法：添加一个container
    Room.prototype.addContainer = function(id, type){
        if (_.findIndex(this.memory.containers, {id: id}) > -1){
            console.log(`${id} 已经添加过了`);
            return;
        }
        const container = this.getStructureById(id);
        if (!container){
            console.log(`${id} 为非法的ObjectId`);
        }else if(container.structureType != STRUCTURE_CONTAINER){
            console.log(`${id} 不是container：${container.structureType}`);
        }else{
            this.memory.containers.push({
                id: id,
                type: type,
            })
            if (type == CONTAINER_TYPE_SOURCE){
                this.addSourceContainer(container);
            }
        }
    }

    // 移除一个container（会周期性检查）
    Room.prototype.removeContainer = function(id){
        const index = _.findIndex(this.memory.containers, {id: id});
        if (index == -1){
            console.log(`${id} 不存在于当前列表`);
        }else{
            this.memory.containers.splice(index, 1);
            this.removeSourceContainer(id);
        }
    }

    // 周期性检查container的状态
    Room.prototype.checkContainerStatus = function(){
        for (const status of this.memory.containers){
            const container = this.getStructureById(status.id);
            if (!container){
                this.removeContainer(status.id);
            }
        }
    }

    // 预定一个container的能量变化
    Room.prototype.bookingContainer = function(creep_id, container_id, type, amount){
        if (amount == 0){
            return;
        }
        const index = _.findIndex(this.memory.energyPlan!, {cid: creep_id});
        if (index == -1){
            this.memory.energyPlan.push({
                cid: creep_id,
                sid: container_id,
                t: type,
                a: amount
            })
        }else{
            this.memory.energyPlan[index] = {
                cid: creep_id,
                sid: container_id,
                t: type,
                a: amount
            }
        }
    }

    // 原则上每个creep同一时间只会预订一个存储器，所以只指定creep ID即可
    Room.prototype.unbookingContainer = function(id: Id<Creep>){
        _.remove(this.memory.energyPlan, {cid: id});
    }

    // 按booking后数值计算energy数量
    Room.prototype.getContainerEnergyCapacity = function(container){
        return container.store[RESOURCE_ENERGY] + _.sum(_.map(
            _.filter(this.memory.energyPlan, {sid: container.id}),
            (plan) => {
                return plan.t == PLAN_PAY ? plan.a * -1: plan.a;
            }
        ));
    }

    // energy container相关
    Room.prototype.getFullSourceContainers = function(){
        let containers = _.map(this.memory.containers, (c) => {
            return c.type == CONTAINER_TYPE_SOURCE ? this.getStructureById(c.id) : null;
        });

        return _.filter(containers, (container) => {
            if (container == null) { return false; }
            return this.getContainerEnergyCapacity(container) >= CONTAINER_TO_STORAGE_MIN; }
        ) as StructureContainer[];
    };
}
