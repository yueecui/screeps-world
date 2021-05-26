export const roomExtension = function () {
    Room.prototype.cache = {};

    Room.prototype.periodicInspection = function() {
        if (Game.time % 50 == 0){
            this.memory.needCheckSpawnEnergy = this.energyAvailable < this.energyCapacityAvailable;
        }
    };

    Room.prototype.CheckSpawnEnergy = function(){
        if (!this.memory.needCheckSpawnEnergy){
            return;
        }

        // 初始化对象
        if (!this.memory.spawnEnergyStores) {
            this.memory.spawnEnergyStores = {
                unqueued: [],
                queued: [],
            }
        }

        // 查找所有能量不满的孵化用建筑
        const found = this.find(FIND_MY_STRUCTURES, {filter: (find) => {
            if (find.structureType == STRUCTURE_SPAWN || find.structureType == STRUCTURE_EXTENSION){
                return find.store[RESOURCE_ENERGY] < find.store.getCapacity(RESOURCE_ENERGY);
            }else{
                return false;
            }
        }}) as SpawnEnergyStoreStructure[];
        // 缓存所有查询到的房间数据，减少本tick查询
        found.forEach((find) => {
            if (!this.cache.structure){
                this.cache.structure = {}
            }
            this.cache.structure[find.id] = find;
        })
        // 将ID列表存储到Memory
        this.memory.spawnEnergyStores.unqueued = found.filter((find) => {
            return this.memory.spawnEnergyStores.queued.indexOf(find.id) == -1;
        }).map((find) => {
            return find.id;
        });
        // 关闭标记
        this.memory.needCheckSpawnEnergy = false;
    }


    Room.prototype.getTower = function(){
        const memory = this.memory as RoomMemory
        if (!memory.towers){
            const find_tower = this.find(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_TOWER }}) as Array<StructureTower>;
            memory.towers = find_tower.map((t: StructureTower) => {return t.id});
        }
        return memory.towers;
    };
}
