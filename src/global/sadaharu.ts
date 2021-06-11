// 高15，宽17
// 中心点往左右是8，往上下是7

export class Sadaharu {
    room_name?: string;
    pos?: [number, number];

    constructor(){
        this.room_name = 'W41N54';
        this.pos = [20, 20];
    }

    setRoom(room_name: string|undefined){
        if (room_name != undefined){
            this.room_name = room_name;
            return `设置房间成功，当前显示房间 ${room_name}`;
        }else{
            this.room_name = undefined;
            return `清除房间设置成功`;
        }

    }
    setPos(x:number, y:number){
        this.pos = [x, y];
        return `设置坐标成功，当前中心坐标 ${x}, ${y}`;
    }

    hasVisual(){
        if (this.room_name == undefined) return false;
        if (this.pos == undefined) return false;
        // if (this.pos[0] - 8 < 2 || this.pos[0] + 8 > 47 || this.pos[1] - 7 < 2 || this.pos[1] + 7 > 47) return false;
        return true;
    }

    // 更新显示
    update(){
        if (!this.hasVisual()) return;

        const visual = new RoomVisual(this.room_name);
        this.show(visual);
    }

    // 显示定春布局
    show(visual: RoomVisual){
        const x = this.pos != undefined ? this.pos[0] : 25;
        const y = this.pos != undefined ? this.pos[1] : 25;
        // 画定春的轮廓
        visual.poly([
            [x,   y+7],
            [x-2, y+7],
            [x-6, y+3],
            [x-6, y+1],
            [x-7, y],
            [x-7, y-1],
            [x-6, y-2],
            [x-8, y-4],
            [x-8, y-7],
            [x-5, y-7],
            [x-4, y-6],
            [x-3, y-7],
            [x-2, y-6],
            // 后面是对称的
            [x+2, y-6],
            [x+3, y-7],
            [x+4, y-6],
            [x+5, y-7],
            [x+8, y-7],
            [x+8, y-4],
            [x+6, y-2],
            [x+7, y-1],
            [x+7, y],
            [x+6, y+1],
            [x+6, y+3],
            [x+2, y+7],
            [x,   y+7],
        ], {stroke: '#fff', strokeWidth: .15,
        opacity: .2, lineStyle: 'dashed'});
    }
}
