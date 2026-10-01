import * as THREE from 'three';

const $ = selector => document.querySelector(selector);
const canvas = $('#world');
const loading = $('#loading');
const intro = $('#introCard');
const mapPanel = $('#mapPanel');
const projectPanel = $('#projectPanel');
const helpDialog = $('#helpDialog');

const places = [
  {id:'tianyan',number:'01',name:'蓝耘天衍',type:'企业级桌面智能体',x:-20,z:5,color:0x9a8df0,image:'assets/images/tianyan-onboarding.webp',link:'work-tianyan.html',summary:'围绕桌面任务的完整使用过程，参与产品走查、新手引导与团队协作版原型设计。让 AI 的执行过程更清楚、关键节点更可控。',facts:['产品体验走查','新手引导','团队协作原型']},
  {id:'xinghe',number:'02',name:'蓝耘星河',type:'AI 营销内容工具',x:20,z:5,color:0xffb679,image:'assets/images/xinghe-overview.webp',link:'work-xinghe.html',summary:'从公开内容调研出发，梳理中小企业运营人员的营销内容生产任务，形成产品定位、功能流程与桌面端高保真原型。',facts:['550+ 条公开样本','产品定位','内容工作流']},
  {id:'shower',number:'03',name:'Shower enjoyment',type:'服务体验设计',x:-20,z:-23,color:0x84d9d5,image:'assets/images/shower-ui.webp',link:'work-shower.html',summary:'研究校园公共浴室的排队、储物与设备反馈问题，把空间服务与数字触点组织为更顺畅的使用体验。',facts:['用户调研','服务蓝图','UI / UX']},
  {id:'kaihua',number:'04',name:'开化寻踪',type:'文化交互设计',x:20,z:-23,color:0xf0c782,image:'assets/images/kaihua-map.webp',link:'archive.html#kaihua',summary:'以开化地域文化为线索，将地方图像、传统纹样与探索任务转译为可浏览、可收集、可推进的移动端体验。',facts:['文化元素提取','地图探索','移动端视觉系统']},
  {id:'about',number:'05',name:'关于我',type:'经历与能力',x:0,z:-40,color:0xb1b8ef,image:'assets/images/hero-tablet.webp',link:'index.html#experience',summary:'数字媒体艺术硕士在读，关注 AI 产品、体验设计与数字媒体创作。在蓝耘科技参与桌面智能体与 AI 营销产品实践。',facts:['AI 产品研究','交互原型','视觉叙事']}
];

const clamp = THREE.MathUtils.clamp;
const colors = {ground:0xe9e4d9,ink:0x34405e,white:0xfff9ee,lavender:0xa99aed,blue:0x849ee4,green:0x87c8aa,leaves:0x82bea6,peach:0xf7b98e};
const mat = (color, options={}) => new THREE.MeshToonMaterial({color,...options});
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdbe9e5);
scene.fog = new THREE.Fog(0xdbe9e5,58,128);
const camera = new THREE.PerspectiveCamera(45,1,.1,230);
const renderer = new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<760?1.5:2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;

scene.add(new THREE.HemisphereLight(0xffffff,0xa8a3a2,1.05));
const sunlight = new THREE.DirectionalLight(0xffffff,1.15);
sunlight.position.set(-25,42,28);
sunlight.castShadow = true;
sunlight.shadow.mapSize.set(innerWidth<760?512:1024,innerWidth<760?512:1024);
sunlight.shadow.camera.left=-65;sunlight.shadow.camera.right=65;sunlight.shadow.camera.top=65;sunlight.shadow.camera.bottom=-65;
sunlight.shadow.normalBias=.035;
scene.add(sunlight);

function mesh(geo,color,parent=scene,x=0,y=0,z=0,opts={}){
  const obj=new THREE.Mesh(geo,typeof color==='number'?mat(color):color);
  obj.position.set(x,y,z);obj.castShadow=opts.cast!==false;obj.receiveShadow=opts.receive!==false;parent.add(obj);return obj;
}
function box(parent,x,y,z,w,h,d,color,r=0){const obj=mesh(new THREE.BoxGeometry(w,h,d),color,parent,x,y,z);if(r)obj.rotation.y=r;return obj}
function cyl(parent,x,y,z,top,bottom,h,color,sides=12){return mesh(new THREE.CylinderGeometry(top,bottom,h,sides),color,parent,x,y,z)}
function ball(parent,x,y,z,r,color,segments=12){return mesh(new THREE.IcosahedronGeometry(r,segments>12?2:1),color,parent,x,y,z)}
function cone(parent,x,y,z,r,h,color,sides=8){return mesh(new THREE.ConeGeometry(r,h,sides),color,parent,x,y,z)}
function pill(parent,x,y,z,r,h,color){const m=cyl(parent,x,y,z,r,r,h,color,12);ball(parent,x,y+h/2,z,r,color);return m}
function softBall(parent,x,y,z,sx,sy,sz,color){const m=mesh(new THREE.SphereGeometry(1,32,20),color,parent,x,y,z);m.scale.set(sx,sy,sz);return m}

