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
    /** 显示房间是否为我的 */
    my: boolean
    /** 显示房间是否为我预定的 */
    myReserve: boolean
    storageLink: StructureLink|null
    controllerLink: StructureLink|null
    sourceLinks: StructureLink[]

    // 状态
    /** 是否处于有敌人的状态 */
    isUnderAttack: boolean;
    hasInvaderCore: boolean;
    /** 控制器的LINK是否需要能量 */
    controllerLinkNeedEnergy: boolean;

    /**
     * 房间定期检查
     */
    tickRun(): void;
    /**
     * 检查room的各个任务队列是否存在错误，如果存在就自动修复
     */
    errorCheck(): void;
    /**
     * 初始化memory
     */
    initMemory(): void;


    /** 更新room中各个建筑的数据（定期任务） */
    updateRoomStructureStatus(): void;
    /** 更新container的数据 */
    updateRoomStatus_Container(all_containers: StructureContainer[]): void;
    /** 更新link的数据 */
    updateRoomStatus_Link(all_links: StructureLink[]): void;

    /** 检查房间里是否出现了敌人 */
    checkEnemy(): void;

    /** 获取本房间对应role的提前生成时间 */
    getSpawnAdvanceTime(base_name: string): number;
    /** 获取本房间对应role的生成数量 */
    getSpawnAmount(base_name: string): number;

    /** 更新视觉效果 */
    updateVisual(): void;

    /** 计算房间内角色的数量 */
    countBaseNameCreeps(...base_name_list: string[]): number;
    /** 计算订单收益 */
    calcPrice(order_id: string, amount?: number): void;

    // -----------------------------------------------------
    // 孵化相关
    // -----------------------------------------------------

    /**
     * 获取房间扩展(Extension)的最大容量
     * @return number 根据controller等级返回容量值
     */
    getExtensionMaxCapacity(): number;
    /** 检查房间内是否孵化用能量没满，如果没满则缓存出所有没满的建筑列表 */
    checkSpawnEnergy(): void;
    /**
     * 获取所有还没有排入队列的需要补充孵化能量的建筑
     * @return array 每个元素是一个建筑的实例
     */
    getUnqueueTaskSpawn(): AnySpawnEnergyStoreStructure[];
    /**
     * 检查是否还有没进入队列的孵化能量建筑，协助creep判断是否需要进入搬运状态
     * @return boolean 判断结果
     */
    hasUnqueueTaskSpawn(): boolean;

    // -----------------------------------------------------
    // Tower相关
    // -----------------------------------------------------

  /**
   * 获取塔的最大能量
   * @return number 容量，目前是固定1000
   */
   getTowerMaxCapacity(): number;
   /**
    * 检查房间内的tower是否需要补充能量
    */
   checkTowerEnergy(): void;

   /**
    * 获取所有还没有排入队列的需要补充孵化能量的建筑
    * @return array 每个元素是一个建筑的实例
    */
   getUnqueueTaskTower(): StructureTower[];
   /**
    * 检查是否还有没进入队列的孵化能量建筑，协助creep判断是否需要进入搬运状态
    * @return boolean 判断结果
    */
   hasUnqueueTaskTower(): boolean;
}
