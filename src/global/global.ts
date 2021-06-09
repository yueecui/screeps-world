import { sadaharu } from "./sadaharu";

export const globalExtension = function () {
    global.init = function(){
        this.sadaharu = new sadaharu();
        this.sadaharu.hi()
    }
}
