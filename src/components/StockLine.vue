<template>
  <canvas id="renderCanvas" ref="renderCanvas"></canvas>
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue';
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders'; // 确保加载器已导入

const renderCanvas = ref(null);

let engine, scene;
const initializeBabylon = () => {
  console.log('initializeBabylon');

  // 创建引擎实例，启用抗锯齿
  engine = new BABYLON.Engine(renderCanvas.value, true);

  //创建场景
  scene = createScene();

  // 创建和管理渲染循环
  engine.runRenderLoop(() => {
    //渲染场景
    scene.render();
  });

  // 处理画布大小调整
  window.addEventListener('resize', () => {
    engine.resize();
  });
};

// 创建场景
const createScene = () => {
  const scene = new BABYLON.Scene(engine);

  // 创建弧旋转相机 (ArcRotateCamera允许用户围绕目标点进行旋转、缩放和倾斜)
  const camera = new BABYLON.ArcRotateCamera(
    'camera1',
    Math.PI / 2, //水平旋转角度
    Math.PI / 4, // 垂直旋转角度
    10, // 相机缩放级别
    new BABYLON.Vector3(0, 0, 0), //相机围绕旋转的中心点
    scene
  );
  // 将相机的控制附加到指定元素上
  camera.attachControl(renderCanvas.value, true);

  // 创建环境光(半球光)
  const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(1, 1, 0), scene);
  light.intensity = 2;

  // 创建地平面
  // const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 10, height: 10 }, scene);

  // 创建天空盒  https://doc.babylonjs.com/features/featuresDeepDive/environment/skybox
  const skybox = BABYLON.MeshBuilder.CreateBox('skyBox', { size: 1000.0 }, scene);
  // 创建天空盒材质并禁用进行背面剔除
  const skyboxMaterial = new BABYLON.StandardMaterial('skyBox', scene);
  skyboxMaterial.backFaceCulling = false;
  // 设置反射纹理并设置纹理的坐标模式
  // 立方体贴图 正 X（px）、负 X（nx）、正 Y（py）、负 Y（ny）、正 Z（pz）、负 Z（nz）
  //  'https://www.babylonjs-playground.com/textures/TropicalSunnyDay'
  // skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture('/public/textures/skybox/', scene, [
  //   'px.png',
  //   'nx.png',
  //   'py.png',
  //   'ny.png',
  //   'pz.png',
  //   'nz.png',
  // ]);
  skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(
    'https://www.babylonjs-playground.com/textures/TropicalSunnyDay',
    scene
  );
  // skyboxMaterial.reflectionTexture = skyboxCubeTexture;
  skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
  // 设置材质颜色
  skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0); // 漫反射颜色 黑色不使用
  skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0); // 镜面反射颜色 黑色不使用
  // 应用材质到天空盒
  skybox.material = skyboxMaterial;

  // 加载 glTF 模型
  BABYLON.SceneLoader.Append(
    '/public/model/silo/',
    'e.glb',
    scene,
    function (scene) {
      console.log('glTF 模型已加载');
      // 查找并修改模型的材质
      scene.meshes.forEach((mesh) => {
        if (mesh.material) {
          console.log(mesh.name);
        }
        // if (mesh.material) {
        //   // 创建新的纹理
        //   const newTexture = new BABYLON.Texture('/path/to/your/texture.jpg', scene);
        //   // 应用新纹理到材质
        //   mesh.material.albedoTexture = newTexture;
        // }
      });
    },
    null,
    function (scene, message) {
      console.error('glTF 模型加载失败', message);
    }
  );

  return scene;
};

onMounted(() => {
  initializeBabylon();
});
</script>

<style lang="scss">
#renderCanvas {
  width: 100vw;
  height: 100vh;
  display: block;
}
</style>
