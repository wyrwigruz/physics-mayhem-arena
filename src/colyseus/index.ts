import { Client } from "colyseus.js";
const client = new Client("https://10ef95703748.ngrok-free.app");
interface MyState {

}

export async function connect(name:string){
    try {
        const room = await client.joinOrCreate("battle_ball", {name});
        console.log("joined successfully", room);
        room.onMessage("input", (message) => {
            console.log("message received from server");
            console.log(message);
        });
    } catch (e) {
        console.error("join error", e);
    }

}