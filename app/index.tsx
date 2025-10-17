import { MainScene } from "@/src/MainScene";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <View style={{ width: 200, height: 200, backgroundColor: "#00ffff" }}>
        <MainScene />
      </View>
    </View>
  );
}
