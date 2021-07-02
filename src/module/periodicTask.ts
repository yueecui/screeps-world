const cleanCreepsMemory = function() : void{
    // 清理虫子的Memory
    for (const name in Memory.creeps){
        if (!(name in Game.creeps)){
            delete Memory.creeps[name];
        }
    }
    console.log(`[${Game.time}] Memory清理完成！`);
}

// 全局定期自动事务
export default function(): void{
    Game.spawningInTick = [];
    // 每tick状态记录
    Game.status = {
        links: {}
    }
    if (Game.time % 1000 == 0){
        cleanCreepsMemory();
    }
    // 保存bucket
    if (Game.cpu.bucket == 10000){
        Game.cpu.generatePixel();
    }
}
