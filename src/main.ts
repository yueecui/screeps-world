import Mount from '@/mount';
Mount();  // 对原型进行扩展

import PeriodicTask from '@/module/periodicTask';
import SpawnManager from '@/spawn/spawnManager';

module.exports.loop = () => {
    // 定期事务
    PeriodicTask();
    // 蚂蚁孵化管理器
    SpawnManager();

    // 检查所有自己的房间
    // 外矿有可能没有视野，所以在自己房间的检查内部进行检查
    for(const name in Game.rooms) {
        if (!Game.rooms[name].my) continue;
        Game.rooms[name].run();
    }

    // 运转所有小虫
    // 需要在room后面运行，因为room会生成任务
    for(const name in Game.creeps) {
        Game.creeps[name].run();
    }

    // 全局事务刷新
    global.update();
};
