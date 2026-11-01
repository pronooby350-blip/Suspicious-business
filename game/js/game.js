// ================= state =================
const WEP={fist:{n:'Fists',m:1,d:8,cd:.4,r:26},bat:{n:'Baseball Bat',m:1,d:22,cd:.55,r:40,p:40},pistol:{n:'Pistol',d:22,cd:.32,sp:.04,v:760,life:.7,am:'pistol',p:200,pk:12,pc:30,snd:'shot'},smg:{n:'SMG',d:11,cd:.09,sp:.13,v:780,life:.6,am:'smg',auto:1,p:450,pk:40,pc:80,snd:'smg'},shotgun:{n:'Shotgun',d:9,cd:.85,sp:.2,pel:6,v:700,life:.38,am:'shotgun',p:350,pk:6,pc:35,snd:'shotgun'}};
const WORDER=['fist','bat','pistol','smg','shotgun'];
const NP=[
{id:'dave',n:'Dave',c:'#c98b5a',hx:400,hy:290,p:'Middle-aged American man. Tired, sarcastic, nosy, awkward small talk. Gets annoyed if the player acts strangely.'},
{id:'bob',n:'Bob',c:'#8d8d8d',hx:1150,hy:600,p:'Older raspy man. Slow, weird, overconfident. Shares bizarre theories and pointless observations.'},
{id:'mike',n:'Mike',c:'#4b5563',hx:1115,hy:290,p:'Hardware store owner. Calm, serious, dry humor, distrusts strange customers, gives sarcastic advice. Sells tools and, quietly, "garden equipment".'},
{id:'miller',n:'Officer Miller',c:'#2f4f8f',hx:1770,hy:290,cop:1,p:'Police officer. Professional, slightly sarcastic, very observant, reacts to suspicious behavior.'}];
const VIN={id:'vinny',n:'Vinny',c:'#a33',p:'The player’s old friend and partner in crime, on the phone. Loud, loyal, scheming, jokes a lot. Can offer a harmless comedy side job (return true in "job") but only occasionally.'};
const BOSS={id:'boss',n:'The Boss',c:'#6a2c91',p:'A smooth, impatient crime boss. Speaks briefly and politely threatens. Runs a fake blue candy business through the player. Everything stays fictional comedy; never explain how to make anything.'};
NP.forEach(n=>{n.x=n.hx;n.y=n.hy;n.tx=n.hx;n.ty=n.hy;n.f=1;n.story=1;n.hp=100;n.ko=0;n.st='walk';n.fl=0});
const FB={dave:['Uh huh. Sure. Whatever you say.','I just came out for some fresh air. And now you.','Not to be nosy, but what exactly is your business?','Nice day. For Dusty Creek, anyway.'],bob:['The pigeons are government drones. Just saying.','I once saw a cloud shaped exactly like a cloud.','You look like someone who owns a lot of jars.','Back in my day, candy was just candy.'],mike:['Hardware. Not a therapist. Buy something.','Hm. Cash only. Questions optional.','You are holding that like it is a secret.','Careful what you say near Miller. He has big ears.'],miller:['Move along, citizen. Or stay and look suspicious. Either works.','I am always watching. It is basically my hobby.','Nice town, quiet town. Let us keep it that way.','Anything you want to tell me? Anything at all?'],vinny:['Yo! Big plans, big plans. Call me when you need muscle.','Man, I got a guy for that. I always got a guy.','Keep your head down and your jars full, buddy.'],boss:['Talk. Make it quick.','I do not like surprises. Do not surprise me.','Keep the candy blue and the questions few.']};
const def=()=>({money:100,bank:0,sus:5,min:480,mem:{},rel:{},x:240,y:312,f:1,in:-1,hp:100,w:'bat',own:{fist:1,bat:1},am:{pistol:0,smg:0,shotgun:0},inv:{sugar:0,dye:0,jar:0,crystals:0},mi:0,oi:0,rg:0,rgt:4,stars:0,gv:'',wanted:0,lost:0,sms:{},tx:[],notes:'',loot:{},kills:0,jacks:0,sold:0,wp:null,cd:0,snitch:0,fr:0,rgs:0,day1:1});
let S=null,run=false,cur=null,hist=[],busy=false,ac=null,sample=null,last=0,jobT=-99,tw=null,UI=0,MG=null,fr=0,keys={},offNote=0;
const G={veh:null,near:null,dr:-1,act:null,cs:0,rep:[],t:0,shotT:-9,wheel:0,wsel:'fist',mx:400,my:250,down:0,cx:0,cy:0,hurt:0,mf:0,sw:null,hear:0,scan:[],ph:[],pend:0,bg:null,dead:0,busted:0,pt:0};
const P=[],CARS=[],BUL=[],CASH=[],FX=[];let H=[];
const CC=['#c0392b','#2980b9','#27ae60','#f39c12','#8e44ad','#ecf0f1','#34495e','#d35400','#16a085'],PC=['#b04a4a','#4a7ab0','#4ab07a','#b0a04a','#8a4ab0','#d0d0d0','#555','#e08a3a'];
const load=()=>{try{return JSON.parse(localStorage.getItem('sb2'))}catch(e){return null}};
const save=()=>{try{if(S)localStorage.setItem('sb2',JSON.stringify(S))}catch(e){}};
function toast(t){sfx('toast');const e=$('#tt');e.textContent=t;e.classList.add('on');clearTimeout(e.h);e.h=setTimeout(()=>e.classList.remove('on'),2800)}
const tstr=()=>{const m=S.min%1440;return (m/60|0)+':'+String(m%60|0).padStart(2,'0')};
function logTx(w,n){S.tx.unshift({w,n,t:tstr()});if(S.tx.length>14)S.tx.pop()}
const earn=(n,w)=>{n=Math.round(n);S.money+=n;logTx(w||'Cash',n);sfx('money')};
const spend=(n,w)=>{if(S.money<n){toast('Not enough cash.');return false}S.money-=n;logTx(w||'Purchase',-n);sfx('money');return true};
function sms(id,t,me){const a=S.sms[id]=S.sms[id]||[];a.push({me:!!me,t:String(t).slice(0,300)});if(a.length>40)a.shift();if(!me&&!(PH.on&&PH.app==='msg'))S.unread=(S.unread||0)+1}
function fadeDo(fn){const f=$('#fade');f.classList.add('on');setTimeout(()=>{try{fn()}catch(e){console.error(e)}setTimeout(()=>f.classList.remove('on'),120)},280)}
// ================= world population =================
function newPed(){for(let i=0;i<40;i++){const s=pick(SW),x=s.x+rnd(0,s.w),y=s.y+rnd(0,s.h);if(solid(x,y,6)||(S&&dist(x,y,S.x,S.y)<260&&i<35))continue;return{x,y,c:pick(PC),hair:pick(['#222','#5a3a1a','#c9a14a','#999']),hp:rnd(25,40),st:'walk',tx:x,ty:y,f:1,m:0,wt:rnd(0,3),fl:0,ko:0,dt:0,cash:Math.round(rnd(5,40))}}return null}
function mkCar(x,y,a,k){return{x,y,a,v:0,c:k==='cop'?'#e8e8ee':pick(CC),k:k||'civ',hp:100,dr:null,ps:0,from:0,to:0,blk:0,val:Math.round(rnd(60,220)),burn:0,rt:null,cr:rnd(85,115)}}
function parkedCar(){for(let i=0;i<60;i++){let x,y,a;if(Math.random()<.5){const ry=pick(RY),s=Math.random()<.5?-1:1;x=rnd(90,WW-90);y=ry+s*42;a=s<0?Math.PI:0;if(RX.some(r=>Math.abs(x-r)<100))continue}else{const rx=pick(RX),s=Math.random()<.5?-1:1;y=rnd(90,WH-90);x=rx+s*42;a=s<0?Math.PI/2:-Math.PI/2;if(RY.some(r=>Math.abs(y-r)<100))continue}
if(CARS.some(c=>dist(c.x,c.y,x,y)<60)||(S&&dist(x,y,S.x,S.y)<120))continue;const c=mkCar(x,y,a);CARS.push(c);return c}}
function trafficCar(portal){let a,b,t=rnd(.2,.8);if(portal){const ps=ND.map((n,i)=>i).filter(i=>ND[i].p&&dist(ND[i].x,ND[i].y,S.x,S.y)>700);if(!ps.length)return;a=pick(ps);b=ND[a].nb[0];t=.03}else{a=(Math.random()*ND.length)|0;b=pick(ND[a].nb)}
const f=ND[a],e=ND[b];let dx=e.x-f.x,dy=e.y-f.y;const l=Math.hypot(dx,dy);dx/=l;dy/=l;const x=f.x+dx*l*t-dy*17,y=f.y+dy*l*t+dx*17;if(S&&dist(x,y,S.x,S.y)<(portal?600:300))return;if(CARS.some(c=>dist(c.x,c.y,x,y)<70))return;
const c=mkCar(x,y,Math.atan2(dy,dx));c.dr='ai';c.from=a;c.to=b;c.v=rnd(60,100);c.ps=Math.random()<.35?1:0;CARS.push(c);return c}
function initWorld(){P.length=0;CARS.length=0;BUL.length=0;CASH.length=0;FX.length=0;for(let i=0;i<32;i++){const p=newPed();if(p)P.push(p)}
const c0=mkCar(330,318,0);CARS.push(c0);for(let i=0;i<12;i++)parkedCar();for(let i=0;i<14;i++)trafficCar();G.veh=null;G.rep=[]}
// ================= crime & law =================
const HOT=/\b(drugs?|weed|meth|cocaine|heroin|dealers?|narcotics?|marijuana|stash|cartel|smuggl\w*|illegal|crystals?|cook(?:ing)?|product|the boss|kill\w*|murder\w*|steal\w*|stole|rob\w*|guns?|shoot\w*|bomb|launder\w*|bod(?:y|ies)|fugitive|wanted|heist|blue candy)\b/ig,HEAR=200;
const copList=()=>[NP[3],...P.filter(p=>p.cop)].filter(c=>c.st!=='dead'&&c.st!=='ko');
function listen(t){const m=(t.match(HOT)||[]).map(s=>s.toLowerCase());if(!m.length)return 0;if(S.in>=0)return 0;const px=G.veh?G.veh.x:S.x,py=G.veh?G.veh.y:S.y;
const cs=copList().filter(c=>dist(c.x,c.y,px,py)<HEAR).sort((a,b)=>dist(a.x,a.y,px,py)-dist(b.x,b.y,px,py));if(!cs.length)return 0;
const hits=new Set(m).size,c=cs[0];c.ear=3;S.sus=cl(S.sus+14*hits,0,100);toast((c.n||'A police officer')+' overheard you say "'+m[0]+'"!');sfx('warn');
if(hits>=2||S.sus>=75||c===NP[3]&&hits>=1&&S.sus>=45){if(c===NP[3])startChase();else raise(2)}return 1}
function crime(sev,x,y){if(S.in>=0)return;let w=0;for(const c of copList())if(dist(c.x,c.y,x,y)<430){w=2;break}
if(!w)for(const c of CARS)if(c.k==='cop'&&c.dr&&dist(c.x,c.y,x,y)<430){w=2;break}
if(!w)for(const p of P)if(!p.cop&&p.st==='walk'&&dist(p.x,p.y,x,y)<270){w=1;break}
if(w===2)raise(sev);else if(w===1)G.rep.push({t:1.4,sev})}
function raise(sev){const nw=Math.min(5,Math.max(S.wanted,sev)+(S.wanted>=sev&&sev>=3?1:0));S.lost=0;S.sus=cl(S.sus+sev*5,0,100);if(nw>S.wanted){S.wanted=nw;toast('WANTED LEVEL '+'★'.repeat(nw));sfx('alarm');scanMsg('Dispatch: suspect reported, '+nw+' star response.');if(dist(NP[3].x,NP[3].y,S.x,S.y)<600&&!NP[3].ko)NP[3].ch=1}}
function scanMsg(t){G.scan.unshift(tstr()+'  '+t);if(G.scan.length>14)G.scan.pop()}
function updWanted(dt){for(let i=G.rep.length-1;i>=0;i--){G.rep[i].t-=dt;if(G.rep[i].t<=0){raise(G.rep[i].sev);G.rep.splice(i,1)}}
if(S.wanted<=0){S.lost=0;return}const px=G.veh?G.veh.x:S.x,py=G.veh?G.veh.y:S.y;let seen=false;
if(S.in<0){for(const c of copList())if(dist(c.x,c.y,px,py)<340){seen=true;break}if(!seen)for(const c of CARS)if(c.k==='cop'&&c.dr&&dist(c.x,c.y,px,py)<340){seen=true;break}}
if(seen)S.lost=0;else{S.lost+=dt;if(S.lost>(S.in>=0?5:15)){S.wanted--;S.lost=0;toast(S.wanted?'Wanted level dropped.':'You lost the cops. Wanted level cleared.');if(!S.wanted){NP[3].ch=0;scanMsg('Dispatch: all units, stand down.')}}}
if(S.wanted>0){const want=[0,1,2,2,3,4][S.wanted],have=CARS.filter(c=>c.k==='cop'&&c.dr==='ai').length;if(have<want&&(G.cs-=dt)<=0&&S.in<0){spawnCop();G.cs=4.5}}
else if(fr%120===0)for(let i=CARS.length-1;i>=0;i--){const c=CARS[i];if(c.k==='cop'&&c.dr==='ai'&&dist(c.x,c.y,S.x,S.y)>500)CARS.splice(i,1)}}
function spawnCop(){const cands=ND.map((n,i)=>i).filter(i=>dist(ND[i].x,ND[i].y,S.x,S.y)>650);if(!cands.length)return;const a=pick(cands),n=ND[a],b=pick(n.nb),e=ND[b];const c=mkCar(n.x,n.y,Math.atan2(e.y-n.y,e.x-n.x),'cop');c.dr='ai';c.from=a;c.to=b;c.v=120;c.sir=1;CARS.push(c);scanMsg('Dispatch: patrol car en route.')}
function dropCops(c){c.dropped=1;c.dr=null;const n=Math.min(2,8-P.filter(p=>p.cop&&p.st!=='dead').length);for(let i=0;i<n;i++){const o=(i?1:-1)*28,x=c.x+Math.cos(c.a+Math.PI/2)*o,y=c.y+Math.sin(c.a+Math.PI/2)*o;P.push({cop:1,x,y,c:'#2f4f8f',hair:'#222',hp:60,st:'walk',tx:x,ty:y,f:1,m:0,fl:0,ko:0,dt:0,cash:Math.round(rnd(20,60)),sh:rnd(.5,1.5)})}scanMsg('Units on foot, suspect nearby.')}
function copAI(p,dt){const px=G.veh?G.veh.x:S.x,py=G.veh?G.veh.y:S.y;
if(S.wanted<=0){p.lt=(p.lt||0)+dt;if(p.lt>8)p.rm=1;return}p.lt=0;const d=dist(p.x,p.y,px,py);
let tx=px,ty=py;if(S.in>=0){const b=BD[S.in];tx=b.dx;ty=b.dy+34;if(dist(p.x,p.y,tx,ty)<26)return}
const sp=(88+S.wanted*8)*dt,l=dist(p.x,p.y,tx,ty)||1;p.f=tx>p.x?1:-1;const nx=p.x+(tx-p.x)/l*sp,ny=p.y+(ty-p.y)/l*sp;p.m=0;
if(!pSolid(nx,p.y)){p.x=nx;p.m=fr}if(!pSolid(p.x,ny)){p.y=ny;p.m=fr}
if(S.in<0){if(d<15&&!G.veh)busted(60+S.wanted*30);
if(S.wanted>=3&&d<300&&clearLine(p.x,p.y,px,py)){p.sh-=dt;if(p.sh<=0){p.sh=rnd(.9,1.5);const a=Math.atan2(py-p.y,px-p.x)+rnd(-.14,.14);BUL.push({x:p.x,y:p.y-6,vx:Math.cos(a)*560,vy:Math.sin(a)*560,l:.7,d:7,o:'c'});sfx('shot')}}}}
// ================= combat =================
function hurtP(d){if(S.hp<=0||G.dead)return;S.hp-=d;G.hurt=.25;sfx('hit');if(S.hp<=0)wasted()}
function pow(x,y,c,n){for(let i=0;i<(n||6);i++)FX.push({x,y,vx:rnd(-60,60),vy:rnd(-70,20),l:rnd(.25,.5),c:c||'#ffe27a',s:rnd(2,4)})}
function hurt(h,d,src){if(h.st==='dead'||h.st==='ko')return;h.hp-=d;h.hit=.2;sfx('hit');pow(h.x,h.y-6,'#ffe27a',5);
if(h.hp<=0){h.hp=0;h.st=h.story?'ko':'dead';if(h.story)h.ko=20;else h.dt=22;if(h.cash&&!h.story){CASH.push({x:h.x,y:h.y,v:h.cash,l:60})}if(src==='p'){S.kills++}
if(src==='p')crime(h.cop?4:2,h.x,h.y)}
else{if(!h.cop&&!h.story){h.st='flee';h.fl=7}if(src==='p')crime(h.cop?3:1,h.x,h.y)}
if(src==='p'&&h.cop){if(h===NP[3]){NP[3].ch=1;S.sus=cl(S.sus+30,0,100)}else if(S.wanted<3)raise(3)}
if(src==='p'&&h.story&&!h.cop&&h.st==='walk'){h.st='flee';h.fl=7}}
function carHurt(c,d){c.hp-=d;if(c.hp<=0&&!c.burn){c.hp=0;c.burn=3.5+rnd(0,2);scanMsg('Vehicle on fire!')}}
function explode(c){sfx('boom');for(let i=0;i<26;i++)FX.push({x:c.x,y:c.y,vx:rnd(-160,160),vy:rnd(-160,160),l:rnd(.4,.9),c:pick(['#ff9d2e','#ffd24a','#ff5a2e','#444']),s:rnd(3,7)});
for(const h of H)if(dist(h.x,h.y,c.x,c.y)<95&&h.st!=='dead')hurt(h,60,c.own?'p':'x');for(const o of CARS)if(o!==c&&dist(o.x,o.y,c.x,c.y)<90)carHurt(o,45);
if(dist(S.x,S.y,c.x,c.y)<95&&!G.veh&&S.in<0)hurtP(45);if(G.veh===c){G.veh=null;c.dr=null;S.x+=24;engine(0,false);hurtP(55)}const i=CARS.indexOf(c);if(i>=0)CARS.splice(i,1);if(c.own)crime(2,c.x,c.y)}
function aimAng(){const ax=G.cx+G.mx,ay=G.cy+G.my;return Math.atan2(ay-(S.y-6),ax-S.x)}
function attack(){const w=WEP[S.w];if(S.cd>0||G.veh||S.in>=0||cur||UI||PH.on||G.wheel)return;const ang=aimAng();S.f=Math.cos(ang)>=0?1:-1;
if(w.m){S.cd=w.cd;G.sw={a:ang,t:.2};sfx('swing');for(const h of H){if(h.st==='dead'||h.st==='ko'||h.id==='dave'&&false)continue;const d=dist(S.x,S.y,h.x,h.y-4);if(d>w.r+8)continue;let da=Math.atan2(h.y-4-(S.y-6),h.x-S.x)-ang;da=Math.atan2(Math.sin(da),Math.cos(da));if(Math.abs(da)<1.1||d<14){hurt(h,w.d,'p');if(!h.story){h.x+=Math.cos(ang)*8;h.y+=Math.sin(ang)*8}break}}return}
if(!S.am[w.am]){sfx('empty');S.cd=.25;return}S.am[w.am]--;S.cd=w.cd;G.mf=.07;sfx(w.snd);
for(let k=0;k<(w.pel||1);k++){const a=ang+rnd(-w.sp,w.sp);BUL.push({x:S.x+Math.cos(ang)*12,y:S.y-6+Math.sin(ang)*12,vx:Math.cos(a)*w.v,vy:Math.sin(a)*w.v,l:w.life,d:w.d,o:'p'})}
if(G.t-G.shotT>1.3){G.shotT=G.t;crime(1,S.x,S.y);for(const p of P)if(!p.cop&&p.st==='walk'&&dist(p.x,p.y,S.x,S.y)<340){p.st='flee';p.fl=6}}}
function updBullets(dt){for(let i=BUL.length-1;i>=0;i--){const b=BUL[i];b.x+=b.vx*dt;b.y+=b.vy*dt;b.l-=dt;if(b.l<=0||(S.in<0&&solid(b.x,b.y,1))){BUL.splice(i,1);continue}
if(b.o==='p'){let hit=0;for(const h of H){if(h.st==='dead'||h.st==='ko')continue;if(dist(b.x,b.y,h.x,h.y-5)<11){hurt(h,b.d,'p');hit=1;break}}
if(!hit)for(const c of CARS)if(c.dr!=='p'&&dist(b.x,b.y,c.x,c.y)<18){carHurt(c,b.d*.6);pow(b.x,b.y,'#ccc',3);hit=1;if(c.dr==='ai'&&c.k==='civ'&&Math.random()<.4)c.v=0;break}
if(hit)BUL.splice(i,1)}else if(S.in<0){const tx=G.veh?G.veh.x:S.x,ty=G.veh?G.veh.y:S.y-5;if(dist(b.x,b.y,tx,ty)<(G.veh?18:10)){hurtP(b.d);if(G.veh)carHurt(G.veh,b.d*.6);BUL.splice(i,1)}}}}
function busted(fine){if(G.busted||G.dead)return;G.busted=1;const m=NP[3];m.ch=0;m.x=m.hx;m.y=m.hy;fine=fine||80;const f=Math.min(S.money,fine);S.money-=f;logTx('Fine',-f);S.inv.crystals=0;S.am={pistol:0,smg:0,shotgun:0};S.sus=30;sfx('alarm');closeUI();endTalk();phoneClose();
if(G.veh){G.veh.dr=null;G.veh=null;engine(0,false)}toast('BUSTED! Fined $'+f+'. Your crystals and ammo were confiscated.');
fadeDo(()=>{S.in=-1;S.x=BD[3].dx;S.y=BD[3].dy+36;S.wanted=0;S.lost=0;clearCops();G.busted=0;if(MS[S.mi]&&MS[S.mi].t==='Heat')setTimeout(startChase,4000)})}
function clearCops(){for(let i=P.length-1;i>=0;i--)if(P[i].cop)P.splice(i,1);for(let i=CARS.length-1;i>=0;i--)if(CARS[i].k==='cop'&&CARS[i].dr==='ai')CARS.splice(i,1)}
function wasted(){if(G.dead)return;G.dead=1;$('#wasted').classList.add('on');sfx('alarm');closeUI();endTalk();phoneClose();if(G.veh){G.veh.dr=null;G.veh=null;engine(0,false)}
setTimeout(()=>{$('#wasted').classList.remove('on');const l=Math.min(S.money,75);S.money-=l;if(l)logTx('Hospital bills',-l);S.in=-1;S.x=BD[6].dx;S.y=BD[6].dy+36;S.hp=70;S.wanted=0;S.lost=0;NP[3].ch=0;clearCops();S.min+=120;G.dead=0;toast('You woke up at the hospital. Bills: $'+l)},2400)}
// ================= missions =================
const nd=i=>{const b=BD[i];return S.in<0&&Math.abs(S.x-b.dx)<60&&S.y>b.dy-8&&S.y<b.dy+62};
const MS=[
{t:'Cover Story',r:50,i:['Listen up. Your late uncle left you that workshop, and me a business arrangement.','We sell blue candy. Pure sugar. Totally legal. Nothing suspicious. Understood?','Go to the Supermarket in the southwest. Buy sugar, blue dye and a jar. Then head back to the workshop.'],o:[{d:'Go to the Supermarket (southwest corner)',t:4,ok:()=>nd(4)||S.in===4},{d:'Buy 1 Sugar, 1 Blue Dye and 1 Jar at the checkout (E)',t:4,ok:()=>{const v=S.inv;return v.sugar>0&&v.dye>0&&v.jar>0}},{d:'Go to your Workshop (north, press E at the door)',t:1,ok:()=>nd(1)||S.in===1}]},
{t:'First Batch',r:40,i:['Good. Now cook your first batch of blue candy. Stir carefully.','At the workshop bench press E, start the batch, and hit Space when the marker is in the green. Do not burn it.'],o:[{d:'Cook a batch at the Workshop bench (E, then Space on green)',t:1,ok:()=>S.stars>0}]},
{t:'Special Delivery',r:30,i:['Dave down the road wants a taste of the candy. Two crystals.','And whatever you do, do not say anything weird around Officer Miller. He hears more than you think.'],o:[{d:'Have 2 crystals (cook more, buy supplies at the Supermarket)',ok:()=>S.inv.crystals>=2},{d:'Talk to Dave and press Give (2 crystals)',t:'dave',g:{id:'dave',n:2,p:60},ok:()=>S.gv==='dave'}]},
{t:'Big Order',r:80,i:['Bob called. He has theories about candy. He also wants three crystals.','Make a good batch, then deliver. Try not to listen to the theories.'],o:[{d:'Have 3 crystals (cook, restock at the Supermarket)',ok:()=>S.inv.crystals>=3},{d:'Talk to Bob and press Give (3 crystals)',t:'bob',g:{id:'bob',n:3,p:120},ok:()=>S.gv==='bob'}]},
{t:'Heat',r:150,s:()=>{G.pend=1},i:['Bad news. Miller heard something. He is coming for you.','Run to your apartment. Now. Do not stop for candy.'],o:[{d:'RUN to your Apartment (northwest) and get inside before Miller catches you!',t:0,ok:()=>nd(0)||S.in===0}]}];
function done(){const m=MS[S.mi];earn(m.r,'Mission: '+m.t);toast('Mission complete: '+m.t+' +$'+m.r);sms('boss','Good work on "'+m.t+'". Do not get sloppy.');S.mi++;S.oi=0;S.stars=0;S.gv='';S.rg=0;S.rgt=MS[S.mi]?5:0;NP[3].ch=0;save();if(!MS[S.mi])setTimeout(()=>toast('Chapter 1 complete. Roam, steal, shoot, repeat. More story soon!'),2500)}
function startChase(){const m=NP[3];if(m.ch||m.ko>0)return;m.ch=1;m.ct=0;S.sus=Math.max(S.sus,70);closeUI();endTalk();phoneClose();toast('Officer Miller is after you! RUN!');sfx('alarm')}
function lose(){const m=NP[3];m.ch=0;m.ct=0;S.sus=Math.max(0,S.sus-25);m.tx=m.hx;m.ty=m.hy;toast('You lost Officer Miller.')}
function objPos(o){if(!o||o.t==null)return null;if(typeof o.t==='string'){const n=NP.find(x=>x.id===o.t);return n&&{x:n.x,y:n.y}}const b=BD[o.t];return{x:b.dx,y:b.dy+14}}
// ================= buildings, cars, interaction =================
function doorNear(){if(S.in>=0||G.veh)return -1;for(let i=0;i<BD.length;i++){const b=BD[i];if(Math.abs(S.x-b.dx)<34&&S.y>b.dy-8&&S.y<b.dy+46)return i}return -1}
function carNear(){if(S.in>=0||G.veh)return null;let b=null,bd=48;for(const c of CARS){if(c.dr==='p')continue;const d=dist(S.x,S.y,c.x,c.y);if(d<bd){bd=d;b=c}}return b}
function enterB(i){const b=BD[i];sfx('door');fadeDo(()=>{S.in=i;S.x=EXIT.x;S.y=EXIT.y-24;S.f=1;if(b.t==='pol'&&S.wanted>0)setTimeout(()=>busted(100),400)})}
function leaveB(){const b=BD[S.in];sfx('door');fadeDo(()=>{S.x=b.dx;S.y=b.dy+34;S.in=-1;if(S.snitch){S.snitch=0;G.rep.push({t:.1,sev:2});toast('A neighbour saw you leaving...')}})}
function enterCar(c){if(c.burn>0)return toast('That car is on fire!');
if(c.dr==='ai'){const sd=(c.a+Math.PI/2);for(let i=0;i<1+(c.ps?1:0);i++){const x=c.x+Math.cos(sd)*(30+i*14),y=c.y+Math.sin(sd)*(30+i*14);const p={x:solid(x,y,6)?c.x:x,y:solid(x,y,6)?c.y:y,c:pick(PC),hair:pick(['#222','#5a3a1a','#c9a14a']),hp:rnd(25,40),st:'flee',tx:0,ty:0,f:1,m:0,fl:8,ko:1.2,dt:0,cash:Math.round(rnd(5,40)),cop:c.k==='cop'?1:0};if(c.k==='cop'){p.c='#2f4f8f';p.hp=60;p.sh=1}P.push(p)}
c.ps=0;S.jacks++;crime(c.k==='cop'?3:2,c.x,c.y);sfx('crash');toast('Carjacked! The driver was dumped on the street.')}
else if(!c.own){crime(c.k==='cop'?3:1,c.x,c.y)}
c.dr='p';c.own=1;c.sir=0;G.veh=c;S.x=c.x;S.y=c.y;sfx('door');while(P.length>50){const i=P.findIndex(p=>!p.cop&&p.st!=='walk');if(i<0)break;P.splice(i,1)}}
function exitCar(){const c=G.veh;if(!c)return;if(Math.abs(c.v)>150)hurtP(6);let ok=false;for(const ao of [Math.PI/2,-Math.PI/2,Math.PI,0]){const x=c.x+Math.cos(c.a+ao)*30,y=c.y+Math.sin(c.a+ao)*30;if(!pSolid(x,y)){S.x=x;S.y=y;ok=true;break}}if(!ok){S.x=c.x;S.y=c.y}c.dr=null;G.veh=null;engine(0,false);sfx('door')}
function sellCar(){const c=G.veh;if(!c)return;const v=Math.round((c.val+60)*(0.4+c.hp/170));exitCar();const i=CARS.indexOf(c);if(i>=0)CARS.splice(i,1);S.sold++;earn(v,'Scrapyard: sold car');toast('Sold for $'+v+'. No questions asked.')}
// ================= interior actions =================
const JOKES=['TV: "Breaking: local blue candy shortage blamed on mysterious demand."','TV: "Officer Miller reminds everyone: he is always watching."','TV: "Weather: dusty. Tomorrow: also dusty."','TV: "Cooking show: how to caramelize your alibi."'];
const ACT={
sleep(){fadeDo(()=>{const t=S.min%1440;S.min+=t<480?480-t:1440-t+480;S.hp=100;S.sus=Math.max(0,S.sus-15);toast('You slept. Good morning, Dusty Creek.');save()})},
fridge(){if(S.min<S.fr)return toast('The fridge is empty. For now.');S.fr=S.min+360;S.hp=Math.min(100,S.hp+25);toast('Leftovers. +25 HP.')},
tv(){toast(pick(JOKES))},savegame(){save();toast('Game saved.')},craft(){openCraft()},guns(){openGuns()},super(){openShop()},
record(){if(!spend(150,'Mysterious paperwork'))return;S.sus=0;toast('The clerk shreds something. Your suspicion is gone.')},
meal(){if(!spend(12,'Restaurant'))return;S.hp=Math.min(100,S.hp+35);S.sus=Math.max(0,S.sus-5);toast('Tasty. +35 HP.')},
heal(){if(S.hp>=100)return toast('You are fine.');if(!spend(50,'Hospital'))return;S.hp=100;toast('Patched up. HP full.')},
loot(){if(S.loot[S.in])return toast('Already picked clean.');S.loot[S.in]=1;const v=Math.round(rnd(15,70));earn(v,'Found in a drawer');toast('You found $'+v+' in a drawer.');if(Math.random()<.35){S.snitch=1;toast('...you hear a neighbour shouting outside.')}}};
function interiorHint(){const t=IN[BD[S.in].t];let best=null,bd=1e9;for(const a of t.a){const d=dist(S.x,S.y,a.x,a.y);if(d<34&&d<bd){bd=d;best=a}}if(best)return{l:best.l,k:best.k};if(dist(S.x,S.y,EXIT.x,EXIT.y)<36)return{l:'Leave',k:'exit'};return null}
// ================= entity updates =================
function movePed(p,tx,ty,sp,dt){const l=dist(p.x,p.y,tx,ty);if(l<2){p.m=0;return false}const nx=p.x+(tx-p.x)/l*sp*dt,ny=p.y+(ty-p.y)/l*sp*dt;p.m=0;if(!pSolid(nx,p.y)){p.x=nx;p.m=fr}if(!pSolid(p.x,ny)){p.y=ny;p.m=fr}p.f=tx>p.x?1:-1;return true}
function updPeds(dt){H=P.concat(NP);const px=G.veh?G.veh.x:S.x,py=G.veh?G.veh.y:S.y;
for(let i=P.length-1;i>=0;i--){const p=P[i];if(p.rm){P.splice(i,1);continue}if(p.hit>0)p.hit-=dt;if(p.ear>0)p.ear-=dt;
if(p.st==='dead'){p.dt-=dt;if(p.dt<=0){if(p.cop){P.splice(i,1)}else{const n=newPed();if(n)P[i]=n}}continue}
if(p.st==='ko'||p.ko>0){p.ko-=dt;if(p.ko<=0&&p.st==='ko'){p.st='walk';p.hp=40}if(p.st!=='flee')continue;else if(p.ko>0)continue}
if(p.cop){copAI(p,dt);continue}
if(p.st==='flee'){p.fl-=dt;const a=Math.atan2(p.y-py,p.x-px);movePed(p,p.x+Math.cos(a)*50,p.y+Math.sin(a)*50,88,dt);if(p.fl<=0)p.st='walk';continue}
p.wt-=dt;if(p.wt<=0){p.wt=rnd(1,4);for(let k=0;k<8;k++){const x=p.x+rnd(-150,150),y=p.y+rnd(-150,150);if(inStrip(x,y)&&!solid(x,y,6)){p.tx=x;p.ty=y;break}}}
if(!movePed(p,p.tx,p.ty,26,dt))p.m=0}
for(const n of NP){if(n.hit>0)n.hit-=dt;if(n.ear>0)n.ear-=dt;
if(n.st==='ko'){n.ko-=dt;if(n.ko<=0){n.st='walk';n.hp=70}continue}
if(n.ch){const tgt=S.in>=0?{x:BD[S.in].dx,y:BD[S.in].dy+30}:{x:px,y:py};const d=dist(n.x,n.y,tgt.x,tgt.y)||1;n.m=0;const sp=(S.wanted>=2?95:84)*dt;if(d>12){const nx=n.x+(tgt.x-n.x)/d*sp,ny=n.y+(tgt.y-n.y)/d*sp;if(!pSolid(nx,n.y)){n.x=nx;n.m=fr}if(!pSolid(n.x,ny)){n.y=ny;n.m=fr}}n.f=tgt.x>n.x?1:-1;
if(S.in<0){if(d<15&&!G.veh)busted(80);else if(d>430){n.ct=(n.ct||0)+dt;if(n.ct>3&&S.wanted<=0)lose()}else n.ct=0}continue}
if(n.st==='flee'){n.fl-=dt;const a=Math.atan2(n.y-py,n.x-px);movePed(n,n.x+Math.cos(a)*50,n.y+Math.sin(a)*50,80,dt);if(n.fl<=0)n.st='walk';continue}
if(cur&&cur.id===n.id){n.f=S.x>n.x?1:-1;continue}
if(Math.random()<.004){n.tx=n.hx+(Math.random()-.5)*70;n.ty=cl(n.hy+(Math.random()-.5)*14,n.hy-8,n.hy+8)}
if(!movePed(n,n.tx,n.ty,28,dt))n.m=0}
for(let i=CASH.length-1;i>=0;i--){const c=CASH[i];c.l-=dt;if(c.l<=0){CASH.splice(i,1);continue}if(!G.veh&&S.in<0&&dist(c.x,c.y,S.x,S.y)<16){earn(c.v,'Dropped cash');CASH.splice(i,1)}}}
function updCars(dt){
for(let i=CARS.length-1;i>=0;i--){const c=CARS[i];if(c.gone){CARS.splice(i,1);continue}
if(c.burn>0){c.burn-=dt;if(Math.random()<.5)FX.push({x:c.x,y:c.y,vx:rnd(-12,12),vy:-30,l:.7,c:'#555',s:5});if(c.burn<=0){explode(c);continue}}
if(c.dr==='p')drivePlayer(c,dt);else if(c.dr==='ai'){if(c.k==='cop'&&c.sir)copDrive(c,dt);else laneDrive(c,dt)}else c.v*=1-2.2*dt;
if(c.k==='cop'&&c.dr&&c.sir&&Math.floor(G.t*2)%2===0&&c.dr!=='p'&&fr%30===0&&dist(c.x,c.y,S.x,S.y)<500)sfx('siren');
if(Math.abs(c.v)>1)moveCar(c,dt)}
for(let i=0;i<CARS.length;i++)for(let j=i+1;j<CARS.length;j++){const a=CARS[i],b=CARS[j],d=dist(a.x,a.y,b.x,b.y);if(d<32&&d>.01){const nx=(b.x-a.x)/d,ny=(b.y-a.y)/d,ov=(32-d)/2;if(!solid(b.x+nx*ov,b.y+ny*ov,13)){b.x+=nx*ov;b.y+=ny*ov}if(!solid(a.x-nx*ov,a.y-ny*ov,13)){a.x-=nx*ov;a.y-=ny*ov}const rv=Math.abs(a.v)+Math.abs(b.v);if(rv>110){carHurt(a,rv/18);carHurt(b,rv/18);sfx('crash');if(a.dr==='p'||b.dr==='p')hurtP(rv/40);if(a.dr==='p'&&b.dr==='ai'&&b.k==='cop')raise(2)}a.v*=.8;b.v*=.8}}
for(const c of CARS){if(Math.abs(c.v)<45)continue;for(const h of H){if(h.st==='dead'||h.st==='ko')continue;if(dist(c.x,c.y,h.x,h.y-4)<19){hurt(h,Math.min(60,Math.abs(c.v)/4),c.dr==='p'?'p':'x');if(h.st!=='dead'&&!h.story){h.st='ko';h.ko=3}c.v*=.85}}
if(c.dr==='ai'&&!G.veh&&S.in<0&&dist(c.x,c.y,S.x,S.y-4)<19){hurtP(Math.abs(c.v)/6);c.v*=.5}}}
function moveCar(c,dt){const nx=c.x+Math.cos(c.a)*c.v*dt,ny=c.y+Math.sin(c.a)*c.v*dt;let hb=false;if(!solid(nx,c.y,13))c.x=nx;else hb=true;if(!solid(c.x,ny,13))c.y=ny;else hb=true;if(hb){const sp=Math.abs(c.v);if(sp>90){carHurt(c,sp/9);sfx('crash');if(c===G.veh)hurtP(sp/22)}c.v*=-.25}}
function steer(c,tx,ty,turn,dt){let d=Math.atan2(ty-c.y,tx-c.x)-c.a;d=Math.atan2(Math.sin(d),Math.cos(d));c.a+=cl(d,-turn*dt,turn*dt);return d}
function blockedAhead(c){const dx=Math.cos(c.a),dy=Math.sin(c.a),rx=-dy,ry=dx;const chk=(x,y,fw,lw)=>{const ex=x-c.x,ey=y-c.y,f=ex*dx+ey*dy,l=ex*rx+ey*ry;return f>0&&f<fw&&Math.abs(l)<lw};
for(const o of CARS)if(o!==c&&chk(o.x,o.y,64,22))return true;for(const h of H)if(h.st!=='dead'&&h.st!=='ko'&&chk(h.x,h.y,52,18))return true;if(S.in<0&&!G.veh&&chk(S.x,S.y,52,18))return true;return false}
function laneDrive(c,dt){const f=ND[c.from],t=ND[c.to];let dx=t.x-f.x,dy=t.y-f.y;const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;const along=(c.x-f.x)*dx+(c.y-f.y)*dy;
if(l-along<60){if(t.p){c.gone=1;return}const o=t.nb.filter(n=>n!==c.from);c.from=c.to;c.to=pick(o.length?o:t.nb);return}
const look=along+70,tx=f.x+dx*look-dy*17,ty=f.y+dy*look+dx*17,d=steer(c,tx,ty,2.6,dt);let tv=Math.abs(d)>.5?45:c.cr;
if(c.ghost>0)c.ghost-=dt;else if(blockedAhead(c)){tv=0;c.blk+=dt;if(c.blk>5){c.ghost=2.5;c.blk=0}}else c.blk=0;c.v+=(tv-c.v)*Math.min(1,2.2*dt)}
function copDrive(c,dt){const px=G.veh?G.veh.x:S.x,py=G.veh?G.veh.y:S.y,d=dist(c.x,c.y,px,py);if(S.wanted<=0||S.in>=0){c.v*=1-1.5*dt;return}
if(d<160&&!c.dropped){c.v*=1-3.2*dt;if(Math.abs(c.v)<35)dropCops(c);return}
let ax,ay;if(d<650&&clearLine(c.x,c.y,px,py)){ax=px;ay=py}else{if(c.rt==null||dist(c.x,c.y,ND[c.rt].x,ND[c.rt].y)<75){const here=nearNode(c.x,c.y),goal=nearNode(px,py);c.rt=here===goal?goal:NEXT[here][goal]}ax=ND[c.rt].x;ay=ND[c.rt].y}
const df=steer(c,ax,ay,3.4,dt),tv=(Math.abs(df)>.9?60:175+S.wanted*18);c.v+=(tv-c.v)*Math.min(1,1.8*dt)}
function drivePlayer(c,dt){const th=(keys.w?1:0)-(keys.s?1:0),st=(keys.d?1:0)-(keys.a?1:0),hb=keys[' '];const mx=c.k==='cop'?350:320;
if(th>0)c.v+=(c.v<0?520:300)*dt;else if(th<0)c.v-=(c.v>0?520:200)*dt;else c.v*=1-.9*dt;c.v=cl(c.v,-130,mx);if(hb)c.v*=1-2.6*dt;
const sp=cl(Math.abs(c.v)/90,0,1)*Math.sign(c.v);c.a+=st*(2.3+(hb?1.2:0))*dt*sp;S.x=c.x;S.y=c.y;engine(c.v,true)}
function updPlayer(dt){S.cd=Math.max(0,S.cd-dt);if(G.hurt>0)G.hurt-=dt;if(G.mf>0)G.mf-=dt;if(G.sw){G.sw.t-=dt;if(G.sw.t<=0)G.sw=null}
if(S.hp<100&&S.hp>0)S.hp=Math.min(100,S.hp+.4*dt);
if(G.veh||G.dead||G.busted){return}
if(!cur&&!UI&&!PH.on){const dx=(keys.d?1:0)-(keys.a?1:0),dy=(keys.s?1:0)-(keys.w?1:0);
if(dx||dy){const l=Math.hypot(dx,dy),sp=(keys.shift?150:95)*dt,nx=S.x+dx/l*sp,ny=S.y+dy/l*sp;const sd=S.in>=0?isolid:pSolid;if(!sd(nx,S.y))S.x=nx;if(!sd(S.x,ny))S.y=ny;G.moved=fr;if(dx)S.f=dx;if(fr%(keys.shift?10:16)===0)sfx('step')}
if(G.down&&WEP[S.w]&&(WEP[S.w].auto||G.click)){attack();G.click=0}if(keys[' ']&&!MG)attack()}
if(S.in<0){for(const c of CARS){if(c.dr==='p')continue;const d=dist(S.x,S.y,c.x,c.y);if(d<20&&d>.1){const nx=S.x+(S.x-c.x)/d*(20-d),ny=S.y+(S.y-c.y)/d*(20-d);if(!pSolid(nx,ny)){S.x=nx;S.y=ny}}}}}
function updSus(dt){const px=G.veh?G.veh.x:S.x,py=G.veh?G.veh.y:S.y;const m=NP[3],dm=dist(m.x,m.y,px,py);let rate=-.25;
if(S.in<0&&m.st!=='ko'){if(dm<110&&S.sus>35)rate=.9;if(dm<130&&S.inv.crystals>0)rate+=.6;if(dm<250&&S.w!=='fist'&&S.w!=='bat'&&!G.veh){rate+=1.2;if(S.wanted<1&&dm<230&&Math.random()<dt*.6)crime(1,S.x,S.y)}}
S.sus=cl(S.sus+rate*dt,0,100);if(S.sus>70&&!G.w){G.w=1;sfx('warn')}if(S.sus<60)G.w=0;
if(S.sus>=100){sfx('alarm');S.sus=40;const f=Math.min(S.money,50);S.money-=f;if(f)logTx('Fine',-f);toast('Busted! Miller fined you $'+f+'.')}}
