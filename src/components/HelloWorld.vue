<template>
  <canvas id="village" ref="villageRef"></canvas>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import earcut from 'earcut';

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
  createAxis(1, scene);
  importGLB(scene);
  // importBirdGLB(scene);
  importDudeGLB(scene);
  createCar(scene);
  // createGround();
  console.log(scene.meshes);
  scene.meshes.forEach((mesh) => {
    console.log(mesh.name);
  });
  return scene;
};

const createCar = (scene) => {
  //轮廓线
  const outline = [new BABYLON.Vector3(-0.3, 0, -0.1), new BABYLON.Vector3(0.2, 0, -0.1)];
  //curved front
  for (let i = 0; i < 20; i++) {
    outline.push(
      new BABYLON.Vector3(
        0.2 * Math.cos((i * Math.PI) / 40),
        0,
        0.2 * Math.sin((i * Math.PI) / 40) - 0.1
      )
    );
  }

  outline.push(new BABYLON.Vector3(0, 0, 0.1));
  outline.push(new BABYLON.Vector3(-0.3, 0, 0.1));

  // 车
  const carFaceUV = [
    new BABYLON.Vector4(0, 0.5, 0.38, 1),
    new BABYLON.Vector4(0, 0, 1, 0.5),
    new BABYLON.Vector4(0.38, 1, 0, 0.5),
  ];
  const car = BABYLON.MeshBuilder.ExtrudePolygon(
    'car',
    {
      shape: outline,
      depth: 0.2,
      faceUV: carFaceUV,
      wrap: true,
    },
    scene,
    earcut
  );
  const carMat = new BABYLON.StandardMaterial('carMat', scene);
  carMat.diffuseTexture = new BABYLON.Texture('https://assets.babylonjs.com/environments/car.png');
  car.material = carMat;
  car.position.y = 0.15;
  car.rotation.x = -Math.PI / 2;

  //创建车轮
  const wheelUV = [
    new BABYLON.Vector4(0, 0, 1, 1),
    new BABYLON.Vector4(0, 0.5, 0, 0.5),
    new BABYLON.Vector4(0, 0, 1, 1),
  ];
  const wheelRB = BABYLON.MeshBuilder.CreateCylinder('wheelRB', {
    height: 0.05,
    diameter: 0.125,
    faceUV: wheelUV,
    wrap: true,
  });
  const wheelMat = new BABYLON.StandardMaterial('wheelMat', scene);
  wheelMat.diffuseTexture = new BABYLON.Texture(
    'https://assets.babylonjs.com/environments/wheel.png'
  );
  wheelRB.material = wheelMat;
  wheelRB.parent = car;
  wheelRB.position.z = -0.1;
  wheelRB.position.x = -0.2;
  wheelRB.position.y = 0.035;

  // 车轮动画
  const wheelAnimation = new BABYLON.Animation(
    'wheelAnimation',
    'rotation.y',
    30,
    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
  );

  // 关键帧
  const wheelKeys = [
    {
      frame: 0,
      value: 0,
    },
    {
      frame: 30,
      value: 2 * Math.PI,
    },
  ];

  // 关键帧链接到动画
  wheelAnimation.setKeys(wheelKeys);

  // 动画链接到网格并开始
  wheelRB.animations = [wheelAnimation];
  scene.beginAnimation(wheelRB, 0, 30, true);

  // 复制其他车轮
  const wheelRF = wheelRB.clone('wheelRF');
  wheelRF.position.x = 0.1;

  const wheelLB = wheelRB.clone('wheelLB');
  wheelLB.position.y = -0.2 - 0.035;

  const wheelLF = wheelRF.clone('wheelLF');
  wheelLF.position.y = -0.2 - 0.035;

  scene.beginAnimation(wheelRF, 0, 30, true);
  scene.beginAnimation(wheelLB, 0, 30, true);
  scene.beginAnimation(wheelLF, 0, 30, true);

  // 汽车动画
  const carAnimation = new BABYLON.Animation(
    'carAnimation',
    'position.x',
    30,
    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
  );
  const carKeys = [
    {
      frame: 0,
      value: -4,
    },
    {
      frame: 150,
      value: 4,
    },
    {
      frame: 210,
      value: 4,
    },
  ];
  carAnimation.setKeys(carKeys);
  car.animations = [carAnimation];
  scene.beginAnimation(car, 0, 210, true);
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

// 创建轴辅助线函数
function createAxis(size, scene) {
  const makeTextPlane = (text, color, size) => {
    const dynamicTexture = new BABYLON.DynamicTexture('DynamicTexture', 50, scene, true);
    dynamicTexture.hasAlpha = true;
    dynamicTexture.drawText(text, 5, 40, 'bold 36px Arial', color, 'transparent', true);
    const plane = new BABYLON.MeshBuilder.CreatePlane(
      'TextPlane',
      { size, updateable: true },
      scene
    );
    plane.material = new BABYLON.StandardMaterial('TextPlaneMaterial', scene);
    plane.material.backFaceCulling = false;
    plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
    plane.material.diffuseTexture = dynamicTexture;
    return plane;
  };

  const axisX = BABYLON.MeshBuilder.CreateLines('axisX', {
    points: [
      new BABYLON.Vector3.Zero(),
      new BABYLON.Vector3(size, 0, 0),
      new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
      new BABYLON.Vector3(size, 0, 0),
      new BABYLON.Vector3(size * 0.95, -0.05 * size, 0),
    ],
  });
  axisX.color = new BABYLON.Color3(1, 0, 0);
  const xChar = makeTextPlane('X', 'red', size / 10);
  xChar.position = new BABYLON.Vector3(0.9 * size, -0.05 * size, 0);

  const axisY = BABYLON.MeshBuilder.CreateLines('axisY', {
    points: [
      new BABYLON.Vector3.Zero(),
      new BABYLON.Vector3(0, size, 0),
      new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
      new BABYLON.Vector3(0, size, 0),
      new BABYLON.Vector3(0.05 * size, size * 0.95, 0),
    ],
  });
  axisY.color = new BABYLON.Color3(0, 1, 0);
  const yChar = makeTextPlane('Y', 'green', size / 10);
  yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);

  const axisZ = BABYLON.MeshBuilder.CreateLines('axisZ', {
    points: [
      new BABYLON.Vector3.Zero(),
      new BABYLON.Vector3(0, 0, size),
      new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
      new BABYLON.Vector3(0, 0, size),
      new BABYLON.Vector3(0, 0.05 * size, size * 0.95),
    ],
  });
  axisZ.color = new BABYLON.Color3(0, 0, 1);
  const zChar = makeTextPlane('Z', 'blue', size / 10);
  zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);
}

