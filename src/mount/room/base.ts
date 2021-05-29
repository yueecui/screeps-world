import { TASK_WAITING } from "@/constant";


export const roomExtensionBase = function () {
    Room.prototype.cache = {
        structure: {}
    };

    // 缓存特定建筑的Id
    Room.prototype.cacheMyStructuresId = function(){
        const found = this.find(FIND_MY_STRUCTURES);
        // 缓存下来，本tick当单id查询，就不必再请求getObjectById了
        _.each(found, (structure)=>{
            this.cache.structure[structure.id] = structure;
        })
        this.memory.towers = _.map(_.filter(found, {structureType: STRUCTURE_TOWER}) as StructureTower[], 'id');
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
        for (const id of id_list){
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
            // this.memory.lastSpawnTime = (this.energyAvailable < this.energyCapacityAvailable || this.energyAvailable == 300) ? 1 : 0;
        }
        if (this.memory.flagPurge || Game.time % 20 == 0){
            // 强制刷新孵化能量任务队列
            this.memory.lastSpawnTime = 1
            this.cacheMyStructuresId();   // 重新缓存特定的自己的建筑（例如塔）
            this.checkContainerStatus();  // 检查container是否存在
            this.checkTaskError();        // 检查各个任务队列是否存在错误
        }

        if (this.memory.flagPurge){
            console.log(`[${Game.time}] Room ${this.name} 强制刷新缓存完成`)
        }
        this.memory.flagPurge = false;

        // 每tick任务
        this.checkSpawnEnergy();
    };

    Room.prototype.checkTaskError = function(){
        for (const id in this.memory.taskSpawn){
            const task_info = this.memory.taskSpawn[id];
            // 检查任务接受者是否还存活
            if (
                task_info.cName
                && (
                        !(task_info.cName in Game.creeps)
                    || !(Game.creeps[task_info.cName].inTaskQueue(id as Id<SpawnEnergyStoreStructure>))
                    )
                ){
                this.memory.taskSpawn[id] = {
                    cName: null,
                    stat: TASK_WAITING,
                }
            }
        }
    }

    Room.prototype.initMemory = function(){
        if (this.memory.flagPurge == undefined){
            this.memory.flagPurge = true;
        }
        if (this.memory.sources == undefined){
            this.initSources();
        }
        if (this.memory.lastSpawnTime == undefined){
            this.memory.lastSpawnTime = 0;
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
}
