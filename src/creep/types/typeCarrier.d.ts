// 运输相关方法接口扩展
interface Creep {
    /** 检查是否拥有可以完成任务的存储量 */
    hasEnoughCapacity(task: Task<TASK_ANY>): boolean;
    /** 预定货物 */
    hasEnoughCargo(task: Task<TASK_ANY>): boolean;
    /** 接受发过来的新任务 */
    acceptTask(task: Task<TASK_ANY>): TaskCargo;
    /** 执行任务，返回值为是否执行了操作 */
    doTask(): boolean;
    /** 获取任务信息 */
    getTaskInfo(task_id: TaskId): Task<TASK_ANY>|undefined;
    /** 任务完成后的处理 */
    completeTask(task: Task<TASK_ANY>): void;
    /** 删除掉任务的处理 */
    removeTask(task: Task<TASK_ANY>, recreate?: boolean): void;
    /** 预定货物 */
    orderCargo(task: Task<TASK_ANY>, room: Room): boolean;
    /** 取得货物 */
    obtainCargo(task: Task<TASK_ANY>): boolean;


    /** 执行任务：给塔补充能量 */
    doTaskTowerEnergy(task: Task<TASK_TOWER_ENERGY>): boolean;



    /**
     * 检查房间的孵化能量是否足够，
     * 不足的情况下会设工作状态为 WORK_TRANSPORTER_SPAWN
     * @returns 是否成功变化工作状态
     */
    checkWorkTransporterSpawn(): boolean;
    /**
     * 执行 WORK_TRANSPORTER_SPAWN
     */
    doWorkTransporterSpawn(): void;

    /**
     * 检查房间的塔能量是否需要补充
     * 有需要补充能量的塔时，设工作状态为 WORK_TRANSPORTER_TOWER
     * @returns 是否成功变化工作状态
     */
    checkWorkTransporterTower(): boolean;
    /**
     * 执行 WORK_TRANSPORTER_TOWER
     */
    doWorkTransporterTower(): void;
    /**
     * 检查房间是否有能量不足的控制器存储器
     * 如果有，设工作状态为 WORK_TRANSPORTER_CONTROLLER
     * @returns 是否成功变化工作状态
     */
     checkWorkTransporterController(): boolean;
    /**
     * 执行 WORK_TRANSPORTER_CONTROLLER
     */
     doWorkTransporterController(): void;
    /**
     * 检查房间的source container是否接近满了
     * 如果有，设工作状态为 WORK_TRANSPORTER_STORAGE_ENERGY
     * @returns 是否成功变化工作状态
     */
    checkWorkTransporterStorage_Energy(): boolean;
    /**
     * 执行 WORK_TRANSPORTER_STORAGE_ENERGY
     */
    doWorkTransporterStorage_Energy(): void;
    /**
     * 检查房间的mineral container是否接近满了
     * 如果有，设工作状态为 WORK_TRANSPORTER_STORAGE_MINERAL
     * @returns 是否成功变化工作状态
     */
    checkWorkTransporterStorage_Mineral(): boolean;
    /**
     * 执行 WORK_TRANSPORTER_STORAGE_MINERAL
     */
    doWorkTransporterStorage_Mineral(): void;

    checkWorkTransporterTombstone(): boolean;
    doWorkTransporterTombstone(): void;
}