const ground=mesh(new THREE.PlaneGeometry(1000,1000),0xe6e5d9,scene,0,-.13,-14,{cast:false});ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;
// The distant terrain fades into the sky instead of ending at a visible slab edge.
const roadMat=mat(0xfff9ef);
const routes=[[-20,0,8.5,12],[20,0,8.5,12],[-20,-14,8.5,13],[20,-14,8.5,13],[0,-32,8.2,20],[0,-14,8.3,25]];
for(const [x,z,w,d] of routes)mesh(new THREE.BoxGeometry(w,.08,d),roadMat,scene,x,.02,z,{cast:false});
for(const z of [13,2,-14,-30]){
  for(const x of [-1.6,1.6])box(scene,x,.08,z,.45,.035,1.7,0xd4c7e7);
}
const plaza=cyl(scene,0,.03,-3,4.8,4.8,.09,0xf7f1e9,48);
plaza.receiveShadow=true;
const ring=mesh(new THREE.TorusGeometry(4.45,.08,5,48),0xc5bae9,scene,0,.09,-3,{cast:false});ring.rotation.x=Math.PI/2;
for(const [x,z,hue] of [[-1.7,-3.2,0xb8a6e8],[0,-3.7,0xf2b892],[1.7,-3.2,0x91c9c0]]){
  softBall(scene,x,.57,z,.5,.58,.46,hue);
  softBall(scene,x,1.19,z,.22,.16,.22,0xfff5df);
}
function curvedPath(points,width,color,y=.025){
  const curve=new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,y,z)));
  const vertices=[],indices=[];const steps=64;
  for(let i=0;i<=steps;i++){
    const t=i/steps,p=curve.getPoint(t),d=curve.getTangent(t),nx=-d.z,nz=d.x;
    for(const side of [-1,1])vertices.push(p.x+nx*width*side/2,p.y,p.z+nz*width*side/2);
    if(i<steps){const n=i*2;indices.push(n,n+1,n+2,n+1,n+3,n+2)}
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();
  const path=mesh(geo,new THREE.MeshToonMaterial({color,side:THREE.DoubleSide}),scene,0,0,0,{cast:false});path.receiveShadow=true;return curve;
}
const firstTrailPoints=[[0,27],[-1,23],[-5,19],[-10,15],[-16,10],[-20,5]];
curvedPath(firstTrailPoints,5.95,0xc4b2e3,.005);
const firstTrail=curvedPath(firstTrailPoints,5.35,0xf8efdf,.015);
for(let i=1;i<14;i++){
  const p=firstTrail.getPoint(i/15),d=firstTrail.getTangent(i/15),side=i%2?1:-1;
  softBall(scene,p.x-d.z*side*2.72,.035,p.z+d.x*side*2.72,.25,.055,.43,i%3?0xc3b4e6:0xf2b893);
}

function signTexture(title,sub,accent){
  const c=document.createElement('canvas');c.width=768;c.height=256;const ctx=c.getContext('2d');
  ctx.fillStyle='#34405e';ctx.beginPath();ctx.roundRect(9,9,750,235,31);ctx.fill();
  ctx.fillStyle='#fffaf0';ctx.beginPath();ctx.roundRect(17,17,734,219,25);ctx.fill();
  ctx.fillStyle=accent;ctx.fillRect(32,34,14,184);
  ctx.fillStyle='#303b57';ctx.textAlign='center';ctx.font='bold 76px "Noto Sans SC",sans-serif';ctx.fillText(title,390,122);
  ctx.fillStyle='#65708a';ctx.font='bold 34px "Noto Sans SC",sans-serif';ctx.fillText(sub,390,184);
  const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}
