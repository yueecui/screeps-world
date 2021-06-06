type AnySpawnEnergyStoreStructure = StructureExtension | StructureSpawn;


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
    /** 显示房间是否为我的，或是是否由我预定了 */
    my: boolean

    /**
     * 房间定期检查
     */
    tickCheck(): void;
    /**
     * 检查room的各个任务队列是否存在错误，如果存在就自动修复
     */
    errorCheck(): void;
    /**
     * 初始化memory
     */
    initMemory(): void;


    /** 更新room中各个建筑的数据（定期任务） */
    updateRoomStatus(): void;
    /** 更新container的数据 */
    updateRoomStatus_Container(all_containers: StructureContainer[]): void;
    /** 更新link的数据 */
    updateRoomStatus_Link(all_links: StructureLink[]): void;

    /** 获取本房间对应role的提前生成时间 */
    getSpawnAdvanceTime(base_name: string): number;
    /** 获取本房间对应role的生成数量 */
    getSpawnAmount(base_name: string): number;
    /**
     * 计算订单收益
     */
    calcPrice(order_id: string, amount?: number): void;
}
