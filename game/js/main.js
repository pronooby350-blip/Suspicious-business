// ================= input =================
const cv=$('#cv'),g=cv.getContext('2d');g.imageSmoothingEnabled=false;
function mpos(e){const r=cv.getBoundingClientRect();G.mx=(e.clientX-r.left)/r.width*800;G.my=(e.clientY-r.top)/r.height*500;if(G.wheel)wheelHover(e)}
cv.addEventListener('mousemove',mpos);$('#wheel').addEventListener('mousemove',mpos);
cv.addEventListener('mousedown',e=>{mpos(e);if(e.button===0&&run&&!PH.on){G.down=1;G.click=1;if(!G.wheel)attack()}});
addEventListener('mouseup',()=>{G.down=0});addEventListener('blur',()=>{keys={};G.down=0});
function kd(e){const t=e.target.tagName;if(t==='INPUT'||t==='TEXTAREA')return;const k=e.key.toLowerCase();
if(k==='arrowup'){e.preventDefault();phoneToggle();return}
if(k==='tab'){e.preventDefault();if(!e.repeat&&run&&!cur&&!UI&&!PH.on&&!G.dead)openWheel();return}
if(k==='escape'){closeUI();endTalk();phoneClose();if(G.wheel)closeWheel(true);return}
if(k===' '){if(MG){e.preventDefault();stir();return}if(run&&!cur&&!UI)e.preventDefault()}
if(!run||G.dead)return;
if(k==='e'&&!cur&&!UI&&!PH.on&&!G.busted)doE();
if(k==='f'&&!cur&&!UI&&!PH.on&&!G.busted)doF();
if(k==='h'&&G.veh&&!e.repeat)sfx('horn');
if(/^[1-5]$/.test(k)&&!cur&&!UI){const w=WORDER[+k-1];if(S.own[w]){S.w=w;sfx('click')}}
if(k.length===1||k==='shift'||k===' ')keys[k]=1}
addEventListener('keydown',kd);addEventListener('keyup',e=>{const k=e.key.toLowerCase();delete keys[k];if(k==='tab'&&G.wheel)closeWheel()});
function doE(){if(G.near)return talk(G.near);if(G.veh){if(G.sellOK)sellCar();return}
if(S.in>=0){const a=interiorHint();if(a){if(a.k==='exit')leaveB();else ACT[a.k]()}return}
const d=doorNear();if(d>=0)enterB(d)}
function doF(){if(S.in>=0)return;if(G.veh)exitCar();else{const c=carNear();if(c)enterCar(c)}}
// ================= weapon wheel =================
function openWheel(){G.wheel=1;G.wsel=S.w;const w=$('#wheel');w.querySelectorAll('.sl').forEach(e=>e.remove());const n=WORDER.length,R=140,st=$('#st'),k=st.clientHeight/500;
WORDER.forEach((id,i)=>{const a=-Math.PI/2+i/n*Math.PI*2,d=h('div',{cls:'sl'+(S.own[id]?'':' no'),'data-id':id},WEP[id].n,h('small',WEP[id].am?S.am[WEP[id].am]+' ammo':S.own[id]?'melee':'locked'));d.style.left=`calc(50% + ${Math.cos(a)*R*k}px - 52px)`;d.style.top=`calc(50% + ${Math.sin(a)*R*k*.8}px - 24px)`;d.style.transform='scale('+Math.max(.7,k)+')';w.append(d)});
w.classList.add('on');wheelSel();sfx('open')}
function wheelHover(e){const r=$('#st').getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=(e.clientY-(r.top+r.height/2))/.8;if(Math.hypot(dx,dy)<30)return;let a=Math.atan2(dy,dx)+Math.PI/2;if(a<0)a+=Math.PI*2;const n=WORDER.length,i=Math.round(a/(Math.PI*2)*n)%n;if(S.own[WORDER[i]]){G.wsel=WORDER[i];wheelSel()}}
function wheelSel(){$('#wheel').querySelectorAll('.sl').forEach(e=>e.classList.toggle('sel',e.dataset.id===G.wsel))}
function closeWheel(cancel){G.wheel=0;$('#wheel').classList.remove('on');if(!cancel&&S.own[G.wsel]){if(S.w!==G.wsel)sfx('click');S.w=G.wsel}}
$('#wheel').addEventListener('click',e=>{const s=e.target.closest('.sl');if(s&&S.own[s.dataset.id]){G.wsel=s.dataset.id;closeWheel()}});
addEventListener('resize',layoutPhone);
// ================= update =================
function update(dt){fr++;G.t+=dt;if(G.wheel)dt*=.2;S.min+=dt*2;
tickMissions(dt);updPlayer(dt);updPeds(dt);updCars(dt);updBullets(dt);updWanted(dt);updSus(dt);
for(let i=FX.length-1;i>=0;i--){const f=FX[i];f.x+=f.vx*dt;f.y+=f.vy*dt;f.l-=dt;if(f.l<=0)FX.splice(i,1)}
if(S.in<0&&(fr%60===0)){const live=CARS.filter(c=>c.dr==='ai'&&c.k==='civ').length;if(live<14)trafficCar(true);const prk=CARS.filter(c=>!c.dr&&c.k==='civ').length;if(prk<14&&fr%240===0)parkedCar();
for(let i=CARS.length-1;i>=0;i--){const c=CARS[i];if(c.dr!=='p'&&!c.dr&&c.own&&dist(c.x,c.y,S.x,S.y)>1400)CARS.splice(i,1)}}
if(fr%900===0&&!S.wanted)scanMsg(pick(['Dispatch: all quiet in Dusty Creek.','Unit 4: coffee break, over.','Dispatch: noise complaint, Maple Street.','Unit 2: stray cat on the road, over.']));
if(S.hp<=0&&!G.dead)wasted();
// prompt / interaction
G.near=null;G.hint='';G.sellOK=false;const pr=$('#pr');
if(!cur&&!UI&&!PH.on&&!G.dead){
if(S.in>=0){const a=interiorHint();if(a)G.hint='E · '+a.l}
else if(G.veh){const c=G.veh;if(inRect(YARD,c.x,c.y)&&Math.abs(c.v)<45){G.sellOK=true;G.hint='E · Sell this car for $'+Math.round((c.val+60)*(0.4+c.hp/170))+'   (F · Get out)'}else G.hint='F · Exit car   H · Horn   Space · Handbrake'}
else{const nr=NP.concat(P.filter(p=>p.cop&&0)).filter(n=>n.st!=='ko'&&n.st!=='dead'&&dist(n.x,n.y,S.x,S.y)<42).sort((a,b)=>dist(a.x,a.y,S.x,S.y)-dist(b.x,b.y,S.x,S.y))[0];
const d=doorNear(),c=carNear();if(nr){G.near=nr;G.hint='E · Talk to '+nr.n}else if(d>=0)G.hint='E · Enter '+BD[d].n;else if(c)G.hint='F · '+(c.dr==='ai'?'Carjack (pull the driver out!)':c.k==='cop'?'Steal police car':'Get in car')}}
pr.textContent=G.hint;pr.classList.toggle('on',!!G.hint)}
// ================= render =================
function person(x,y,c,f,st,hair,lying,gun,flash){g.fillStyle='#0005';g.fillRect(x-6,y+6,12,4);
if(lying){g.fillStyle=c;g.fillRect(x-9,y-1,14,7);g.fillStyle='#e0b48f';g.fillRect(x+5,y,6,6);g.fillStyle=hair||'#333';g.fillRect(x+5,y-1,6,3);return}
const w=st?Math.sin(st*.35)*2:0;g.fillStyle='#222';g.fillRect(x-4,y+2,3,5+w);g.fillRect(x+1,y+2,3,5-w);g.fillStyle=flash?'#fff':c;g.fillRect(x-5,y-6,10,9);g.fillStyle='#e0b48f';g.fillRect(x-4,y-13,8,7);g.fillStyle=hair||'#3a2a1a';g.fillRect(x-4,y-14,8,3);g.fillStyle='#000';g.fillRect(x+(f>0?1:-3),y-10,2,2)}
function drawCar(c){g.save();g.translate(c.x-G.cx|0,c.y-G.cy|0);g.rotate(c.a);g.fillStyle='#0005';g.fillRect(-25,-10,54,28);g.fillStyle=c.burn>0?'#222':c.c;g.fillRect(-27,-14,54,28);g.fillStyle='#0003';g.fillRect(-12,-12,24,24);g.fillStyle='#9fd3f0';g.fillRect(10,-11,8,22);g.fillRect(-18,-11,5,22);g.fillStyle='#ffe9a0';g.fillRect(25,-12,3,6);g.fillRect(25,6,3,6);g.fillStyle='#c33';g.fillRect(-28,-12,2,6);g.fillRect(-28,6,2,6);
if(c.k==='cop'){g.fillStyle='#111';g.fillRect(-27,-14,54,6);g.fillRect(-27,8,54,6);g.fillStyle=(c.sir&&c.dr&&Math.floor(G.t*5)%2)?'#e5534b':'#4b8fe5';g.fillRect(-4,-5,8,10);if(c.sir&&c.dr)g.fillStyle=Math.floor(G.t*5)%2?'#4b8fe5':'#e5534b',g.fillRect(-4,-5,4,10)}
if(c.hp<45&&c.hp>0){g.fillStyle='#fff3';g.fillRect(14,-4,8,8)}g.restore()}
function drawWeapon(a,flash){const w=WEP[S.w];if(w.m)return;const x=S.x-G.cx,y=S.y-6-G.cy;g.save();g.translate(x,y);g.rotate(a);g.fillStyle='#222';g.fillRect(4,-2,S.w==='pistol'?9:16,4);if(flash){g.fillStyle='#ffe27a';g.fillRect(S.w==='pistol'?13:20,-3,7,6)}g.restore()}
function drawHUDCanvas(){
// radar
const R={x:10,y:372,w:118,h:118},z=.2;g.save();g.beginPath();g.roundRect(R.x,R.y,R.w,R.h,12);g.clip();g.fillStyle='#1d2a20';g.fillRect(R.x,R.y,R.w,R.h);
if(S.in<0){const px=G.veh?G.veh.x:S.x,py=G.veh?G.veh.y:S.y,X=x=>R.x+R.w/2+(x-px)*z,Y=y=>R.y+R.h/2+(y-py)*z;g.fillStyle='#4a4d55';RY.forEach(y=>g.fillRect(R.x,Y(y-RW/2),R.w,RW*z));RX.forEach(x=>g.fillRect(X(x-RW/2),R.y,RW*z,R.h));g.fillStyle='#2e5d86';OB.forEach(o=>g.fillRect(X(o.x),Y(o.y),o.w*z,o.h*z));
BD.forEach(b=>{g.fillStyle=b.c;g.fillRect(X(b.x),Y(b.y),b.w*z,b.h*z)});
const dot=(x,y,c,r)=>{const dx=X(x)-(R.x+R.w/2),dy=Y(y)-(R.y+R.h/2),d=Math.hypot(dx,dy),m=R.w/2-5,k=d>m?m/d:1;g.fillStyle=c;g.beginPath();g.arc(R.x+R.w/2+dx*k,R.y+R.h/2+dy*k,r,0,7);g.fill()};
if(S.wanted){copList().forEach(c=>dot(c.x,c.y,Math.floor(G.t*3)%2?'#e5534b':'#4b8fe5',2.5));CARS.forEach(c=>{if(c.k==='cop'&&c.dr)dot(c.x,c.y,Math.floor(G.t*3)%2?'#4b8fe5':'#e5534b',3)})}
const t=S.wp||(G.obj&&objPos(G.obj));if(t)dot(t.x,t.y,S.wp?'#ff4fa3':'#f2b84b',3.5);dot(px,py,'#fff',3)}
else{g.fillStyle='#9aa0a6';g.font='11px monospace';g.textAlign='center';g.fillText('INSIDE',R.x+R.w/2,R.y+R.h/2+4)}g.restore();g.strokeStyle='#343944';g.lineWidth=2;g.beginPath();g.roundRect(R.x,R.y,R.w,R.h,12);g.stroke();
// weapon info
const w=WEP[S.w];g.fillStyle='#000a';g.fillRect(R.x+R.w+6,R.y+R.h-26,110,26);g.fillStyle='#e8eaed';g.font='bold 11px monospace';g.textAlign='left';g.fillText(w.n,R.x+R.w+12,R.y+R.h-14);g.fillStyle='#f2b84b';g.fillText(w.am?S.am[w.am]+' rounds':'melee',R.x+R.w+12,R.y+R.h-4);
// target arrow
const t=S.wp||(G.obj&&objPos(G.obj));if(t&&S.in<0){const sx=t.x-G.cx,sy=t.y-G.cy;if(sx<10||sx>790||sy<10||sy>490){const a=Math.atan2(t.y-S.y,t.x-S.x),ex=cl(400+Math.cos(a)*380,18,782),ey=cl(250+Math.sin(a)*230,18,482);g.save();g.translate(ex,ey);g.rotate(a);g.fillStyle=S.wp?'#ff4fa3':'#f2b84b';g.beginPath();g.moveTo(10,0);g.lineTo(-7,-8);g.lineTo(-7,8);g.fill();g.restore()}}
// crosshair
if(!G.veh&&S.in<0&&!PH.on&&!cur&&!UI&&!WEP[S.w].m){g.strokeStyle='#fff';g.lineWidth=1.5;g.beginPath();g.arc(G.mx,G.my,7,0,7);g.moveTo(G.mx-12,G.my);g.lineTo(G.mx-4,G.my);g.moveTo(G.mx+4,G.my);g.lineTo(G.mx+12,G.my);g.moveTo(G.mx,G.my-12);g.lineTo(G.mx,G.my-4);g.moveTo(G.mx,G.my+4);g.lineTo(G.mx,G.my+12);g.stroke()}
if(G.hurt>0){g.fillStyle='rgba(200,30,30,'+G.hurt*1.2+')';g.fillRect(0,0,800,500)}}
function renderOut(){const px=G.veh?G.veh.x+Math.cos(G.veh.a)*G.veh.v*.25:S.x,py=G.veh?G.veh.y+Math.sin(G.veh.a)*G.veh.v*.25:S.y;G.cx=cl(px-400,0,WW-800)|0;G.cy=cl(py-250,0,WH-500)|0;
g.drawImage(G.bg,G.cx,G.cy,800,500,0,0,800,500);
CASH.forEach(c=>{g.fillStyle='#5bc47a';g.fillRect(c.x-G.cx-4,c.y-G.cy-3,8,6);g.fillStyle='#fff';g.fillRect(c.x-G.cx-1,c.y-G.cy-2,2,4)});
const ent=[];CARS.forEach(c=>{if(Math.abs(c.x-px)<520&&Math.abs(c.y-py)<340)ent.push({y:c.y,d:()=>drawCar(c)})});
const nearHear=!!cur;P.concat(NP).forEach(n=>{if(Math.abs(n.x-px)>440||Math.abs(n.y-py)>290)return;const sx=n.x-G.cx,sy=n.y-G.cy;ent.push({y:n.y,d:()=>{person(sx,sy,n.cop?'#2f4f8f':n.c,n.f,n.m,n.hair,n.st==='dead'||n.st==='ko',0,n.hit>0);
if(n.story&&n.st!=='ko'){g.fillStyle='#fffc';g.font='9px monospace';g.textAlign='center';g.fillText(n.n,sx,sy-18)}
if(n.cop&&n.st!=='dead'&&n.st!=='ko'&&(n.ear>0||nearHear&&dist(n.x,n.y,S.x,S.y)<HEAR)){g.globalAlpha=n.ear>0?1:.4+.3*Math.sin(G.t*6);g.fillStyle='#f2b84b';g.font='12px sans-serif';g.textAlign='center';g.fillText('👂',sx,sy-(n.story?28:20));g.globalAlpha=1}
if(n.st==='ko'&&n.story){g.fillStyle='#fffc';g.font='9px monospace';g.textAlign='center';g.fillText('zzz',sx,sy-10)}}})});
if(!G.veh)ent.push({y:S.y,d:()=>{const sx=S.x-G.cx,sy=S.y-G.cy;person(sx,sy,'#d9a441',S.f||1,G.moved&&fr-G.moved<4?fr:0,'#222',false,0,G.hurt>0);
if(G.sw){const w=WEP[S.w];g.save();g.translate(sx,sy-6);g.strokeStyle=S.w==='bat'?'#c9a063':'#fff';g.lineWidth=S.w==='bat'?4:3;g.beginPath();const a=G.sw.a,p=1-G.sw.t/.2;g.arc(0,0,w.r*.75,a-1+p*2-.6,a-1+p*2);g.stroke();g.restore()}
else if(!WEP[S.w].m)drawWeapon(aimAng(),G.mf>0)}});
ent.sort((a,b)=>a.y-b.y).forEach(e=>e.d());
g.fillStyle='#ffe27a';BUL.forEach(b=>{g.save();g.translate(b.x-G.cx,b.y-G.cy);g.rotate(Math.atan2(b.vy,b.vx));g.fillRect(-5,-1,10,2);g.restore()});
FX.forEach(f=>{g.fillStyle=f.c;g.fillRect(f.x-G.cx,f.y-G.cy,f.s,f.s)});
const hh=S.min/60%24,nt=hh>=19||hh<6?.45:hh>=17?.2:0;if(nt){g.fillStyle=`rgba(10,15,45,${nt})`;g.fillRect(0,0,800,500);BD.forEach(b=>{const x=b.dx-G.cx,y=b.dy-G.cy;if(x<-60||x>860||y<-60||y>560)return;g.fillStyle='rgba(255,220,120,.14)';g.beginPath();g.arc(x,y,36+Math.sin(fr/20)*2,0,7);g.fill()});CARS.forEach(c=>{if(Math.abs(c.x-px)>450||Math.abs(c.y-py)>300)return;if(c.dr){g.fillStyle='rgba(255,240,170,.13)';g.beginPath();g.arc(c.x-G.cx+Math.cos(c.a)*50,c.y-G.cy+Math.sin(c.a)*50,34,0,7);g.fill()}})}}
function renderIn(){const b=BD[S.in],t=IN[b.t],ox=80,oy=50;G.cx=-ox;G.cy=-oy;g.fillStyle='#08090b';g.fillRect(0,0,800,500);g.fillStyle=t.fl;g.fillRect(ox,oy,640,400);g.fillStyle='#0004';for(let x=0;x<640;x+=40)g.fillRect(ox+x,oy,1,400);for(let y=0;y<400;y+=40)g.fillRect(ox,oy+y,640,1);
g.fillStyle='#2a2d33';g.fillRect(ox,oy,640,40);g.fillStyle=b.c;g.fillRect(ox,oy+34,640,6);g.fillStyle='#fff';g.font='bold 13px sans-serif';g.textAlign='center';g.fillText(b.n,ox+320,oy+22);
if(t.ck){person(ox+t.ck[0],oy+t.ck[1],b.t==='pol'?'#2f4f8f':'#8a8a8a',1,0,'#333')}
t.f.forEach(f=>{g.fillStyle='#0004';g.fillRect(ox+f[0]+4,oy+f[1]+f[3],f[2],6);g.fillStyle=f[4];g.fillRect(ox+f[0],oy+f[1],f[2],f[3]);g.fillStyle='#fff2';g.fillRect(ox+f[0],oy+f[1],f[2],4);if(f[2]>=50&&f[3]>=20){g.fillStyle='#fffb';g.font='10px sans-serif';g.textAlign='center';g.fillText(f[5],ox+f[0]+f[2]/2,oy+f[1]+f[3]/2+4)}});
g.fillStyle='#2b1d14';g.fillRect(ox+290,oy+388,60,12);g.fillStyle='#d9a441';g.fillRect(ox+290,oy+386,60,3);
t.a.forEach(a=>{const d=dist(S.x,S.y,a.x,a.y),on=d<34;g.fillStyle=on?'#f2b84b':'#f2b84b66';g.beginPath();g.arc(ox+a.x,oy+a.y,on?8+Math.sin(G.t*6)*2:6,0,7);g.fill()});
person(ox+S.x,oy+S.y,'#d9a441',S.f||1,G.moved&&fr-G.moved<4?fr:0,'#222');
CASH.length=CASH.length;const hh=S.min/60%24;if(hh>=22||hh<5){g.fillStyle='rgba(10,15,45,.25)';g.fillRect(0,0,800,500)}}
function frame(ts){requestAnimationFrame(frame);let dt=Math.min(.05,(ts-last)/1000||0);last=ts;if(!S||!run)return;
if(!PH.on)update(dt);phoneTick(dt);
if(!G.bg)G.bg=buildBG();if(S.in>=0)renderIn();else renderOut();drawHUDCanvas();updHUD()}
function updHUD(){$('#mo').textContent='$'+S.money;$('#tm').textContent=tstr();$('#bf').style.width=S.sus+'%';$('#bf').style.background=S.sus>70?'var(--r)':S.sus>40?'var(--a)':'var(--g)';$('#hf').style.width=cl(S.hp,0,100)+'%';
const s=$('#stars');s.textContent=S.wanted?'★'.repeat(S.wanted)+'☆'.repeat(5-S.wanted):'';s.classList.toggle('bl',S.wanted>0&&S.lost>0);
const lb=S.in>=0?BD[S.in]:BD.find(b=>Math.abs(S.x-b.dx)<b.w/2+25&&S.y>b.y&&S.y<b.dy+60);$('#loc').textContent=lb?lb.n:(G.veh?'Driving · '+Math.round(Math.abs(G.veh.v)*.4)+' km/h':'Dusty Creek');
$('#ob').textContent=(NP[3].ch?'RUN! ':'')+(G.ob||'');$('#ob').style.color=NP[3].ch?'var(--r)':'var(--a)'}
// boot
buildHome();layoutPhone();
setInterval(()=>{if(run&&S)save()},5000);
requestAnimationFrame(frame);
