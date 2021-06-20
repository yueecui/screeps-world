interface StructureTower{
    work(): void;

    /** 检查能量状态，能量低于某个数值时进行补充 */
    checkStatus(): void;

    // 计算塔对目标的伤害
    calcDamage(target: Creep|PowerCreep): number;
}
