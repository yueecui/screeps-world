import { TASK_WAITING } from "@/constant";
import { all } from "lodash";


export const roomExtensionBase = function () {
    // 从tick cache获取建筑物信息，如果没有则请求→缓存→返回
    Room.prototype.getStructureById = function<T extends AnyStructure>(id: Id<T>): T|null{
        if (!(id in Game.cache.structure)){
            Game.cache.structure[id] = Game.getObjectById(id) as T;
        }
        return Game.cache.structure[id] ? Game.cache.structure[id] as T : null;
    };

    // 从tick cache获取建筑物信息，如果没有则请求→缓存→返回
    Room.prototype.getStructureByIdArray = function<T extends AnyStructure>(id_list: Id<T>[]){
        const result: T[] = [];
        const missed_id: Id<T>[] = [];
        for (const id of id_list){
            if (id == ''){
                continue;
            }
            if (!(id in Game.cache.structure)){
                Game.cache.structure[id] = Game.getObjectById(id as Id<T>);
            }
            if (Game.cache.structure[id]){
                result.push(Game.cache.structure[id] as T);
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
            this.cacheStructuresStatus();   // 重新缓存特定建筑信息（例如塔）
            this.errorCheck();        // 检查各个任务队列是否存在错误
        }

        if (this.memory.flagPurge){
            console.log(`[${Game.time}] Room ${this.name} 强制刷新缓存完成`)
        }
        this.memory.flagPurge = false;

        // 每tick任务
        this.checkSpawnEnergy();
    };

    Room.prototype.errorCheck = function(){
        // 检查任务分配是否有蚂蚁死了
        for (const tasks of [this.memory.taskSpawn, this.memory.taskTowers]){
            for (const id in tasks){
                const task_info = tasks[id];
                // 检查任务接受者是否还存活
                if (
                    task_info.cName
                    && (
                            !(task_info.cName in Game.creeps)
                        || !(Game.creeps[task_info.cName].inTaskQueue(id as Id<AnySpawnEnergyStoreStructure>))
                        )
                    ){
                    tasks[id] = {
                        cName: null,
                        stat: TASK_WAITING,
                    }
                }
            }
        }
        // 检查能量合约，是否有蚂蚁死了
        const newPlan = [];
        for (const plan of this.memory.energyPlan){
            if (plan.cName in Game.creeps
                && _.filter(this.memory.containers, (c)=>{ return c.id == plan.sid }).length > 0){
                newPlan.push(plan);
            }
        }
        this.memory.energyPlan = newPlan;
    }

    Room.prototype.initMemory = function(){
        if (this.memory.flagPurge == undefined){
            this.memory.flagPurge = true;
        }
        if (this.memory.sources == undefined || this.memory.mineral == undefined){
            this.initCollection();
        }
        if (this.memory.lastSpawnTime == undefined){
            this.memory.lastSpawnTime = 0;
        }
        if (this.memory.taskSpawn == undefined){
            this.memory.taskSpawn = {}
        }
        if (this.memory.towers == undefined){
            this.cacheStructuresStatus();
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
    Room.prototype.initCollection = function(){
        const found_sources = this.find(FIND_SOURCES);
        found_sources.sort((a, b) => {
            if (a.pos.x == b.pos.x){
                return a.pos.y - b.pos.y;
            }else{
                return a.pos.x - b.pos.x;
            }
        })
        this.memory.sources = []
        for (const source of found_sources){
            this.memory.sources.push({
                s: source.id,
                c: null,
            })
        }

        const found_mineral = this.find(FIND_MINERALS);
        if (found_mineral.length){
            this.memory.mineral = {
                s: found_mineral[0].id,
                c: null,
            }
        }
    }

     // 缓存特定建筑的Id
     Room.prototype.cacheStructuresStatus = function(){
        const all_structures = this.find(FIND_STRUCTURES);
        // 缓存下来，本tick当单id查询，就不必再请求getObjectById了
        _.each(all_structures, (structure)=>{
            Game.cache.structure[structure.id] = structure;
        })

        // 所有的塔
        this.memory.towers = _.map(_.filter(all_structures, {structureType: STRUCTURE_TOWER}) as StructureTower[], 'id');

        // 所有的LINK
        this.memory.links = [];
        const all_links = _.filter(all_structures, {structureType: STRUCTURE_LINK}) as StructureLink[];
        if (this.storage){
            const near_to_storage_link = _.filter(all_links, (link) => { return this.storage!.pos.getRangeTo(link) <= 2; });
            if (near_to_storage_link.length > 0){
                this.memory.links.push(near_to_storage_link[0].id);
                _.remove(all_links, { id: near_to_storage_link[0].id });
            }
        }
        all_links.sort((a, b) => {
            return a.pos.y  == b.pos.y ? a.pos.x - b.pos.x : a.pos.y - b.pos.y;
        })
        this.memory.links.push(...all_links.map((link) => {return link.id}));

        // container检查
        // TODO 需重新写
        for (const status of this.memory.containers){
            const container = this.getStructureById(status.id);
            if (!container){
                this.removeContainer(status.id);
            }
        }
    };

    Room.prototype.getMySpawns = function (){
        return _.filter(Game.spawns, (spawn) => { return spawn.room.name == this.name; });
    };
}
