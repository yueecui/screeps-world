interface StructureTower{
    work(): void;

    // 计算塔对目标的伤害
    calcDamage(target: Creep|PowerCreep): number;
}
