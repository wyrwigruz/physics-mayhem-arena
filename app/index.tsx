import { MainScene } from "@/src/MainScene";
import { Client } from "colyseus.js";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const client = new Client();
client.joinOrCreate("my_room").then((room) => {
  room.onStateChange((state) => {
    console.log("onStateChange:", state);
  });

  room.onLeave((code) => console.log("code", code));
});

export default function Index() {
  return (
    <GestureHandlerRootView>
      <View style={styles.container}>
        <MainScene />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});
