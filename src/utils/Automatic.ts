const cleanCreepsMemory = function() : void{
    // 清理虫子的Memory
    for (const name in Memory.creeps){
        if (!(name in Game.creeps)){
            delete Memory.creeps[name];
        }
    }
    console.log(`[${Game.time}]Memory清理完成！`);
}

// 全局定期自动事务
export const Automatic = {
    run: function(): void{
        if (Game.time % 100 == 0){
            cleanCreepsMemory();
        }
    },
}