function placeSign(group,title,sub,color,y=6.7){
  const texture=signTexture(title,sub,'#'+new THREE.Color(color).getHexString());
  const sign=mesh(new THREE.PlaneGeometry(8.7,2.9),new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.DoubleSide,depthWrite:false}),group,0,y,0,{cast:false});
  sign.rotation.x=-.15;
  return sign;
}
function plant(x,z,scale=1,tint=colors.leaves){
  const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
  cyl(g,0,.9,0,.2,.29,1.8,0x856c67,7);
  ball(g,0,2.2,0,.88*scale,tint);ball(g,-.55*scale,1.85,0,.57*scale,tint);ball(g,.55*scale,1.9,.1,.6*scale,tint);
}
function pebble(x,z,s=.55){const p=ball(scene,x,.1+s*.27,z,s,0xb8b9c2);p.scale.y=.55}
const startToys=[];
function ideaParcel(x,z){
  const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
  softBall(g,0,.92,0,.83,.83,.83,0xb8a4f0);
  const band=mesh(new THREE.TorusGeometry(.85,.12,8,32),0xffd18c,g,0,.92,0);band.rotation.x=Math.PI/2;
  softBall(g,0,1.77,0,.26,.22,.26,0xfff4c8);
  for(const side of [-1,1])softBall(g,side*.32,.98,.7,.085,.095,.045,0x39465d);
  softBall(g,0,.69,.77,.16,.09,.045,0xd87889);
  g.userData={home:new THREE.Vector3(x,0,z),velocity:new THREE.Vector2(),radius:.83};
  startToys.push(g);
}
function lantern(x,z,hue=0xb6a3e7){
  cyl(scene,x,.75,z,.12,.17,1.5,0x667a79,10);
  softBall(scene,x,1.68,z,.38,.4,.38,hue);
  softBall(scene,x,2.11,z,.12,.12,.12,0xfff4c8);
}
function buildStartArea(){
  // A small departure courtyard and a single, readable route into the first project.
  const pad=cyl(scene,0,.01,27,6.2,6.2,.09,0xf9f0df,48);pad.receiveShadow=false;
  const trim=mesh(new THREE.TorusGeometry(5.78,.08,5,56),0xc6afe2,scene,0,.07,27,{cast:false});trim.rotation.x=Math.PI/2;
  for(const [x,z] of [[-5.9,28.7],[5.9,27.5],[-13.9,11.5],[-19,11.4]])lantern(x,z);
  // The little dispatch house explains why a parcel is on the path.
  const hut=new THREE.Group();hut.position.set(7.8,0,23);scene.add(hut);
  softBall(hut,0,1.45,0,2.55,1.7,2.1,0xfff8ed);
  softBall(hut,0,2.94,0,2.9,.62,2.36,0xa391cf);
  softBall(hut,0,3.47,0,1.2,.7,1.12,0xa391cf);
  softBall(hut,-.75,1.65,1.9,.35,.42,.1,0x83c6c1);
  softBall(hut,.75,1.65,1.9,.35,.42,.1,0x83c6c1);
  softBall(hut,0,.82,2.03,.7,.82,.1,0xd9ae88);
  const hutSign=mesh(new THREE.PlaneGeometry(2.5,.83),new THREE.MeshBasicMaterial({map:signTexture('灵感邮局','START','#9984d0'),side:THREE.DoubleSide}),hut,0,3.65,1.37,{cast:false});
  hutSign.rotation.x=-.12;
  for(const [x,z,r] of [[5,19,.6],[9,18.7,.54],[11,25,.48]]){
    const flower=softBall(scene,x,.55,z,r,.55,r,0x8ec7aa);
    flower.receiveShadow=true;
    for(let a=0;a<5;a++){const theta=a*Math.PI*2/5;softBall(scene,x+Math.sin(theta)*r*.55,1.02,z+Math.cos(theta)*r*.55,.16,.16,.16,a%2?0xffd393:0xf7b5b4)}
  }
  // Set dressing belongs to two clusters, not scattered evenly around the whole map.
  for(const [x,z,s] of [[-8.5,28,1.02],[-11.3,25,.72],[13.2,27,.95],[15,22,.7],[-17,14,.72]])plant(x,z,s,0x87bea5);
  for(const [x,z] of [[-9.4,30],[-11,22],[13.5,20]])pebble(x,z,.42);
  ideaParcel(-4.2,19.4);
  lantern(-8.3,16.8,0xffc498);
  lantern(-13.1,12.8,0xffc498);
  const direction=mesh(new THREE.PlaneGeometry(3.4,1.13),new THREE.MeshBasicMaterial({map:signTexture('蓝耘天衍','01 · 任务工坊','#aa91d9'),side:THREE.DoubleSide}),scene,-7.3,2.55,22.9,{cast:false});
  direction.rotation.x=-.1;
  cyl(scene,-7.3,1.04,22.95,.14,.18,2.05,0x748080,10);
}
buildStartArea();
for(const [x,z,s] of [[-42,26,1],[-31,24,.8],[-46,7,1.1],[-35,-8,.8],[-46,-31,1],[42,26,1],[32,24,.8],[46,7,1.1],[35,-8,.8],[46,-31,1],[-36,-43,.8],[36,-42,1],[-8,-46,.7],[9,-48,.8]])plant(x,z,s,(x+z)%2?0x8dc8ad:0x9cc8a1);
for(const [x,z] of [[-29,17],[-43,-15],[-31,-36],[31,17],[43,-15],[29,-35],[-9,8],[8,8],[-9,-27],[9,-27]])pebble(x,z,.55);

