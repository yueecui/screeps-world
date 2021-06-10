import { sadaharu } from "./sadaharu";

export default function () {
    global.sadaharu = new sadaharu();
    global.sadaharu.hi()
}
