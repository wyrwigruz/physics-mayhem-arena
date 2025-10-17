import { MainScene } from "@/src/MainScene";
import { StyleSheet, View, Button } from "react-native";
import {connect, useColyseusConnection} from '@/src/colyseus';
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function Index() {
  const {inputData, snapshotData} = useColyseusConnection('test2', 
  (inputMsg)=>{
    console.log("testowy A");
  }, 
  (snapshotMsg)=>{
    console.log("testowy B");
  });
  return (
    <GestureHandlerRootView>
      <View style={styles.container}>
        <Button title="connect" onPress={()=>{
          connect("test");
        }}/>
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