const stationGroups=[];
function makeBase(p){
  const group=new THREE.Group();group.position.set(p.x,0,p.z);group.userData.projectId=p.id;scene.add(group);stationGroups.push(group);
  if(p.id==='tianyan'){
    softBall(group,0,.17,0,7.8,.3,5.9,0xc5b5ed);
    softBall(group,0,.36,-.38,7.15,.22,5.15,0xfaf3e9);
    return group;
  }
  box(group,0,.31,0,15,.6,12,0xefe8d9);
  box(group,0,.65,0,14.3,.16,11.4,p.color);
  box(group,0,.77,4.9,8,.13,1.2,colors.white);
  cyl(group,-6,.95,4.7,.18,.18,.3,0x51496b);cyl(group,6,.95,4.7,.18,.18,.3,0x51496b);
  placeSign(group,p.name,p.type,p.color,7.6);
  return group;
}
function monitor(g,x,y,z,s=1){
  box(g,x,y,z,3.6*s,2.55*s,.35*s,colors.ink);
  box(g,x,y,z+.2*s,3.13*s,2.08*s,.04,0xdceaff);
  box(g,x-1.15*s,y+.45*s,z+.24*s,.42*s,.42*s,.04,0x998bef);
  box(g,x+.35*s,y+.48*s,z+.24*s,1.55*s,.16*s,.04,0xaabbe9);
  box(g,x+.2*s,y-.04*s,z+.24*s,2.2*s,.17*s,.04,0x94c8c7);
  box(g,x-.1*s,y-.52*s,z+.24*s,1.6*s,.17*s,.04,0xc0b1ef);
  box(g,x,y-1.45*s,z,.18*s,.5*s,.18*s,colors.ink);box(g,x,y-1.76*s,z,.95*s,.13*s,.65*s,colors.ink);
}
const floatingTianyan=[];
function modelTianyan(g){
  // A lively desktop workshop replaces the old exhibition plinth.
  for(const [x,z] of [[-4.4,-2.5],[4.4,-2.5]]){
    softBall(g,x,.92,z,.35,.8,.35,0xb7a4e8);
    softBall(g,x,1.73,z,.52,.25,.52,0xffd1a2);
  }
  softBall(g,0,1.07,-2.4,4.2,.34,1.45,0xdecffa);
  softBall(g,0,2.98,-3.25,3.55,2.3,.76,0x7b6dcc);
  softBall(g,0,3.03,-2.67,3.12,1.92,.28,0xfffbf4);
  const screenTexture=new THREE.TextureLoader().load('assets/images/tianyan-onboarding.webp');screenTexture.colorSpace=THREE.SRGBColorSpace;
  mesh(new THREE.PlaneGeometry(5.45,3.05),new THREE.MeshBasicMaterial({map:screenTexture,side:THREE.DoubleSide}),g,0,3.02,-2.33,{cast:false});
  const title=mesh(new THREE.PlaneGeometry(5.3,1.78),new THREE.MeshBasicMaterial({map:signTexture('蓝耘天衍','桌面智能体','#9182db'),side:THREE.DoubleSide}),g,0,5.97,-2.97,{cast:false});
  title.rotation.x=-.11;
  const noteColors=[0xb5d9d2,0xf5c2a3,0xc9b7ef];
  for(let i=0;i<3;i++){
    const x=-3.9+i*3.9,z=.45+(i%2)*.45;
    const note=new THREE.Group();note.position.set(x,1.42,z);g.add(note);
    softBall(note,0,0,0,.82,.62,.22,noteColors[i]);
    softBall(note,-.19,.07,.22,.18,.08,.03,0xfffbf2);
    softBall(note,.18,-.12,.22,.3,.055,.03,0xfffbf2);
    floatingTianyan.push({note,base:1.42,phase:i*1.8});
  }
  for(const [x,z] of [[-5.7,1.8],[5.8,2]]){
    softBall(g,x,.45,z,.65,.5,.62,0x8ac4b2);
    softBall(g,x,.86,z,.19,.18,.19,0xffd5a0);
  }
}
function modelXinghe(g){
  box(g,0,1.14,-1.5,10.5,.7,5.6,0xe48f72);box(g,0,1.55,-1.5,9.6,.16,4.8,0xffede2);
  for(let i=-1;i<=1;i++){const x=i*2.8;box(g,x,3.1,-2.8,2.2,3.05,.22,i===0?0x8a77d3:0xfff5e9);box(g,x,3.4,-2.63,1.6,1.2,.03,i===0?0xffdabc:0xb0c7de);box(g,x,2.35,-2.62,1.48,.18,.03,0xd4a1bc)}
  box(g,0,2.1,.9,7.1,.38,2.2,0xffd1aa);
  for(const x of [-2.2,0,2.2]){const c=cyl(g,x,2.55,.9,.43,.43,.75,0xffffff);c.rotation.z=.13;box(g,x,3.02,.9,.65,.15,.65,0xb5a5e9)}
}
function modelShower(g){
  box(g,0,1.2,-1.1,10.5,.7,6,0x5bafbc);box(g,0,1.62,-1.1,9.5,.18,5.2,0xd7f5ed);
  for(const x of [-3.3,0,3.3]){cyl(g,x,3,-2.7,.9,.9,2.7,0xf5fcf9,14);cyl(g,x,4.4,-2.7,1,1,.25,0x75cfca,14);box(g,x,2.5,-1.68,1.1,1.25,.07,0x8bb7d1)}
  box(g,0,2.2,.9,7.8,.3,1.3,0x9ee0d5);for(const x of [-2.9,0,2.9])cyl(g,x,2.65,.9,.4,.4,.65,0xf6fbf4);
}
function modelKaihua(g){
  box(g,0,1.1,-1.4,10.4,.6,5.5,0xcda570);box(g,0,1.46,-1.4,9.8,.15,4.9,0xf5e9cf);
  for(const [x,z,r] of [[-3,-2.9,1.5],[0,-3.3,1.8],[3,-3.1,1.45]]){cone(g,x,2.9,z,r,2.9,0x79b9a7,5);cone(g,x,4,z,r*.55,1.25,0xe6e5d4,5)}
  const arch=box(g,0,2.1,1,5.2,.4,.5,0x9b555c);box(g,-2.2,1.55,1,.32,2.3,.42,0x9b555c);box(g,2.2,1.55,1,.32,2.3,.42,0x9b555c);arch.rotation.z=.01;
  for(const x of [-3.6,3.6])pill(g,x,1.95,1.1,.35,1.5,0xe9b872);
}
function modelAbout(g){
  box(g,0,1.05,-1.3,10,.52,5.2,0x666eae);box(g,0,1.39,-1.3,9.4,.16,4.6,0xe8e6fa);
  for(const x of [-2.8,-.5,1.8]){box(g,x,2.25,-2.5,1.7,1.7,.55,x===-.5?0xf1c599:0xb4a9ef);box(g,x,3.15,-2.5,1.7,.15,.55,colors.ink)}
  cyl(g,3.1,2.1,.3,.88,1.1,1.4,0x9295d8,10);ball(g,3.1,3.25,.3,.75,0xffffff);box(g,3.1,3.25,1,.85,.25,.06,0x3e496a);
}
for(const p of places){const g=makeBase(p);({tianyan:modelTianyan,xinghe:modelXinghe,shower:modelShower,kaihua:modelKaihua,about:modelAbout})[p.id](g)}

