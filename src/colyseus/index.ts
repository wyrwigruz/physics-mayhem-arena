import { Client, Room } from "colyseus.js";
import { useState } from "react";
const client = new Client("ws://192.168.1.93:2567/");
interface UseColyseusConnectionProps {
  onInput?: (message: any) => void;
  onSnapshot?: (snapshot: any) => void;
}

export function useColyseusConnection({
  onInput,
  onSnapshot,
}: UseColyseusConnectionProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [inputData, setInputData] = useState<any>(null);
  const [snapshotData, setSnapshotData] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  const connect = async (name:string) => {
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
    };
  }
  
  return {
    room,
    inputData,
    snapshotData,
    error,
    connect,
  };
}