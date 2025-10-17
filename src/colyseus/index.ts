import { Client, Room } from "colyseus.js";
import { useState, useCallback, useEffect } from "react";
const client = new Client("ws://192.168.1.93:2567/");
interface UseColyseusConnectionProps {
  name: string;
  onInput?: (message: any) => void;
  onSnapshot?: (snapshot: any) => void;
}

export function useColyseusConnection({
  name,
  onInput,
  onSnapshot,
}: UseColyseusConnectionProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [inputData, setInputData] = useState<any>(null);
  const [snapshotData, setSnapshotData] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  const connect = useCallback(async () => {
    try {
      const roomInstance = await client.joinOrCreate("battle_ball", { name });
      console.log("Joined successfully:", roomInstance.id);
      setRoom(roomInstance);

      roomInstance.onMessage("input", (message) => {
        console.log("Input message received:", message);
        setInputData(message);
        if (onInput) onInput(message);
      });

      roomInstance.onMessage("snapshot", (snapshot) => {
        console.log("Snapshot received:", snapshot);
        setSnapshotData(snapshot);
        if (onSnapshot) onSnapshot(snapshot);
      });
    } catch (e) {
      console.error("Join error:", e);
      setError(e);
    }
  }, [name, onInput, onSnapshot]);

  // Automatycznie połącz, gdy `name` się zmieni
  useEffect(() => {
    if (name) {
      connect();
    }

    // rozłącz, gdy komponent się odmontowuje
    return () => {
      if (room) {
        console.log("Leaving room...");
        room.leave();
      }
    };
  }, [name]);

  return {
    room,
    inputData,
    snapshotData,
    error,
  };
}


export async function connect(name:string){
    try {
        console.log("dupa")
        const room = await client.joinOrCreate("battle_ball", {name});
        console.log("joined successfully", room);
        room.onMessage("input", (message) => {
            console.log("message received from server");
            console.log(message);
        });

        room.onMessage("snapshot", (snapshot) => {
            console.log("Received snapshot:", snapshot);
        });
    } catch (e) {
        console.log("join error", e);
    }

}