function makeExplorer(){
  const g=new THREE.Group();scene.add(g);
  const shadow=mesh(new THREE.CircleGeometry(.83,32),new THREE.MeshBasicMaterial({color:0x6c6586,transparent:true,opacity:.2,depthWrite:false}),g,0,.012,0,{cast:false});
  shadow.rotation.x=-Math.PI/2;
  const body=new THREE.Group();body.position.y=1.08;g.add(body);
  // A floating mail courier avoids pretending that procedural geometry can supply character animation.
  softBall(body,0,0,0,.82,.65,.72,0xfff6e9);
  softBall(body,0,.35,.12,.65,.25,.56,0xa998dc);
  softBall(body,0,-.12,.58,.43,.3,.2,0x8f7ac6);
  softBall(body,0,-.11,.76,.2,.15,.05,0xffd08f);
  const sash=mesh(new THREE.TorusGeometry(.71,.075,8,36),0xffc18c,body,0,-.1,0);sash.rotation.x=.23;
  softBall(body,0,-.58,0,.46,.12,.42,0x9c8bd4);
  const wings=[];
  for(const side of [-1,1]){
    const wing=new THREE.Group();wing.position.set(side*.73,.02,.02);body.add(wing);
    softBall(wing,side*.31,-.03,0,.49,.13,.37,0xfffbf1).rotation.z=side*.15;
    softBall(wing,side*.55,-.02,.18,.26,.09,.2,0xd7c9f1);
    wings.push(wing);
  }
  softBall(body,-.22,.02,-.67,.075,.1,.045,0x34415d);
  softBall(body,.22,.02,-.67,.075,.1,.045,0x34415d);
  softBall(body,0,-.19,-.73,.1,.06,.04,0xd8899d);
  cyl(body,0,.69,.03,.055,.07,.37,0x7776a2,12);
  softBall(body,0,.91,.03,.16,.15,.16,0xffd393);
  g.userData={body,wings,shadow};
  g.position.set(0,0,27);return g;
}
const explorer=makeExplorer();
explorer.scale.setScalar(1.3);
const state={started:false,open:false,speed:0,heading:0,bank:0,boost:false,jump:0,jumpVelocity:0,camYaw:0,camDistance:15,camHeight:9.5,lastInput:0,near:null,selected:null,walkTime:0,parcelTouched:false};
const keys=new Set();
const touches=new Map();
let touchDriver=null;let touchOrigin={x:0,y:0};let touchAxis={forward:0,turn:0};let pinchBefore=null;let mouseDragging=false;let mouseStart={x:0,y:0,moved:false};

