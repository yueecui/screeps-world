// 高15，宽17
// 中心点往左右是8，往上下是7

const direction_to_color_map: Map<DirectionConstant, ColorConstant> = new Map([
    [TOP, COLOR_BROWN],
    [LEFT, COLOR_GREY],
    [RIGHT, COLOR_GREY],
    [BOTTOM, COLOR_BROWN],

    [TOP_LEFT, COLOR_RED],
    [TOP_RIGHT, COLOR_BLUE],
    [BOTTOM_LEFT, COLOR_ORANGE],
    [BOTTOM_RIGHT, COLOR_GREEN],
])

const color_to_direction_map: Map<ColorConstant, DirectionConstant> = new Map([
    [COLOR_RED, TOP_LEFT],
    [COLOR_BLUE, TOP_RIGHT],
    [COLOR_ORANGE, BOTTOM_LEFT],
    [COLOR_GREEN, BOTTOM_RIGHT],
])

const clearEditFlag = function(): void{
    // 删除中心旗子
    if (Game.flags['[EDIT]center']){
        Game.flags['[EDIT]center'].remove();
    }
    // 删除haru旗子
    for (let i=0;i<8;i++){
        if (Game.flags[`[EDIT]haru-${i+1}`]){
            Game.flags[`[EDIT]haru-${i+1}`].remove();
        }
    }
    // 删除haru旗子
    if (Game.flags['[EDIT]lab']){
        Game.flags['[EDIT]lab'].remove();
    }
}


class SadaharuLayout{
    // 是否显示这个数据
    show: boolean = true
    // 显示轮廓（最外圈的路）
    showContour: boolean = true
    visual: RoomVisual
    /** 是否正在编辑，编辑会显示flag */
    edit: boolean = false
    // 编辑时，是否拆分数据
    editSplit: boolean = false
    roomName: string
    data: SadaharuConfig = {
        center: [25, 25],
        haru: [],
        lab: [25, 25]
    }

    constructor(room_name:string){
        this.roomName = room_name;
        this.visual = new RoomVisual(this.roomName);
    }

    new(){
        this.data.center = [25, 25];
        this.resetPosByCenter();
    }

    stopEdit(){
        this.edit = false;
        clearEditFlag();
    }

    startEdit(split: boolean = false){
        if (Game.rooms[this.roomName]){
            this.edit = true;
            this.editSplit = split;
            return true;
        }else{
            return false;
        }
    }

    // 根据中心位置生成其他建筑的默认位置
    resetPosByCenter(){
        const x = this.data.center[0];
        const y = this.data.center[1];
        // 八组扩展的默认位置
        this.data.haru = [];
        this.data.haru.push([x-3, y+2, BOTTOM_LEFT]);
        this.data.haru.push([x+3, y+2, BOTTOM_RIGHT]);
        this.data.haru.push([x-4, y-1, BOTTOM_LEFT]);
        this.data.haru.push([x+4, y-1, BOTTOM_RIGHT]);
        this.data.haru.push([x-5, y-4, TOP_LEFT]);
        this.data.haru.push([x+5, y-4, TOP_RIGHT]);
        this.data.haru.push([x-3, y-5, BOTTOM_RIGHT, TOP]);
        this.data.haru.push([x+3, y-5, BOTTOM_LEFT, TOP]);

        this.data.lab = [x, y+4];
    }

    update(){
        this.updateFlags();
        this.drawCenter();
        if (this.showContour) this.drawContour();
        for (let index=0;index<this.data.haru.length;index++){
            this.drawHaru(index);
        }
        this.drawLab();
    }

