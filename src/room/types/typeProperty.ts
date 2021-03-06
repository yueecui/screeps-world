// 扩展的属性
interface Room {
    // 引用属性
    sources: sourceInfo[]
    mineral: mineralInfo
    containers: containerInfo[]
    links: linkInfo[]
    towers: Id<StructureTower>[]
    spawns: StructureSpawn[]
    /* 房间代号，生成的工蚁都会以此开头 */
    code: string;
    /* 房间别名，用来判断工蚁所属的房间，例如新老代号接替时使用 */
    alias: string[];

    spawnConfig: Record<string, any>

    // 计算属性
    /** 显示房间是否为我的 */
    my: boolean
    /** 显示房间是否为我预定的 */
    myReserve: boolean

    /** 快捷方式 */
    storageLink: StructureLink|null
    controllerLink: StructureLink|null
    sourceLinks: StructureLink[]
    carriers: Creep[]
    task: {
        // 孵化任务
        spawn: Task<TASK_ANY>[],
        // 从集群（或能量container）往外运送
        give: Task<TASK_ANY>[],
        // 从外往集群运送
        take: Task<TASK_ANY>[],
        // 往返运送（如LAB）
        both: Task<TASK_ANY>[],
        // 集群任务（由MM执行）
        center: Task<TASK_ANY>[],

        doing: {[key:string]: Task<TASK_ANY>},
        status: {[key:string]: TaskId}
    }
    // 以下为过期测试
    tasks: Task<TASK_ANY>[]
    taskDoing: {[key:string]: Task<TASK_ANY>}
    taskStatus: {[key:string]: TaskId}


    /** 房间的定春布局数据，缓存到global中 */
    sada: SadaData|null
    /** 孵化时使用的能量顺序 */
    energyOrder: Id<StructureExtension|StructureSpawn>[]

    // 状态
    /** 是否处于有敌人的状态 */
    isUnderAttack: boolean;
    hasInvaderCore: boolean;
    /** 控制器的LINK是否需要能量 */
    controllerLinkNeedEnergy: boolean;


    // 存储数据的属性
    enemy: Creep
}
