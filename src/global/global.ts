import { Sadaharu } from "./sadaharu";
import { ConsoleCommandRoom } from './cmdRoom';

export default function () {
    const G = global as any;
    for (const room_name in Game.rooms){
        const room = Game.rooms[room_name];
        if (room.my){
            G[room_name] = new ConsoleCommandRoom(room_name);
            if (!(room.code in G)) G[room.code] = G[room_name];
        }
    }
    G.sadaharu = new Sadaharu();
}