    updateFlags(){
        // 有视野并且设定了旗子的情况下
        if (!(this.edit && Game.rooms[this.roomName])) return;
        const room = Game.rooms[this.roomName];
        // 检查中心旗子
        {
            const flag_name = '[EDIT]center';
            if (Game.flags[flag_name]){
                const flag = Game.flags[flag_name];
                this.data.center = [flag.pos.x, flag.pos.y];
                if (flag.pos.roomName != this.roomName){
                    this.roomName = flag.pos.roomName;
                    this.visual = new RoomVisual(this.roomName);
                }
                if (!this.editSplit) this.resetPosByCenter();
            }else{
                room.createFlag(this.data.center[0], this.data.center[1], flag_name, COLOR_YELLOW)
            }
        }
        if (!this.editSplit) return;
        // 检查haru旗子
        for (let i=0;i<this.data.haru.length;i++){
            const flag_name = `[EDIT]haru-${i+1}`;
            if (Game.flags[flag_name]){
                const flag = Game.flags[flag_name];
                let need_set_color = false;
                this.data.haru[i][0] = flag.pos.x;
                this.data.haru[i][1] = flag.pos.y;
                const direction = color_to_direction_map.get(flag.color);
                if (direction){
                    this.data.haru[i][2] = direction;
                }else{
                    need_set_color = true;
                }
                if (this.data.haru[i][3]){
                    // 上下
                    if (flag.secondaryColor == COLOR_BROWN){
                        switch(this.data.haru[i][2]){
                            case TOP_LEFT:
                            case TOP_RIGHT:
                                this.data.haru[i][3] = BOTTOM;
                                break;
                            case BOTTOM_LEFT:
                            case BOTTOM_RIGHT:
                                this.data.haru[i][3] = TOP;
                                break;
                        }
                    }
                    // 左右
                    else if (flag.secondaryColor == COLOR_GREY){
                        switch(this.data.haru[i][2]){
                            case TOP_LEFT:
                            case BOTTOM_LEFT:
                                this.data.haru[i][3] = RIGHT;
                                break;
                            case TOP_RIGHT:
                            case BOTTOM_RIGHT:
                                this.data.haru[i][3] = LEFT;
                                break;
                        }
                    }else{
                        need_set_color = true;
                    }
                }
                if (need_set_color){
                    if (this.data.haru[i][3]){
                        flag.setColor(direction_to_color_map.get(this.data.haru[i][2])!, direction_to_color_map.get(this.data.haru[i][3]!));
                    }else{
                        flag.setColor(direction_to_color_map.get(this.data.haru[i][2])!);
                    }
                }
            }else{
                if (this.data.haru[i][3]){
                    room.createFlag(
                        this.data.haru[i][0],
                        this.data.haru[i][1],
                        flag_name,
                        direction_to_color_map.get(this.data.haru[i][2]),
                        direction_to_color_map.get(this.data.haru[i][3]!),
                    )
                }else{
                    room.createFlag(
                        this.data.haru[i][0],
                        this.data.haru[i][1],
                        flag_name,
                        direction_to_color_map.get(this.data.haru[i][2])
                    )
                }

            }
        }
        // 检查haru旗子
        {
            const flag_name = '[EDIT]lab';
            if (Game.flags[flag_name]){
                const flag = Game.flags[flag_name];
                this.data.lab = [flag.pos.x, flag.pos.y];
            }else{
                room.createFlag(this.data.lab[0], this.data.lab[1], flag_name, COLOR_YELLOW)
            }
        }
    }

    drawCenter(){
        const x = this.data.center[0];
        const y = this.data.center[1];
        const contour_pos: [number, number][] = [[x-1, y-1], [x+1, y-1], [x+1, y], [x, y+1], [x-1, y], [x-1, y-1]];
        // lab区轮廓
        this.visual.poly(contour_pos, {stroke: '#fff', opacity: .3 });
        // spawn位置
        this.drawSpawn(x+1, y-1);
    }

    drawHaru(index: number){
        const haru_pos = this.getHaruPos(this.data.haru[index]);
        haru_pos.extension.push(haru_pos.extension[0]);

        this.visual.poly(haru_pos.extension, {stroke: '#00FF00', opacity: .3})
        if (haru_pos.spawn){
            this.drawSpawn(haru_pos.spawn[0], haru_pos.spawn[1]);
        }
        this.visual.text(''+(index+1), haru_pos.sub[0], haru_pos.sub[1], { font: 0.5, stroke: '#000' });
    }

