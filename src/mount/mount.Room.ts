import { TASK_WAITING } from "@/constant";

export const roomExtension = function () {
    Room.prototype.cache = {
        structure: {}
    };

    // 从tick cache获取建筑物信息，如果没有则请求→缓存→返回
    Room.prototype.getStructureById = function<T extends AnyStructure>(id: Id<T>): T{
        if (!(id in this.cache.structure)){
            this.cache.structure[id] = Game.getObjectById(id) as T;
        }
        return this.cache.structure[id] as T;
    };

    // 每tick检查的主方法
    Room.prototype.tickCheck = function() {
        // 定期检查
        if (Game.time % 5 == 0){
            this.CheckTowerEnergy();
            this.CheckContainerEnergy();
        }
        if (this.memory.flagPurge || Game.time % 50 == 0){
            this.memory.flagSpawnEnergy = this.energyAvailable < this.energyCapacityAvailable;
        }
        if (this.memory.flagPurge || Game.time % 200 == 0){
            this.cacheMyStructuresId();
        }

        if (this.memory.flagPurge){
            console.log(`[${Game.time}] Room ${this.name} 强制刷新缓存完成`)
        }
        this.memory.flagPurge = false;

        // 每tick任务
        this.CheckSpawnEnergy();
    };

    // 缓存特定建筑的Id
    Room.prototype.cacheMyStructuresId = function(){
        const found = this.find(FIND_MY_STRUCTURES);
        // 缓存下来，如果当单id查询，就不必再请求getObjectById了
        _.each(found, (structure)=>{
            this.cache.structure[structure.id] = structure;
        })
        this.memory.towers = _.map(_.filter(found, {structureType: STRUCTURE_TOWER}) as StructureTower[], 'id');
    };

    // 检查孵化用能量是否充足
    Room.prototype.CheckSpawnEnergy = function(){
        if (!this.memory.flagSpawnEnergy){
            return;
        }

        // 查找所有能量不满的孵化用建筑
        const found = this.find(FIND_MY_STRUCTURES, {filter: (find) => {
            return ((find.structureType == STRUCTURE_SPAWN|| find.structureType == STRUCTURE_EXTENSION)
                    && find.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
        }}) as SpawnEnergyStoreStructure[];
        // 缓存所有查询到的房间数据，减少本tick查询
        // 初始化对象
        if (this.memory.taskSpawn == undefined) {
            this.memory.taskSpawn = {}
        }
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

    // 检查tower的能量
    Room.prototype.CheckTowerEnergy = function(){
        if (this.memory.towers == undefined){
            this.cacheMyStructuresId();
        }
        if (this.memory.towers && this.memory.towers.length > 0){
            let towers = _.map(this.memory.towers, (id)=> {return this.getStructureById(id)});
            towers = _.filter(towers, (tower) => { return tower.store.getFreeCapacity(RESOURCE_ENERGY) > 0; });
            this.memory.taskTowers = {};
            _.each(towers, (tower) => { this.memory.taskTowers![tower.id] = TASK_WAITING; });
        }
    };

    // energy container相关
    Room.prototype.CheckContainerEnergy = function(){
        if (this.memory.energyContainers == undefined){
            this.memory.energyContainers = [];
        }
        if (this.memory.energyContainers && this.memory.energyContainers.length > 0){
            let containers = _.map(this.memory.energyContainers, (id)=> {return this.getStructureById(id)});
            containers = _.filter(containers, (container) => { return container.store.getFreeCapacity(RESOURCE_ENERGY) < 500; });
            this.memory.taskEC = {};
            _.each(containers, (container) => { this.memory.taskEC![container.id] = TASK_WAITING; });
        }
    };
}
