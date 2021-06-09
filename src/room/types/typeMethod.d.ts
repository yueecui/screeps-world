type AnySpawnEnergyStoreStructure = StructureExtension | StructureSpawn;


// 扩展的方法
interface Room {
    /** 每tick执行任务 */
    run(): void;
    /** 检查room的各个任务队列是否存在错误，如果存在就自动修复 */
    errorCheck(): void;
    /** room数据初始化 */
    init(): void;
    /** room memory 初始化 */
    initMemory(): void;
    /** 生成孵化时使用能量的顺序 */
    generateEnergyOrder(): void;


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


type LAYOUT_ANY =
    | LAYOUT_FREE
    | LAYOUT_SADAHARU

type LAYOUT_FREE = 0
type LAYOUT_SADAHARU = 1



