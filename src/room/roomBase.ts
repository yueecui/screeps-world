import { SadaData } from "./class/sadaData";

interface findPosParam{
    pos: RoomPosition,
    range: number,
    include?: boolean
}

export default function () {
    // 每tick检查的主方法
    Room.prototype.run = function() {
        // 房间的Global.cache和Memory初始化
        this.init();

        // 定期检查
        if (Game.time % 5 == 0){
            if (!this.isUnderAttack) this.checkEnemy();
            this.checkTowerEnergy();
            // this.memory.lastSpawnTime = (this.energyAvailable < this.energyCapacityAvailable || this.energyAvailable == 300) ? 1 : 0;
        }
        if (this.memory.flagPurge || Game.time % 20 == 0){

            // 以下为旧模式任务
            // 强制刷新孵化能量任务队列
            this.memory.lastSpawnTime = 1
            this.updateRoomStructureStatus();   // 重新缓存特定建筑信息（例如塔）
            this.errorCheck();                  // 检查各个任务队列是否存在错误
        }

        if (this.memory.flagPurge){
            console.log(`[${Game.time}] Room ${this.name} 强制刷新缓存完成`);
            this.memory.flagPurge = FALSE;
        }

        // 每tick任务
        if (this.isUnderAttack) this.checkEnemy();      // 受到攻击的情况下每回合检测敌人
        this.checkSpawnEnergy();                        // 只有刷新时间不为0时才执行
        this.linkRun();                                 // 运转所有link
        this.updateVisual();                            // 刷新界面显示

        // 如果有配置外矿的话，外矿有视野就检查外矿
        for (const name of this.memory.roomConfig.outside){
            if (Game.rooms[name]) Game.rooms[name].run();
        }

        // 检查塔
        for (const tower_id of this.towers){
            const tower = Game.getObjectById(tower_id);
            if (tower) tower.work();
        }

        // 分配任务
        // this.assignTask();
    }

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
                && _.filter(this.containers, (c)=>{ return c.id == plan.sid }).length > 0){
                newPlan.push(plan);
            }
        }
        this.memory.energyPlan = newPlan;
    }

    Room.prototype.init = function(){
        // 已经初始化，并且可用的孵化能量没变化的情况下就不重制，不然重置
        if (global.cache.rooms[this.name]?.init && global.cache.rooms[this.name]?.energy == this.energyCapacityAvailable) return;

        // 初始化 Memory，不改代码其实不会需要再执行，所以每次全局重置时初始化即可
        this.initMemory();

        // 初始化 global的缓存
        global.cache.rooms[this.name] = {
            init: true,
            // 可用的孵化能量
            energy: this.energyCapacityAvailable,
        }

        // 以下只有属于我的房间才进行初始化
        if (this.my){
            // 初始化定春布局数据
            const cache = global.cache.rooms[this.name];
            if (this.memory.layout == LAYOUT_SADAHARU){
                const sada_config = Memory.sadaharuConfigs[this.name];
                if (sada_config){
                    cache.sadaData = new SadaData(this, sada_config);
                }
            }
            // 生成能量顺序
            this.generateEnergyOrder();
        }
    }

    Room.prototype.generateEnergyOrder = function(){
        const cache = global.cache.rooms[this.name];
        // 生成顺序
        if (cache.sadaData){
            cache.energyOrder = cache.sadaData.energyOrder;
        }else{
            const found = this.find(FIND_MY_STRUCTURES, { filter: (struct) => { return struct.isActive() && (struct.structureType == STRUCTURE_SPAWN || struct.structureType == STRUCTURE_EXTENSION) }}) as (StructureExtension|StructureSpawn)[];
            let center_pos: RoomPosition;
            if (this.storage){
                center_pos = this.storage.pos;
            }else{
                const first_spawn = this.spawns[0];
                if (first_spawn){
                    center_pos = first_spawn.pos;
                }else{
                    center_pos = new RoomPosition(25, 25, this.name);
                }
            }
            found.sort((a, b) =>{ return center_pos.getRangeTo(a) - center_pos.getRangeTo(b); });
            cache.energyOrder = found.map((struct)=>{return struct.id;});
        }
    }

    Room.prototype.initMemory = function(){
        const new_memory: RoomMemory = {
            flagPurge: this.memory.flagPurge ?? TRUE,
            lastSpawnTime: this.memory.lastSpawnTime ?? 0,
            layout: this.memory.layout ?? LAYOUT_FREE,
            data: this.memory.data ?? {
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
            },
            status: this.memory.status ?? {
                underAttack: FALSE,
            },
            roomConfig: this.memory.roomConfig ?? {
                code: this.name,
                resShowPos: [0, 0],
                outside: [],
            },
            spawnConfig: this.memory.spawnConfig ?? {
                advance: {},
                amount: {},
            },
            creepConfig: this.memory.creepConfig ?? {
                stay: {},
            },
            // 以下为测试
            tasks: this.memory.tasks ?? [],
            taskDoing: this.memory.taskDoing ?? {},
            taskStatus: this.memory.taskStatus ?? {},
            // 以下即将过期
            taskSpawn: this.memory.taskSpawn ?? {},
            taskTowers: this.memory.taskTowers ?? {},
            energyPlan: this.memory.energyPlan ?? [],
        }

        this.memory = new_memory;
    }


     // 缓存特定建筑的Id
     Room.prototype.updateRoomStructureStatus = function(){
        const all_structures = this.find(FIND_STRUCTURES);

        // 检查可能过期的建筑
        for (const source_info of this.sources){
            if (Game.getObjectById(source_info.link!) == null){
                source_info.link = null;
            }
            if (Game.getObjectById(source_info.container!) == null){
                source_info.container = null;
            }
        }
        if (this.mineral && Game.getObjectById(this.mineral.container!) == null){
            this.mineral.container = null;
        }

        // 所有的塔
        this.memory.data.towers = _.map(_.filter(all_structures, {structureType: STRUCTURE_TOWER}) as StructureTower[], 'id');
        // 所有的container
        this.updateRoomStatus_Container(_.filter(all_structures, {structureType: STRUCTURE_CONTAINER}) as StructureContainer[]);
        // 所有的link
        this.updateRoomStatus_Link(_.filter(all_structures, {structureType: STRUCTURE_LINK}) as StructureLink[]);
    };

    Room.prototype.updateRoomStatus_Container = function(all_containers){
        const new_containers_info_map: Record<string, containerInfo> = {};
        for (const container of all_containers){
            new_containers_info_map[container.id] = {
                id: container.id,
                type: CONTAINER_TYPE_NONE,
            }
        }
        for (const container of this.containers){
            if (container.id in new_containers_info_map){
                new_containers_info_map[container.id].type = container.type
            }
        }
        // 重新生成数据
        this.containers = [];
        for (const container_id in new_containers_info_map){
            const container_info = new_containers_info_map[container_id];
            if (container_info.type == CONTAINER_TYPE_NONE){
                container_info.type = ((container_id: Id<StructureContainer>) => {
                    const container = Game.getObjectById(container_id)!;
                    // 判断是否为mineral的container
                    if (this.mineral && this.mineral.container == null
                        && container.pos.getRangeTo(Game.getObjectById(this.mineral.id)!) <= 2){
                            const found = Game.getObjectById(this.mineral.id)!.pos.lookFor(LOOK_STRUCTURES);
                            if (found[0] && found[0].structureType == STRUCTURE_EXTRACTOR){
                                this.mineral.container = container_id;
                                return CONTAINER_TYPE_MINERAL;
                            }
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
                            this.memory.data.controller.workPos.sort((a, b) => {
                                const pos_a = new RoomPosition(a[0], a[1], this.name);
                                const pos_b = new RoomPosition(b[0], b[1], this.name);
                                return pos_a.getRangeTo(this.controller!) - pos_b.getRangeTo(this.controller!);
                            })

                            return CONTAINER_TYPE_CONTROLLER;
                    }
                    return CONTAINER_TYPE_NONE;
                })(container_id as Id<StructureContainer>);
            }
            this.containers.push(container_info);
        }
        // 重新排序
        this.containers.sort((a, b) => {
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

    Room.prototype.checkEnemy = function(){
        if (this.find(FIND_HOSTILE_CREEPS).length > 0){
            this.memory.status.underAttack = TRUE;
        }else{
            this.memory.status.underAttack = FALSE;
        }
        if (!this.isUnderAttack){
            if (this.find(FIND_HOSTILE_STRUCTURES).length > 0){
                this.memory.status.hasInvaderCore = TRUE;
            }else{
                this.memory.status.hasInvaderCore = FALSE;
            }
        }
    }

    Room.prototype.getSpawnAdvanceTime = function (base_name: string){
        if (!('advance' in this.spawnConfig)) this.spawnConfig.advance = {};
        return this.spawnConfig.advance[base_name] ? this.spawnConfig.advance[base_name] : 0;
    }
    Room.prototype.getSpawnAmount = function (base_name: string){
        if (!('amount' in this.spawnConfig)) this.spawnConfig.amount = {};
        return this.spawnConfig.amount[base_name] != null ? this.spawnConfig.amount[base_name] : -1;
    }

    Room.prototype.updateVisual = function (){
        // 控制器进度
        if (this.controller && this.controller.my && this.controller.level < 8){
            this.visual.text(
                ((this.controller.progress /this.controller.progressTotal) * 100).toFixed(2) + '%',
                this.controller.pos,
                {
                    font: 0.5,
                    stroke: '#000000'
                }
            )
        }
        // 孵化器进度
        for (const spawn of this.spawns){
            if (spawn.spawning && spawn.spawning.remainingTime > 1){
                this.visual.text(
                    (spawn.spawning.remainingTime-1) + 't',
                    spawn.pos,
                    {
                        font: 0.5,
                        stroke: '#000000'
                    }
                )
                this.visual.text(
                    spawn.spawning.name,
                    spawn.pos.x, spawn.pos.y+1,
                    {
                        color: '#9bb8ef',
                        font: 0.4,
                        stroke: '#000000'
                    }
                )
            }
        }
        // 矿物残量或重生时间
        if (this.mineral){
            const mineral = Game.getObjectById(this.mineral.id)!;
            if (mineral.ticksToRegeneration > 0){
                this.visual.text(
                    (mineral.ticksToRegeneration) + 't',
                    mineral.pos,
                    {
                        color: '#989898',
                        font: 0.4,
                        stroke: '#000000'
                    }
                )
            }else{
                this.visual.text(
                    ''+mineral.mineralAmount,
                    mineral.pos,
                    {
                        color: '#86ff78',
                        font: 0.4,
                        stroke: '#000000'
                    }
                )
            }
        }
    }

    Room.prototype.countBaseNameCreeps = function (...base_name_list){
        let count = 0;
        const code_lived_creeps = Game.allLivedCreeps[this.code] || {};
        for (const base_name of base_name_list){
            if (base_name in code_lived_creeps){
                count += code_lived_creeps[base_name].length;
            }
        }
        return count;
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