const importGLB = async (scene) => {
  try {
    const result = await BABYLON.SceneLoader.ImportMeshAsync(
      '',
      '/public/model/village/house.glb',
      '',
      scene
    );
  } catch (error) {
    //
  }
};

const importBirdGLB = async (scene) => {
  try {
    const result = await BABYLON.SceneLoader.ImportMeshAsync(
      '',
      '/public/model/phoenix_bird.glb',
      '',
      scene
    );
  } catch (error) {
    console.log(error);
  }
};

const importDudeGLB = async (scene) => {
  try {
    // 加载角色
    const result = await BABYLON.SceneLoader.ImportMeshAsync(
      'him',
      '/public/model/dube/Dude.babylon',
      '',
      scene
    );
    const dude = result.meshes[0];
    dude.scaling = new BABYLON.Vector3(0.01, 0.01, 0.01);
    scene.beginAnimation(result.skeletons[0], 0, 100, true, 1.0);

    // mesh.movePOV(amountRight, amountUp, amountForward) 角色移动
    // 初始化模型面向-Z方向 参数向右、向上和向前移动距离(负 x 轴、正 y 轴和负 z 轴)
    // mesh.rotate(axis, angle, BABYLON.Space.LOCAL); 角色转向
    // scene.onBeforeRenderObservable.add(() => {}); 渲染下一帧之前执行

    // 角色运动轨迹
    const track = [
      // [转向角度, 移动距离]
      [86, 7],
      [-85, 14.8],
      [-93, 16.5],
      [48, 25.5],
      [-112, 30.5],
      [-72, 33.2],
      [42, 37.5],
      [-98, 45.2],
      [0, 47],
    ];
    scene.onBeforeRenderObservable.add(() => {});
  } catch (error) {
    //
  }
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