function start(){state.started=true;intro.classList.add('dismissed');intro.setAttribute('aria-hidden','true');intro.inert=true;state.lastInput=performance.now();$('#storyHint').hidden=false}
$('#startButton').addEventListener('click',start);
function reset(){explorer.position.set(0,0,27);state.speed=0;state.heading=0;state.camYaw=0;state.near=null;state.jump=0;state.parcelTouched=false;for(const toy of startToys){toy.position.copy(toy.userData.home);toy.userData.velocity.set(0,0);toy.rotation.set(0,0,0)}$('#storyHint').textContent='一份新任务正在送往蓝耘天衍。沿紫色小路去看看。';$('#storyHint').hidden=false;closeProject();$('#regionName').textContent='起点 · 灵感邮局'}
$('#resetButton').addEventListener('click',reset);

function openMap(){const show=mapPanel.hidden;mapPanel.hidden=!show;$('#mapToggle').setAttribute('aria-expanded',String(show));if(show)closeProject()}
function closeMap(){mapPanel.hidden=true;$('#mapToggle').setAttribute('aria-expanded','false')}
$('#mapToggle').addEventListener('click',openMap);$('#mapClose').addEventListener('click',closeMap);
$('#mapPlaces').innerHTML=places.map(p=>`<button class="map-place" type="button" data-place="${p.id}"><span>${p.name}<small>${p.type}</small></span><i>→</i></button>`).join('');
$('#mapPlaces').addEventListener('click',e=>{const button=e.target.closest('[data-place]');if(!button)return;const p=places.find(item=>item.id===button.dataset.place);explorer.position.set(p.x,0,p.z+8);state.heading=0;state.speed=0;state.camYaw=0;closeMap();start();state.near=p;updateNearby(p)});

function openProject(p){if(!p)return;state.open=true;state.selected=p;state.speed=0;closeMap();$('#storyHint').hidden=true;$('#projectIndex').textContent=`${p.number} / ${p.type.toUpperCase()}`;$('#projectTitle').textContent=p.name;$('#projectSubtitle').textContent=p.type;$('#projectSummary').textContent=p.summary;$('#projectImage').src=p.image;$('#projectImage').alt=`${p.name}项目画面`;$('#projectLink').href=p.link;$('#projectFacts').replaceChildren(...p.facts.map(f=>{const s=document.createElement('span');s.textContent=f;return s}));projectPanel.hidden=false;$('#nearby').hidden=true}
function closeProject(){state.open=false;state.selected=null;projectPanel.hidden=true}
$('#projectClose').addEventListener('click',closeProject);$('#nearbyOpen').addEventListener('click',()=>openProject(state.near));
function updateNearby(p){const el=$('#nearby');el.hidden=!p||!state.started||state.open||!mapPanel.hidden;if(p)$('#storyHint').hidden=true;if(!p)return;$('#nearbyTitle').textContent=p.name}

$('#helpButton').addEventListener('click',()=>helpDialog.showModal());$('#helpClose').addEventListener('click',()=>helpDialog.close());$('#helpDone').addEventListener('click',()=>helpDialog.close());
addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','m','M','e','E','r','R'].includes(e.key))e.preventDefault();keys.add(e.key.toLowerCase());state.lastInput=performance.now();if(e.repeat)return;if(e.key.toLowerCase()==='m')openMap();if(e.key.toLowerCase()==='r')reset();if(e.key.toLowerCase()==='e'&&state.near)openProject(state.near);if(e.key===' '&&state.jump<=.01){state.jumpVelocity=7;state.jump=.01}if(e.key==='Escape'){closeMap();closeProject();if(helpDialog.open)helpDialog.close()}});
addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
addEventListener('blur',()=>{keys.clear();touchAxis.forward=0;touchAxis.turn=0});

