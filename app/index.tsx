import { MainScene } from "@/src/MainScene";
import { Text, View, Button } from "react-native";
import {connect} from '../src/colyseus'

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
      <Button title="Connect" onPress={()=>{
        connect("test2")
      }} />
    </View>
  );
}
