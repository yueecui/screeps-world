/*
使用方法：
require 后，控制台输入：

HelperRoomResource.showAllRes()

 */
function tips(text: string, tipStrArray: string[],id: number, left: number){
    left = left-1;
    left*=100;
    let showCore = tipStrArray.map(e=>"<t> "+e+" </t>").join("<br>")
    let time = Game.time;
    // log(showCore) // style="background-color: #333333"
return `<t class="a${id}-a${time}">${text}</t><script>
(() => {
    const button = document.querySelector(".a${id}-a${time}");
    let tip;
    button.addEventListener("pointerenter", () => {
        tip = document.createElement("div");
        tip.style.backgroundColor = "rgba(43,43,43,1)";
        tip.style.border = "1px solid";
        tip.style.borderColor = "#ccc";
        tip.style.borderRadius = "5px";
        tip.style.position = "absolute";
        tip.style.zIndex=10;
        tip.style.color = "#ccc";
        tip.style.marginLeft = "${left}px";
        tip.width = "230px";
        tip.innerHTML = "${showCore}"; button.append(tip);});
        button.addEventListener("pointerleave", () => {tip && (tip.remove(), tip = undefined);});
    })()
</script>
`.replace(/[\r\n]/g, "");
}

type ResourceRecord = {[key in ResourceConstant]?: number}

