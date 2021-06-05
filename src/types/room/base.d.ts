type AnySpawnEnergyStoreStructure = StructureExtension | StructureSpawn;


interface Room {
    sources: sourceInfo[]
    mineral: mineralInfo
    containers: containerInfo[]
    links: Id<StructureLink>[]
    towers: Id<StructureTower>[]

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
    /**
     * 初始化source和mineral数据
     */
    initCollection(): void;


    /** 更新room中各个建筑的数据（定期任务） */
    updateRoomStatus(): void;
    /** 更新container的数据 */
    updateRoomStatus_Container(all_containers: StructureContainer[]): void;
    /** 更新link的数据 */
    updateRoomStatus_Link(all_links: StructureLink[]): void;
    /**
     * 获得room中所有我方spawns
     */
     getMySpawns(): StructureSpawn[];
    /**
     * 计算订单收益
     */
    calcPrice(order_id: string, amount?: number): void;
}
