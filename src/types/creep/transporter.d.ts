// 运输相关方法接口扩展
interface Creep {
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
}
