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
    tasks: Task<TASK_ANY>[]
    taskDoing: Task<TASK_ANY>[]


    // 布局类型
    layout: LAYOUT_ANY
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
