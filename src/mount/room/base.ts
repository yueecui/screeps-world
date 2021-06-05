import { TASK_WAITING,
    CONTAINER_TYPE_NONE, CONTAINER_TYPE_CONTROLLER, CONTAINER_TYPE_SOURCE, CONTAINER_TYPE_MINERAL,
    LINK_TYPE_NONE, LINK_TYPE_STORAGE, LINK_TYPE_CONTROLLER, LINK_TYPE_SOURCE } from "@/constant";


interface findPosParam{
    pos: RoomPosition,
    range: number,
    include?: boolean
}

/** 获取一个范围内的全部坐标 */
const getPosSet = function(find: findPosParam): [number, number][]{
    const result: [number, number][] = [];
    for (let offset_x=(find.range*-1);offset_x<find.range+1;offset_x++){
        for (let offset_y=(find.range*-1);offset_y<find.range+1;offset_y++){
            if (!find.include && offset_x == 0 && offset_y == 0){
                continue;
            }
            result.push([find.pos.x+offset_x, find.pos.y+offset_y]);
        }
    }
    return result;
}

/** 寻找2个目标位置中重叠的可以站的地方 */
const findOverlapPos = function(a: findPosParam, b: findPosParam): [number, number][]{
    if (a.pos.roomName != b.pos.roomName){
        return [];
    }
    const result = [];
    const terrain = new Room.Terrain(a.pos.roomName);
    const range_a = getPosSet(a);
    const range_b = getPosSet(b);
    for (const pos_a of range_a){
        const find_pos = _.remove(range_b, (pos_b) => {
            return pos_a[0] == pos_b[0] && pos_a[1] == pos_b[1];
        })[0]; // 只可能有1个结果，如果是undefined就是没有
        if (find_pos
            && terrain.get(find_pos[0], find_pos[1]) != TERRAIN_MASK_WALL){
            // 位置不是墙，但还需要判断下有没有阻碍移动的建筑物
            const pos = new RoomPosition(find_pos[0], find_pos[1], a.pos.roomName);
            const lookfor = pos.lookFor(LOOK_STRUCTURES).filter((struct) => {
                return struct.structureType != STRUCTURE_ROAD
                && struct.structureType != STRUCTURE_CONTAINER
                && struct.structureType != STRUCTURE_RAMPART;
            })
            // 没有阻碍的建筑时才视为有效地点
            if (lookfor.length == 0){
                result.push(find_pos);
            }
        }
    }
    return result;
}



/**
 * 计算工作坐标位置
 * @param target 目标工作对象
 * @param container 能量存储容器对象
 * @returns 工作坐标位置
 */
const calcWorkPos = function(target:Source|Mineral|StructureController, container:StructureContainer|StructureLink): [number, number]{
    if (target instanceof Source){
        if(container.structureType == STRUCTURE_CONTAINER){
            return [container.pos.x, container.pos.y];
        }else if (container.structureType == STRUCTURE_LINK){

        }
    }else if (target instanceof Mineral && container.structureType == STRUCTURE_CONTAINER){
        return [container.pos.x, container.pos.y];
    }else if (target instanceof StructureController){

    }
    return [0, 0];
}

