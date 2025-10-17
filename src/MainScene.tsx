import {
  Camera,
  DefaultLight,
  FilamentScene,
  FilamentView,
  Model,
} from "react-native-filament";
import ball from "./../assets/images/ball.glb";

export function MainScene() {
  return (
    <FilamentScene>
      {/* 🏞️ A view to draw the 3D content to */}
      <FilamentView style={{ flex: 1 }}>
        {/* 💡 A light source, otherwise the scene will be black */}
        <DefaultLight />

        {/* 📦 A 3D model */}
        <Model source={ball} />

        {/* 📹 A camera through which the scene is observed and projected onto the view */}
        <Camera />
      </FilamentView>
    </FilamentScene>
  );
}