    drawSpawn(x:number, y:number){
        this.visual.circle(x, y, { radius: 0.6, fill: '#FEE77B', opacity: 0.8})
        this.visual.text('Spawn', x, y+0.1, { font: 0.5, color: '#03ff15', stroke: '#000' })
    }

    getHaruPos(haru: Haru){
        const result: {
            sub: [number, number],
            extension: [number, number][],
            spawn?: [number, number],
        } = {
            sub: [0, 0],
            extension: []
        }
        const x = haru[0];
        const y = haru[1];
        let [x_fix, y_fix] = [1, 1];

        switch(haru[2]){
            case TOP_LEFT:
                [x_fix, y_fix] = [1, 1];break;
            case TOP_RIGHT:
                [x_fix, y_fix] = [-1, 1];break;
            case BOTTOM_LEFT:
                [x_fix, y_fix] = [1, -1];break;
            case BOTTOM_RIGHT:
                [x_fix, y_fix] = [-1, -1];break;
        }

        // 副坐标（6个的中心）位置
        const sub_offset = [-1, -1];
        result.sub = [x+sub_offset[0]*x_fix, y+sub_offset[1]*y_fix];

        const extension_offset = {
            normal: [[-1, 0], [-2, 0], [-2, -1], [-1, -2], [0, -2], [0, -1]],
            spawn: [[1, 0], [0, 1]],
        }
        for (const offset of extension_offset.normal){
            result.extension.push([x+offset[0]*x_fix, y+offset[1]*y_fix]);
        }
        if (!haru[3]){
            for (const offset of extension_offset.spawn){
                result.extension.push([x+offset[0]*x_fix, y+offset[1]*y_fix]);
            }
        }

        // 如果有spawn
        switch(haru[3]){
            case TOP:
                result.spawn = [x, y-1];break;
            case LEFT:
                result.spawn = [x-1, y];break;
            case RIGHT:
                result.spawn = [x+1, y];break;
            case BOTTOM:
                result.spawn = [x, y+1];break;
        }

        return result;
    }

    drawLab(){
        const x = this.data.lab[0];
        const y = this.data.lab[1];
        const nuker: [number, number] = [x, y-1]
        const contour_pos: [number, number][] = [nuker, [x-2, y+1], [x-2, y+2], [x+2, y+2], [x+2, y+1], nuker];
        // lab区轮廓
        this.visual.poly(contour_pos, {stroke: '#fff', opacity: .3 });
        // nuker位置
        this.visual.circle(nuker[0], nuker[1], { radius: 0.5, fill: '#ff2c2c'})
        this.visual.text('Nuker', nuker[0], nuker[1]+0.1, { color: '#ffb503',font: 0.5, stroke: '#000' })
    }

    /** 显示外轮廓 */
    drawContour(){
        const x = this.data.center[0];
        const y = this.data.center[1];
        // 最外圈路的轮廓
        this.visual.poly([
            [x,   y+7], [x-2, y+7], [x-6, y+3], [x-6, y+1], [x-7, y], [x-7, y-1], [x-6, y-2], [x-8, y-4], [x-8, y-7], [x-5, y-7], [x-4, y-6], [x-3, y-7], [x-2, y-6],
            [x+2, y-6], [x+3, y-7], [x+4, y-6], [x+5, y-7], [x+8, y-7], [x+8, y-4], [x+6, y-2], [x+7, y-1], [x+7, y], [x+6, y+1], [x+6, y+3], [x+2, y+7], [x,   y+7],
        ], {stroke: '#fff', strokeWidth: .15, opacity: .2, lineStyle: 'dashed'});
    }
}