function updateTouchKnob(){const knob=$('#touchKnob');knob.style.transform=`translate(${touchAxis.turn*26}px,${-touchAxis.forward*26}px)`}
canvas.addEventListener('pointerdown',e=>{
  if(!state.started||state.open||!mapPanel.hidden)return;
  canvas.setPointerCapture(e.pointerId);
  if(e.pointerType==='touch'){
    touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(touches.size===1){touchDriver=e.pointerId;touchOrigin={x:e.clientX,y:e.clientY};touchAxis={forward:0,turn:0};pinchBefore=null}
    else{touchDriver=null;touchAxis={forward:0,turn:0};pinchBefore=null;updateTouchKnob()}
  }else{mouseDragging=true;mouseStart={x:e.clientX,y:e.clientY,moved:false}}
});
canvas.addEventListener('pointermove',e=>{
  if(e.pointerType==='touch'&&touches.has(e.pointerId)){
    touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(touches.size>=2){const [a,b]=[...touches.values()];const dist=Math.hypot(a.x-b.x,a.y-b.y);const mid=(a.x+b.x)/2;if(pinchBefore){state.camYaw+=(mid-pinchBefore.mid)*.009;state.camDistance=clamp(state.camDistance-(dist-pinchBefore.dist)*.07,13,37)}pinchBefore={dist,mid}}
    else if(e.pointerId===touchDriver){touchAxis.forward=clamp((touchOrigin.y-e.clientY)/62,-1,1);touchAxis.turn=clamp((e.clientX-touchOrigin.x)/58,-1,1);updateTouchKnob()}
  }else if(mouseDragging){const dx=e.clientX-mouseStart.x,dy=e.clientY-mouseStart.y;if(Math.abs(dx)+Math.abs(dy)>3)mouseStart.moved=true;state.camYaw+=dx*.008;state.camHeight=clamp(state.camHeight+dy*.04,8,30);mouseStart.x=e.clientX;mouseStart.y=e.clientY}
});
function endPointer(e){
  if(e.pointerType==='touch'){
    touches.delete(e.pointerId);pinchBefore=null;
    if(touches.size===0){touchDriver=null;touchAxis={forward:0,turn:0};updateTouchKnob()}
    else if(touches.size===1){const [id,p]=[...touches.entries()][0];touchDriver=id;touchOrigin={x:p.x,y:p.y}}
  }else mouseDragging=false;
}
canvas.addEventListener('pointerup',endPointer);canvas.addEventListener('pointercancel',endPointer);
canvas.addEventListener('wheel',e=>{state.camDistance=clamp(state.camDistance+e.deltaY*.02,13,38);e.preventDefault()},{passive:false});
const boost=$('#touchBoost');boost.addEventListener('pointerdown',e=>{e.stopPropagation();boost.setPointerCapture(e.pointerId);state.boost=true});boost.addEventListener('pointerup',()=>state.boost=false);boost.addEventListener('pointercancel',()=>state.boost=false);
$('#touchJump').addEventListener('pointerdown',e=>{e.stopPropagation();if(state.jump<=.01){state.jumpVelocity=7;state.jump=.01}});

const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2();
canvas.addEventListener('click',e=>{
  if(mouseStart.moved||!state.started||state.open||e.pointerType==='touch')return;
  pointer.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);raycaster.setFromCamera(pointer,camera);
  const hits=raycaster.intersectObjects(stationGroups,true);
  if(hits.length){let o=hits[0].object;while(o&&!o.userData.projectId)o=o.parent;const p=places.find(item=>item.id===o?.userData.projectId);if(p)openProject(p)}
});

function resize(){const w=innerWidth,h=innerHeight;camera.aspect=w/h;camera.fov=w<760?56:45;camera.updateProjectionMatrix();renderer.setSize(w,h,false)}
addEventListener('resize',resize);resize();