export default function(){
    (global as any).HelperRoomResource = {

        getStorageTerminalRes:function (room: Room){
            const store: ResourceRecord = {};
            if(room.storage) this.addStore(store,room.storage.store)
            if(room.terminal) this.addStore(store,room.terminal.store)
            // if(room.factory)pro.addStore(store,room.factory.store)
            return store
        },
        getMyAllRoomRes:function (){
            const rooms = _.values<Room>(Game.rooms).filter(e=>e.controller?.my&&(e.storage||e.terminal));
            const all: ResourceRecord = rooms.reduce((all, room)=> this.addStore(all,this.getStorageTerminalRes(room)),{});
            return all;
        },
        addStore:(store: ResourceRecord, b: ResourceRecord)=> {
            for(const name of Object.keys(b) as ResourceConstant[]) if (b[name]!>0) store[name]=(store[name]??0)+b[name]!;
            return store
        },
        showAllRes(){
            const rooms = _.values<Room>(Game.rooms).filter(e=>e.controller?.my&&(e.storage||e.terminal));
            const roomResAll = rooms.map(e=>[e.name,this.getStorageTerminalRes(e)]).reduce((map: {[roomName: string]: ResourceRecord},entry)=>{map[entry[0]] = entry[1];return map},{})
            const all = rooms.reduce((all: ResourceRecord, room)=> this.addStore(all,roomResAll[room.name]),{});

            // StrategyMarket.showAllRes()
            const time = Game.cpu.getUsed()
            const base: ResourceConstant[] = [RESOURCE_ENERGY,"U","L","K","Z","X","O","H",RESOURCE_POWER,RESOURCE_OPS]
            // 压缩列表
            const bars: ResourceConstant[] = [RESOURCE_BATTERY,RESOURCE_UTRIUM_BAR,RESOURCE_LEMERGIUM_BAR,RESOURCE_KEANIUM_BAR,RESOURCE_ZYNTHIUM_BAR,RESOURCE_PURIFIER,RESOURCE_OXIDANT,RESOURCE_REDUCTANT,RESOURCE_GHODIUM_MELT]
            // 商品
            const c_grey: ResourceConstant[] =[RESOURCE_COMPOSITE,RESOURCE_CRYSTAL,RESOURCE_LIQUID]
            const c_blue: ResourceConstant[] = [RESOURCE_DEVICE,RESOURCE_CIRCUIT,RESOURCE_MICROCHIP,RESOURCE_TRANSISTOR,RESOURCE_SWITCH,RESOURCE_WIRE,RESOURCE_SILICON].reverse()
            const c_yellow: ResourceConstant[] =[RESOURCE_MACHINE,RESOURCE_HYDRAULICS,RESOURCE_FRAME,RESOURCE_FIXTURES,RESOURCE_TUBE,RESOURCE_ALLOY,RESOURCE_METAL].reverse()
            const c_pink: ResourceConstant[] = [RESOURCE_ESSENCE,RESOURCE_EMANATION,RESOURCE_SPIRIT,RESOURCE_EXTRACT,RESOURCE_CONCENTRATE,RESOURCE_CONDENSATE,RESOURCE_MIST].reverse()
            const c_green: ResourceConstant[] =[RESOURCE_ORGANISM,RESOURCE_ORGANOID,RESOURCE_MUSCLE,RESOURCE_TISSUE,RESOURCE_PHLEGM,RESOURCE_CELL,RESOURCE_BIOMASS].reverse()
            // boost
            const b_grey: ResourceConstant[] =["OH","ZK","UL","G"]
            const gent =  (r: ResourceConstant) => [r+"H",r+"H2O","X"+r+"H2O",r+"O",r+"HO2","X"+r+"HO2"] as ResourceConstant[]
            const b_blue = gent("U")
            const b_yellow=gent("Z")
            const b_pink = gent("K")
            const b_green =gent("L")
            const b_withe =gent("G")


            const formatNumber=function (n: number) {
                var b = n.toString();
                var len = b.length;
                if (len <= 3) { return b; }
                var r = len % 3;
                return r > 0 ? b.slice(0, r) + "," + b.slice(r, len).match(/\d{3}/g)!.join(",") : b.slice(r, len).match(/\d{3}/g)!.join(",");
            }
            let str = ""
            let colorMap: {[K in ResourceConstant]?: string} = {
                [RESOURCE_ENERGY]:"rgb(255,242,0)",
                "Z":"rgb(247, 212, 146)",
                "L":"rgb(108, 240, 169)",
                "U":"rgb(76, 167, 229)",
                "K":"rgb(218, 107, 245)",
                "X":"rgb(255, 192, 203)",
                "G":"rgb(255,255,255)",
                [RESOURCE_BATTERY]:"rgb(255,242,0)",
                [RESOURCE_ZYNTHIUM_BAR]:"rgb(247, 212, 146)",
                [RESOURCE_LEMERGIUM_BAR]:"rgb(108, 240, 169)",
                [RESOURCE_UTRIUM_BAR]:"rgb(76, 167, 229)",
                [RESOURCE_KEANIUM_BAR]:"rgb(218, 107, 245)",
                [RESOURCE_PURIFIER]:"rgb(255, 192, 203)",
                [RESOURCE_GHODIUM_MELT]:"rgb(255,255,255)",
                [RESOURCE_POWER]:"rgb(224,90,90)",
                [RESOURCE_OPS]:"rgb(224,90,90)",
            }
            let id = 0
            const addList = function (list: ResourceConstant[], color?: string){
                const uniqueColor = function (str: string, resType: ResourceConstant){
                    if(colorMap[resType])str="<font style='color: "+colorMap[resType]+";'>"+str+"</font>"
                    return str
                }
                if(color)str+="<div style='color: "+color+";'>"
                let left = 0
                const getAllRoom = function (text: string, resType: ResourceConstant){
                    const arr = []
                    for(const roomName in roomResAll){
                        arr.push(_.padLeft(roomName,6)+":"+_.padLeft(formatNumber(roomResAll[roomName][resType]??0),9))
                    }
                    id+=1
                    left+=1
                    return tips(text,arr,id,left)
                }
                list.forEach(e=>str+=getAllRoom(uniqueColor(_.padLeft(e,15),e),e));str+="<br>";
                list.forEach(e=>str+=uniqueColor(_.padLeft(formatNumber(all[e]||0),15),e));str+="<br>";
                if(color)str+="</div>"
            }
            str+="<br>基础资源:<br>"
            addList(base)
            str+="<br>压缩资源:<br>"
            addList(bars)
            str+="<br>商品资源:<br>"
            addList(c_grey)
            addList(c_blue,"rgb(76, 167, 229)")
            addList(c_yellow,"rgb(247, 212, 146)")
            addList(c_pink,"rgb(218, 107, 245)")
            addList(c_green,"rgb(108, 240, 169)")
            str+="<br>LAB资源:<br>"
            addList(b_grey)
            addList(b_blue,"rgb(76, 167, 229)")
            addList(b_yellow,"rgb(247, 212, 146)")
            addList(b_pink,"rgb(218, 107, 245)")
            addList(b_green,"rgb(108, 240, 169)")
            addList(b_withe,"rgb(255,255,255)")
            console.log(str)

            return "Game.cpu.used:"+(Game.cpu.getUsed() - time)
        },
    }
}
