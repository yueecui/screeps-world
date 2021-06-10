import { Sadaharu } from "./sadaharu";
import { ConsoleCommandRoom } from './cmdRoom';

export default function () {
    for (const room_name in Game.rooms){
        const room = Game.rooms[room_name];
        if (room.my){
            (global as any)[room_name] = new ConsoleCommandRoom(room_name);
        }
    }
    // (global as any).sadaharu = new sadaharu();
    global.abc = new Sadaharu();
}