export class Sadaharu {
    // flag前缀，假设flag前缀为abc
    // abc 为中心定位，abc_LEFT 则表示“上”的方向为左，只写abc时为上
    // abc-1_TOP_LEFT 数字表示第几组，后面为扩展方向，只能为斜着，必须指定，不能默认
    // abc-lab 为lab区的定位坐标，abc-lab_LEFT 则表示“上”的方向为左，只写abc-lab时为上

    //
    data: {[key:string]: SadaharuLayout} = {};
    _edit: string|null = null;

    constructor(){
        clearEditFlag();
        if (Game.rooms.sim){
            this.load('sim');
            this.edit('sim');
        }
    }

    new(room_name: string){
        this.data[room_name] = new SadaharuLayout(room_name);
        this.data[room_name].new();
        this.show(room_name);
        return `Room [${room_name}] 的数据新建成功`;
    }

    close(room_name: string){
        if (!this.data[room_name]) return `Room [${room_name}] 的数据不存在`;
        if (this._edit == room_name) this.edit(room_name);
        delete this.data[room_name];
        return `Room [${room_name}] 的数据已关闭`;
    }

    show(room_name: string){
        if (!this.data[room_name]) return `Room [${room_name}] 的数据不存在`;
        this.data[room_name].show = true;
        return `Room [${room_name}] 示意线显示`;
    }

    hide(room_name: string){
        if (!this.data[room_name]) return `Room [${room_name}] 的数据不存在`;
        if (this._edit == room_name) this.edit(room_name);
        this.data[room_name].show = false;
        return `Room [${room_name}] 示意线隐藏`;
    }

    edit(room_name?: string, split?: boolean){
        if (room_name == undefined){
            if (this._edit == undefined){
                return `没有正在进行的编辑`
            }else{
                this.data[this._edit].stopEdit();
                const edit_name = this._edit;
                this._edit = null;
                return `Room [${edit_name}] 已经停用编辑`;
            }
        }else {
            if (!this.data[room_name]) return `Room [${room_name}] 的数据不存在`;
            if (this._edit){
                this.data[this._edit].stopEdit();
                const current_name = this._edit;
                this._edit = null;
                if (current_name == room_name){
                    return `Room [${current_name}] 已经停用编辑`;
                }else{
                    return `Room [${current_name}] 正在使用编辑，已关闭，请再次执行指令`;
                }
            }else{
                if (this.data[room_name].startEdit(split)){
                    this._edit = room_name;
                    return `Room [${room_name}] 已经启用编辑`;
                }else{
                    return `Room [${room_name}] 启用编辑失败，可能是因为没有视野`;
                }
            }
        }

    }

    reset(room_name: string){
        if (!this.data[room_name]) return `Room [${room_name}] 的数据不存在`;
        if (this._edit == room_name) this.edit(room_name);
        this.data[room_name].resetPosByCenter();
        return `Room [${room_name}] 的坐标已按中心重置`;
    }

    save(room_name: string){
        if (!this.data[room_name]) return `Room [${room_name}] 的数据不存在`;
        Memory.sadaharuConfigs[room_name] = JSON.parse(JSON.stringify(this.data[room_name].data));
        return `Room [${room_name}] 数据已经保存到Memory`;
    }

    load(room_name: string){
        if (room_name == this._edit) this.edit(room_name);
        if (!Memory.sadaharuConfigs[room_name]) return `Memory中没有 Room [${room_name}] 的数据`;
        if (this.data[room_name] == undefined){
            this.new(room_name)
        }
        this.data[room_name].data = JSON.parse(JSON.stringify(Memory.sadaharuConfigs[room_name]));
        return `Memory中的Room [${room_name}] 的数据已加载`;
    }

    delete(room_name: string){
        if (!Memory.sadaharuConfigs[room_name]) return `Memory中没有 Room [${room_name}] 的数据`;
        delete Memory.sadaharuConfigs[room_name];
        return `Memory中的Room [${room_name}] 的数据已删除`;
    }

    update(){
        for (const key in this.data){
            if (this.data[key].show) this.data[key].update();
        }
    }
}
