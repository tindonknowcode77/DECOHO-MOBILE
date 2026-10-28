import type { Showroom } from "./types";
export function showroomHtml(room: Showroom) {
  const payload = JSON.stringify({
    environmentModelUrl: room.environmentModelUrl,
    items: room.items,
  }).replace(/</g, "\\u003c");
  return `<!doctype html><html lang="vi"><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><style>html,body{margin:0;height:100%;overflow:hidden;background:#eeeee4;font:14px system-ui;color:#2f6f5e}canvas{display:block;touch-action:none}#status{position:absolute;bottom:12px;left:12px;right:12px;padding:12px;background:#ffffffe8;border-radius:12px;pointer-events:none}</style><script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/"}}</script></head><body><div id="status">Đang tải không gian 3D…</div><script>setTimeout(()=>{const e=document.getElementById('status');if(e.textContent==='Đang tải không gian 3D…')e.textContent='Không gian đang tải chậm. Kiểm tra kết nối hoặc tải lại.'},25000);window.addEventListener('error',()=>document.getElementById('status').textContent='Không tải được trình xem 3D. Vui lòng kiểm tra kết nối.');</script><script type="module">
import * as THREE from 'three'; import {OrbitControls} from 'three/addons/controls/OrbitControls.js'; import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
const room=${payload}; const status=document.getElementById('status');
try {
const scene=new THREE.Scene();scene.background=new THREE.Color('#eeeee4');
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.01,10000);camera.position.set(6,5,8);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;document.body.prepend(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffffff,0x889977,3));const sun=new THREE.DirectionalLight(0xffffff,3);sun.position.set(5,10,7);scene.add(sun);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.maxPolarAngle=Math.PI*.9;
const models=new THREE.Group();scene.add(models);const loader=new GLTFLoader();
async function add(url,item){if(!url||!/^https?:\\/\\//.test(url))throw new Error('Model URL invalid');const gltf=await loader.loadAsync(url);const model=gltf.scene;if(item){const p=item.position??{x:0,y:0,z:0},r=item.rotation??{x:0,y:0,z:0},s=item.scale??{x:1,y:1,z:1};model.position.set(p.x,p.y,p.z);model.rotation.set(r.x,r.y,r.z);model.scale.set(s.x,s.y,s.z)}models.add(model)}
const tasks=room.items.map(item=>add(item.modelUrl,item));if(room.environmentModelUrl)tasks.push(add(room.environmentModelUrl));
const results=await Promise.allSettled(tasks);const failures=results.filter(x=>x.status==='rejected').length;
const bounds=new THREE.Box3().setFromObject(models);if(!bounds.isEmpty()){const center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3()),distance=Math.max(size.x,size.y,size.z)*1.6;controls.target.copy(center);camera.position.copy(center).add(new THREE.Vector3(distance,distance*.65,distance));controls.update();}
status.textContent=tasks.length===0?'Không gian chưa có mô hình 3D.':failures===tasks.length?'Không tải được mô hình. Vui lòng kiểm tra kết nối.':failures?'Một số mô hình chưa tải được. Kéo để xoay, chụm để thu phóng.':'Kéo để xoay · Chụm hai ngón để thu phóng';
renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera)});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
addEventListener('pagehide',()=>{renderer.setAnimationLoop(null);controls.dispose();models.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material]){for(const v of Object.values(m))if(v?.isTexture)v.dispose();m.dispose();}}});renderer.dispose();});
}catch(e){status.textContent='Thiết bị chưa mở được không gian 3D. Hãy thử lại.'}
</script></body></html>`;
}
