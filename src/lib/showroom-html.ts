import type { Showroom } from "./types";
export function showroomHtml(room: Showroom) {
  const payload = JSON.stringify({
    environmentModelUrl: room.environmentModelUrl,
    items: room.items,
  }).replace(/</g, "\\u003c");
  return `<!doctype html><html lang="vi"><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><style>html,body{margin:0;height:100%;overflow:hidden;background:#f7f3ec;font:14px system-ui;color:#2e6f5e}canvas{display:block;touch-action:none}#status{position:absolute;bottom:12px;left:12px;right:12px;padding:10px 14px;background:#ffffffe8;border-radius:12px;border:1px solid #ded6c9;pointer-events:none;font-weight:600;font-size:13px;text-align:center}</style><script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/"}}</script></head><body><div id="status">Đang tải không gian 3D Tripo…</div><script>setTimeout(()=>{const e=document.getElementById('status');if(e.textContent==='Đang tải không gian 3D Tripo…')e.textContent='Không gian đang tải. Bạn chờ một chút nhé…'},15000);window.addEventListener('error',()=>document.getElementById('status').textContent='Không tải được trình xem 3D. Vui lòng thử lại.');</script><script type="module">
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';

const room=${payload};
const status=document.getElementById('status');
try {
  const scene=new THREE.Scene();
  scene.background=new THREE.Color('#f7f3ec');
  const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.01,10000);
  camera.position.set(6,5,8);
  const renderer=new THREE.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setSize(innerWidth,innerHeight);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  document.body.prepend(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xffffff,0xb0b8a6,2.5));
  scene.add(new THREE.AmbientLight(0xffffff,1.2));
  const sun=new THREE.DirectionalLight(0xffffff,2.5);
  sun.position.set(5,10,7);
  scene.add(sun);
  const sun2=new THREE.DirectionalLight(0xffffff,1.5);
  sun2.position.set(-5,8,-6);
  scene.add(sun2);

  const controls=new OrbitControls(camera,renderer.domElement);
  controls.enableDamping=true;
  controls.dampingFactor=0.05;
  controls.maxPolarAngle=Math.PI*0.9;

  const models=new THREE.Group();
  scene.add(models);

  const loader=new GLTFLoader();
  const dracoLoader=new DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
  loader.setDRACOLoader(dracoLoader);

  async function add(url,item){
    if(!url) return;
    let finalUrl = url;
    if(url.startsWith('/') && typeof window !== 'undefined'){
      finalUrl = window.location.origin + url;
    }
    const gltf=await loader.loadAsync(finalUrl);
    const model=gltf.scene;
    if(item){
      const p=item.position??{x:0,y:0,z:0},r=item.rotation??{x:0,y:0,z:0},s=item.scale??{x:1,y:1,z:1};
      model.position.set(p.x,p.y,p.z);
      model.rotation.set(r.x,r.y,r.z);
      model.scale.set(s.x,s.y,s.z);
    }
    models.add(model);
  }

  const tasks=[];
  if(room.environmentModelUrl) tasks.push(add(room.environmentModelUrl));
  if(Array.isArray(room.items)){
    for(const it of room.items){
      if(it.modelUrl) tasks.push(add(it.modelUrl, it));
    }
  }

  const results=await Promise.allSettled(tasks);
  const failures=results.filter(x=>x.status==='rejected').length;

  const bounds=new THREE.Box3().setFromObject(models);
  if(!bounds.isEmpty()){
    const center=bounds.getCenter(new THREE.Vector3());
    const size=bounds.getSize(new THREE.Vector3());
    const distance=Math.max(size.x,size.y,size.z)*1.6;
    controls.target.copy(center);
    camera.position.copy(center).add(new THREE.Vector3(distance,distance*0.65,distance));
    controls.update();
  }

  status.textContent=tasks.length===0?'Chưa có mô hình 3D.':failures===tasks.length?'Không tải được mô hình. Vui lòng kiểm tra file.':failures?'Một số chi tiết chưa tải được. Kéo để xoay · Thu phóng 3D':'Kéo để xoay 360° · Chụm hai ngón để thu phóng';

  renderer.setAnimationLoop(()=>{
    controls.update();
    renderer.render(scene,camera);
  });

  addEventListener('resize',()=>{
    camera.aspect=innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth,innerHeight);
  });

  addEventListener('pagehide',()=>{
    renderer.setAnimationLoop(null);
    controls.dispose();
    dracoLoader.dispose();
    models.traverse(o=>{
      o.geometry?.dispose();
      if(o.material){
        for(const m of Array.isArray(o.material)?o.material:[o.material]){
          for(const v of Object.values(m))if(v?.isTexture)v.dispose();
          m.dispose();
        }
      }
    });
    renderer.dispose();
  });
}catch(e){
  status.textContent='Thiết bị chưa mở được không gian 3D. Hãy thử lại.';
}
</script></body></html>`;
}