function isBlocked(x,z){return places.some(p=>Math.abs(x-p.x)<6.4&&Math.abs(z-p.z)<5.7)}
function moveExplorer(dx,dz,dt){
  const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.18));
  for(let i=0;i<steps;i++){
    const nx=clamp(explorer.position.x+dx/steps,-52,52),nz=clamp(explorer.position.z+dz/steps,-59,35);
    if(isBlocked(nx,nz))break;
    let stopped=false;
    if(state.jump<.65)for(const toy of startToys){
      const data=toy.userData,offsetX=toy.position.x-nx,offsetZ=toy.position.z-nz;
      const distance=Math.hypot(offsetX,offsetZ),minimum=data.radius+.88;
      if(distance<minimum){
        const normalX=distance>.001?offsetX/distance:Math.sign(dx||1),normalZ=distance>.001?offsetZ/distance:0;
        const push=minimum-distance+.002;
        const tx=toy.position.x+normalX*push,tz=toy.position.z+normalZ*push;
        if(isBlocked(tx,tz)||Math.abs(tx)>51||tz>34||tz< -58){stopped=true;break}
        toy.position.set(tx,0,tz);
        if(!state.parcelTouched){state.parcelTouched=true;$('#storyHint').textContent='包裹动起来了。前面的天衍工坊，正在处理这份任务。'}
        data.velocity.x+=normalX*Math.min(4.5,push/Math.max(dt/steps,.008)*.11);
        data.velocity.y+=normalZ*Math.min(4.5,push/Math.max(dt/steps,.008)*.11);
      }
    }
    if(stopped)break;
    explorer.position.x=nx;explorer.position.z=nz;
  }
}
const clock=new THREE.Clock();const cameraTarget=new THREE.Vector3();const desiredCamera=new THREE.Vector3();let frame=0;
function animate(){
  requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);
  if(state.started&&!state.open&&mapPanel.hidden&&!helpDialog.open){
    const forward=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0)+touchAxis.forward;
    const strafe=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0)+touchAxis.turn;
    const rawLength=Math.hypot(forward,strafe),inputLength=Math.min(1,rawLength);
    const boostOn=state.boost||keys.has('shift');
    state.speed=THREE.MathUtils.damp(state.speed,inputLength*(boostOn?10:6.8),12,dt);
    if(inputLength>.08){
      const fx=forward/rawLength,sx=strafe/rawLength;
      const vx=-Math.sin(state.camYaw)*fx+Math.cos(state.camYaw)*sx;
      const vz=-Math.cos(state.camYaw)*fx-Math.sin(state.camYaw)*sx;
      const wanted=Math.atan2(-vx,-vz);
      const difference=THREE.MathUtils.euclideanModulo(wanted-state.heading+Math.PI,Math.PI*2)-Math.PI;
      state.bank=THREE.MathUtils.damp(state.bank,clamp(difference,-1,1)*.32,9,dt);
      state.heading+=difference*(1-Math.exp(-13*dt));
      moveExplorer(vx*state.speed*dt,vz*state.speed*dt,dt);
      state.walkTime+=dt*state.speed*1.4;
    }else state.bank=THREE.MathUtils.damp(state.bank,0,9,dt);
    if(state.jump>0||state.jumpVelocity>0){state.jump+=state.jumpVelocity*dt;state.jumpVelocity-=18*dt;if(state.jump<0){state.jump=0;state.jumpVelocity=0}}
    explorer.position.y=state.jump;
    explorer.rotation.y=state.heading;
    let near=null;let nearDist=9;
    for(const p of places){const d=Math.hypot(explorer.position.x-p.x,explorer.position.z-p.z);if(d<nearDist){near=p;nearDist=d}}
    state.near=near;
    updateNearby(near);
    $('#regionName').textContent=near?`${near.number} · ${near.name}`:explorer.position.z>17?'起点 · 灵感邮局':'探索中 · 作品世界';
  }
  const motion=clamp(state.speed/10,0,1),now=performance.now();
  const {body,wings,shadow}=explorer.userData;
  body.position.y=THREE.MathUtils.damp(body.position.y,1.08+Math.sin(now*.0045)*(.045+motion*.045)+motion*.08,8,dt);
  body.rotation.z=THREE.MathUtils.damp(body.rotation.z,-state.bank,9,dt);
  body.rotation.x=THREE.MathUtils.damp(body.rotation.x,-motion*.11+Math.sin(now*.002)*.025,7,dt);
  body.scale.set(1+motion*.07,1-motion*.055,1+motion*.035);
  wings.forEach((wing,i)=>wing.rotation.z=(i?1:-1)*(.14+Math.sin(now*(.004+motion*.006)+i*.65)*(.07+motion*.15)));
  shadow.position.y=.012-state.jump/1.3;
  shadow.scale.setScalar(1+state.jump*.17);
  shadow.material.opacity=.2/(1+state.jump*.4);
  for(const {note,base,phase} of floatingTianyan)note.position.y=base+Math.sin(performance.now()*.0018+phase)*.12;
  for(const toy of startToys){
    const data=toy.userData,tx=toy.position.x+data.velocity.x*dt,tz=toy.position.z+data.velocity.y*dt;
    if(!isBlocked(tx,tz)&&Math.abs(tx)<51&&tz<34&&tz> -58){toy.position.x=tx;toy.position.z=tz}
    else data.velocity.set(0,0);
    toy.rotation.z-=data.velocity.x*dt*.75;
    toy.rotation.x+=data.velocity.y*dt*.75;
    data.velocity.multiplyScalar(Math.exp(-7*dt));
  }
  const targetX=explorer.position.x,targetZ=explorer.position.z;
  const firstFocus=clamp((targetZ-14)/13,0,1)*clamp((12-Math.abs(targetX))/8,0,1);
  cameraTarget.set(targetX-firstFocus*6.5,1.4+state.jump*.3,targetZ-2.3-firstFocus*4);
  const distance=innerWidth<760?state.camDistance*.78:state.camDistance;
  desiredCamera.set(targetX+Math.sin(state.camYaw)*distance,state.camHeight+(innerWidth<760?2:0),targetZ+Math.cos(state.camYaw)*distance);
  camera.position.lerp(desiredCamera,1-Math.exp(-4*dt));camera.lookAt(cameraTarget);
  // On mobile, animating every other shadow update keeps the toy world responsive.
  if(innerWidth<760){renderer.shadowMap.autoUpdate=(frame++%3===0)}
  renderer.render(scene,camera);
}
camera.position.set(0,9.5,42);camera.lookAt(-6,1.4,23);
animate();
loading.classList.add('done');setTimeout(()=>loading.remove(),450);