export const roomExtensionBase = function () {
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
            this.updateRoomStatus();   // 重新缓存特定建筑信息（例如塔）
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
        if (this.memory.data == undefined){
            this.memory.data = {
                sources: [],
                mineral: null,
                containers: [],
                links: [],
                towers: [],
                controller: {
                    id: null,
                    type: null,
                    workPos: [],
                },
                storage: {
                    link: null,
                }
            }
        }

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
            this.updateRoomStatus();
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
     Room.prototype.updateRoomStatus = function(){
        const all_structures = this.find(FIND_STRUCTURES);

        // 所有的塔
        this.memory.data.towers = _.map(_.filter(all_structures, {structureType: STRUCTURE_TOWER}) as StructureTower[], 'id');
        // 所有的container
        this.updateRoomStatus_Container(_.filter(all_structures, {structureType: STRUCTURE_CONTAINER}) as StructureContainer[]);
        // 所有的link
        this.updateRoomStatus_Link(_.filter(all_structures, {structureType: STRUCTURE_LINK}) as StructureLink[]);


        // 以下为旧版本保留
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
            const container = Game.getObjectById(status.id);
            if (!container){
                this.removeContainer(status.id);
            }
        }
    };

    Room.prototype.updateRoomStatus_Container = function(all_containers){
        const new_containers_info_map: Record<string, containerInfo> = {};
        for (const container of all_containers){
            new_containers_info_map[container.id] = {
                id: container.id,
                type: CONTAINER_TYPE_NONE,
            }
        }
        for (const container of this.memory.data.containers){
            if (container.id in new_containers_info_map){
                new_containers_info_map[container.id].type = container.type
            }
        }
        // 重新生成数据
        this.memory.data.containers = [];
        for (const container_id in new_containers_info_map){
            const container_info = new_containers_info_map[container_id];
            if (container_info.type == CONTAINER_TYPE_NONE){
                container_info.type = ((container_id: Id<StructureContainer>) => {
                    const container = Game.getObjectById(container_id)!;
                    // 判断是否为mineral的container
                    if (this.mineral.container == null
                        && container.pos.getRangeTo(Game.getObjectById(this.mineral.id)!) <= 2){
                            this.mineral.container = container_id;
                            return CONTAINER_TYPE_MINERAL;
                    }
                    // 判断是否为source的container
                    for(const source_info of this.sources){
                        if (source_info.container == null
                            && container.pos.getRangeTo(Game.getObjectById(source_info.id)!) <= 2){
                                source_info.container = container_id;
                                source_info.workPos = [container.pos.x, container.pos.y];
                                return CONTAINER_TYPE_SOURCE;
                        }
                    }
                    // 判断是否为controller的container
                    if (this.controller
                        && this.memory.data.controller.type == null
                        && container.pos.getRangeTo(this.controller) <= 3){
                            this.memory.data.controller = {
                                id: container_id,
                                type: STRUCTURE_CONTAINER,
                                workPos: findOverlapPos({
                                    pos: container.pos,
                                    range: 1,
                                    include: true
                                }, {
                                    pos: this.controller.pos,
                                    range: 3
                                })
                            }

                            return CONTAINER_TYPE_CONTROLLER;
                    }
                    return CONTAINER_TYPE_NONE;
                })(container_id as Id<StructureContainer>);
            }
            this.memory.data.containers.push(container_info);
        }
        // 重新排序
        this.memory.data.containers.sort((a, b) => {
            if (a.type && b.type){
                return a.type - b.type;
            }else if (a.type){
                return -1;
            }else if (b.type){
                return 1;
            }else{
                return a.id.localeCompare(b.id);
            }
        });
    }

    Room.prototype.updateRoomStatus_Link = function(all_links){
        const new_links_info_map: Record<string, linkInfo> = {};
        for (const link of all_links){
            new_links_info_map[link.id] = {
                id: link.id,
                type: LINK_TYPE_NONE,
            }
        }
        for (const link of this.memory.data.links){
            if (link.id in new_links_info_map){
                new_links_info_map[link.id].type = link.type
            }
        }
        // 重新生成数据
        this.memory.data.links = [];
        for (const link_id in new_links_info_map){
            const link_info = new_links_info_map[link_id];
            if (link_info.type == LINK_TYPE_NONE){
                link_info.type = ((link_id: Id<StructureLink>) => {
                    const link = Game.getObjectById(link_id)!;
                    // 判断是否为source的link
                    for(const source_info of this.sources){
                        const source = Game.getObjectById(source_info.id)!;
                        if (source_info.link == null
                            && link.pos.getRangeTo(source) <= 2){
                                source_info.link = link_id;
                                source_info.workPos = findOverlapPos({
                                    pos: link.pos,
                                    range: 1,
                                }, {
                                    pos: source.pos,
                                    range: 1
                                })[0];

                                return LINK_TYPE_SOURCE;
                        }
                    }
                    // 判断是否为controller的link
                    if (this.controller
                        && this.memory.data.controller.type != STRUCTURE_LINK
                        && link.pos.getRangeTo(this.controller) <= 3){
                            this.memory.data.controller = {
                                id: link_id,
                                type: STRUCTURE_LINK,
                                workPos: findOverlapPos({
                                    pos: link.pos,
                                    range: 1,
                                }, {
                                    pos: this.controller.pos,
                                    range: 3
                                })
                            }
                            return LINK_TYPE_CONTROLLER;
                    }
                    // 判断是否为storage的link
                    if (this.storage
                        && link.pos.getRangeTo(this.storage) <= 2){
                            this.memory.data.storage.link = link_id;
                            return LINK_TYPE_STORAGE;
                    }
                    return LINK_TYPE_NONE;
                })(link_id as Id<StructureLink>);
            }
            this.memory.data.links.push(link_info);
        }
        // 重新排序
        this.memory.data.links.sort((a, b) => {
            if (a.type && b.type){
                return a.type - b.type;
            }else if (a.type){
                return -1;
            }else if (b.type){
                return 1;
            }else{
                return a.id.localeCompare(b.id);
            }
        });
    }


    Room.prototype.getMySpawns = function (){
        return _.filter(Game.spawns, (spawn) => { return spawn.room.name == this.name; });
    };

    Room.prototype.calcPrice = function (order_id: string, amount: number){
        const order = Game.market.getOrderById(order_id);
        if (!order){
            console.log(`订单 ${order_id} 不存在`);
            return;
        }
        if (order.type != ORDER_BUY){
            console.log(`订单 ${order_id} 不是个买入订单`);
            return;
        }
        amount = amount ? (amount > order.amount ? order.amount : amount) : order.amount;
        const cost = Game.market.calcTransactionCost(amount, this.name, order.roomName!);
        console.log(`订单 ${order_id}：以${order.price}的价格出售 ${order.resourceType} ${amount}个，手续费${cost}能量（${(cost/amount).toFixed(3)}/个），总收益${order.price * amount}`)
    };

    Object.defineProperty(Room.prototype, 'sources', {
        get: function () {
            if (this.memory.data && this.memory.data.sources.length == 0){
                const found = this.find(FIND_SOURCES) as Source[];
                found.sort((a, b) => {
                    return a.pos.x == b.pos.x ? a.pos.y - b.pos.y : a.pos.x - b.pos.x;
                })
                for (const source of found){
                    this.memory.data.sources.push({
                        id: source.id,
                        container: null,
                        link: null,
                        workPos: [0, 0],
                    })
                }
            }
            return this.memory.data.sources;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Room.prototype, 'mineral', {
        get: function () {
            if (this.memory.data && this.memory.data.mineral == null){
                const found = this.find(FIND_MINERALS) as Mineral[];
                if (found.length > 0){
                    this.memory.data.mineral = {
                        id: found[0].id,
                        container: null,
                    };
                }
            }
            return this.memory.data.mineral;
        },
        enumerable: false,
        configurable: true
    });
}
