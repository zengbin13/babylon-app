<template>
  <canvas id="village" ref="villageRef"></canvas>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';

const villageRef = ref(null);

let scene, engine;

const initializeBabylon = () => {
  engine = new BABYLON.Engine(villageRef.value, true);
  scene = createScene();

  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener('resize', () => {
    engine.resize();
  });
};

// 创建场景
const createScene = () => {
  const scene = new BABYLON.Scene(engine);
  createCamera(scene);
  createLight(scene);
  // importGLB(scene);
  createVillAge();
  return scene;
};

const createCamera = (scene) => {
  const camera = new BABYLON.ArcRotateCamera(
    'camera',
    -Math.PI / 2,
    Math.PI / 2.5,
    20,
    new BABYLON.Vector3(0, 0, 0),
    scene
  );

  camera.attachControl(villageRef.value, true);

  return camera;
};

const createLight = (scene) => {
  const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 0.8;
  return light;
};

const importGLB = async (scene) => {
  try {
    const result = await BABYLON.SceneLoader.ImportMeshAsync(
      '',
      'https://assets.babylonjs.com/meshes/',
      'both_houses_scene.babylon',
      scene
    );
    const house1 = scene.getMeshByName('detached_house');
    house1.position.y = 2;
    const house2 = result.meshes[2];
    house2.position.y = 1;
  } catch (error) {
    //
  }
};

// 创建村庄场景
const createVillAge = () => {
  createGround();
  createHouse();

  // 添加声音
  const sound = new BABYLON.Sound('sound', '/music/qianxun.mp3', scene, null, {
    loop: true,
    autoplay: true,
  });
};

const createGround = () => {
  // 创建地面
  const ground = BABYLON.MeshBuilder.CreateGround(
    'ground',
    {
      width: 50,
      height: 50,
    },
    scene
  );
  const groundMat = new BABYLON.StandardMaterial('groundMat', scene);
  groundMat.diffuseColor = new BABYLON.Color3(0, 1, 0);
  ground.material = groundMat;
};

// 小房子
const createDetachedHouse = () => {
  // 创建盒子(房屋)
  const faceUV = [
    // 0(背面)、1(正面)、2(右)、3(左)、4(顶部)和5(底部)
    // (起始U值, 起始V值, 结束U值, 结束V值) 范围0-1
    new BABYLON.Vector4(0.5, 0.0, 0.75, 1.0),
    new BABYLON.Vector4(0, 0, 0.25, 1),
    new BABYLON.Vector4(0.25, 0, 0.5, 1.0),
    new BABYLON.Vector4(0.75, 0, 1.0, 1.0),
  ];
  const box = BABYLON.MeshBuilder.CreateBox(
    'box',
    {
      size: 1,
      faceUV,
      wrap: true,
    },
    scene
  );
  box.position.y = 0.5;
  const boxMat = new BABYLON.StandardMaterial('boxMat', scene);
  boxMat.diffuseTexture = new BABYLON.Texture(
    'https://assets.babylonjs.com/environments/cubehouse.png',
    scene
  );
  box.material = boxMat;

  // 创建菱柱(房顶)
  const roof = BABYLON.MeshBuilder.CreateCylinder(
    'roof',
    {
      diameter: 1.3,
      height: 1.2,
      tessellation: 3,
    },
    scene
  );
  roof.scaling.x = 0.75;
  roof.scaling.y = 1;
  roof.rotation.z = Math.PI / 2;
  roof.position.y = 1.22;

  const roofMat = new BABYLON.StandardMaterial('roofMat', scene);
  roofMat.diffuseTexture = new BABYLON.Texture(
    'https://assets.babylonjs.com/environments/roof.jpg',
    scene
  );
  roof.material = roofMat;

  // 组合房屋(合并网格)
  const house = BABYLON.Mesh.MergeMeshes([box, roof], true, false, null, false, true);

  return house;
};
// 大房子
const createSemiHouse = () => {
  // 创建盒子(房屋)
  const faceUV = [
    // 0(背面)、1(正面)、2(右)、3(左)、4(顶部)和5(底部)
    // (起始U值, 起始V值, 结束U值, 结束V值) 范围0-1 U水平 V垂直
    new BABYLON.Vector4(0.6, 0.0, 1, 1.0),
    new BABYLON.Vector4(0, 0, 0.4, 1),
    new BABYLON.Vector4(0.4, 0, 0.6, 1.0),
    new BABYLON.Vector4(0.6, 0, 0.6, 1.0),
  ];
  const box = BABYLON.MeshBuilder.CreateBox(
    'box',
    {
      width: 2,
      height: 1,
      depth: 1,
      faceUV,
      wrap: true,
    },
    scene
  );
  box.position.y = 0.5;
  const boxMat = new BABYLON.StandardMaterial('boxMat', scene);
  boxMat.diffuseTexture = new BABYLON.Texture(
    'https://assets.babylonjs.com/environments/semihouse.png',
    scene
  );
  box.material = boxMat;

  // 创建菱柱(房顶)
  const roof = BABYLON.MeshBuilder.CreateCylinder(
    'roof',
    {
      diameter: 1.3,
      height: 1.2,
      tessellation: 3,
    },
    scene
  );
  roof.scaling.x = 0.75;
  roof.scaling.y = 2;
  roof.rotation.z = Math.PI / 2;
  roof.position.y = 1.22;
  const roofMat = new BABYLON.StandardMaterial('roofMat', scene);
  roofMat.diffuseTexture = new BABYLON.Texture(
    'https://assets.babylonjs.com/environments/roof.jpg',
    scene
  );
  roof.material = roofMat;

  // 组合房屋(合并网格)
  const house = BABYLON.Mesh.MergeMeshes([box, roof], true, false, null, false, true);

  // 复制房屋
  // const clonedHouse = house.clone('clonedHouse');
  // const instanceHouse = house.createInstance('instanceHouse');
  // instanceHouse.position.x = 4;

  return house;
};
const createHouse = () => {
  // [house type, rotation, x, z]
  const palces = [
    [1, -Math.PI / 16, -6.8, 2.5],
    [2, -Math.PI / 16, -4.5, 3],
    [2, -Math.PI / 16, -1.5, 4],
    [2, -Math.PI / 3, 1.5, 6],
    [2, (15 * Math.PI) / 16, -6.4, -1.5],
    [1, (15 * Math.PI) / 16, -4.1, -1],
    [2, (15 * Math.PI) / 16, -2.1, -0.5],
    [1, (5 * Math.PI) / 4, 0, -1],
    [1, Math.PI + Math.PI / 2.5, 0.5, -3],
    [2, Math.PI + Math.PI / 2.1, 0.75, -5],
    [1, Math.PI + Math.PI / 2.25, 0.75, -7],
    [2, Math.PI / 1.9, 4.75, -1],
    [1, Math.PI / 1.95, 4.5, -3],
    [2, Math.PI / 1.9, 4.75, -5],
    [1, Math.PI / 1.9, 4.75, -7],
    [2, -Math.PI / 3, 5.25, 2],
    [1, -Math.PI / 3, 6, 4],
  ];
  palces.forEach(([type, rotation, x, z]) => {
    const house = type == 1 ? createDetachedHouse() : createSemiHouse();
    house.rotation.y = rotation;
    house.position.x = x;
    house.position.z = z;
  });
};

onMounted(() => {
  initializeBabylon();
});
</script>

<style scoped>
#village {
  width: 100vw;
  height: 100vh;
}
</style>
