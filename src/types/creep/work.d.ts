interface Creep{
    /**
     * 错误检查
     * @returns true表示有错误，false表示无错误
     */
    errorCheckHarvest(): boolean;
    /**
     * 前往采集点
     */
    goToSourceNode(): void;
    /**
     * 执行 WORK_HARVEST
     */
    doWorkHarvest(): void;

    /**
     * 执行 WORK_UPGRADE
     */
    doWorkUpgrade(): void;

    /**
     * 查找房间内可以建造的目标，如果找到就
     * 不足的情况下会设工作状态为WORK_TRANSPORTER_SPAWN
     * @returns 是否找到
     */
     findBuildTarget(): boolean;
}
