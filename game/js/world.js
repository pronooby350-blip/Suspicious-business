// ---------- world layout ----------
const WW=3000,WH=1760,RX=[560,1500,2440],RY=[360,1000,1640],RW=110,SWK=30;
let SEED=7;const sr=()=>(SEED=SEED*16807%2147483647)/2147483647;
const BD=[],OB=[{x:700,y:1130,w:480,h:230,t:'pond'}];
const FIELD={x:1700,y:480,w:420,h:240},YARD={x:1650,y:1400,w:390,h:155};
function mk(x,bottom,w,h,col,name,type){BD.push({x,y:bottom-h,w,h,c:col,n:name,t:type,dx:x+w/2,dy:bottom})}
// indices 0-5 are the story buildings (keep order!)
mk(140,275,200,150,'#7a4e3a','Apartment','apt');mk(700,275,200,130,'#4a5d73','Workshop','work');mk(1000,275,230,130,'#8a6a2f','Hardware Store','hw');
mk(1650,275,240,140,'#3b5f8a','Police Office','pol');mk(140,1555,260,150,'#6b4a6e','Supermarket','super');mk(2560,1555,240,140,'#4f7a5a','Restaurant','rest');
mk(700,915,260,150,'#c9d3d9','Hospital','hosp');
const HC=['#8a5a4a','#6a7f8f','#8f7f5a','#5a7a6a','#7a5a7a','#9a8a6a','#5f6f9a'];
[[370,275,100,100],[1260,275,110,110],[1950,275,110,105],[2560,275,110,100],[2750,275,120,110],[80,915,120,110],[250,915,130,105],[1100,915,120,100],[1250,915,110,110],[1650,915,130,105],[1850,915,120,100],[2050,915,130,110],[2560,915,120,105],[2750,915,120,100],[700,1555,120,105],[900,1555,140,110],[2100,1555,120,100]].forEach(([x,b,w,h],i)=>mk(x,b,w,h,HC[i%HC.length],'House '+(i+1),'house'));
// interiors (room 640x400)
const IN={
apt:{fl:'#6a5a48',f:[[40,50,130,80,'#8a3b3b','Bed'],[560,50,50,70,'#cfd8dc','Fridge'],[260,46,120,22,'#222','TV'],[40,260,90,50,'#5b4636','Desk'],[430,230,110,60,'#46657a','Sofa']],a:[{x:105,y:150,l:'Sleep until morning',k:'sleep'},{x:585,y:135,l:'Raid the fridge (+HP)',k:'fridge'},{x:320,y:88,l:'Watch TV',k:'tv'},{x:85,y:325,l:'Save game',k:'savegame'}]},
work:{fl:'#4b4f57',f:[[230,70,180,50,'#7a5a2e','Workbench'],[40,60,60,60,'#3b3f46','Barrels'],[540,60,60,100,'#59606b','Shelf']],a:[{x:320,y:140,l:'Cook candy at the workbench',k:'craft'}]},
hw:{fl:'#7b6a4f',f:[[60,48,520,22,'#444','Tool wall'],[150,110,340,36,'#8a6a2f','Counter'],[40,200,70,140,'#6b5a3f','Shelf'],[530,200,70,140,'#6b5a3f','Shelf']],a:[{x:320,y:172,l:"Mike's gun counter",k:'guns'}],ck:[320,92]},
pol:{fl:'#8c93a0',f:[[190,100,260,40,'#5a6270','Front desk'],[470,50,140,150,'#2c2f36','Cells'],[40,60,80,50,'#6a5a48','Filing']],a:[{x:320,y:162,l:'Front desk: clear your record ($150)',k:'record'}],ck:[320,82]},
super:{fl:'#c9c6b8',f:[[50,90,190,32,'#9b6a4a','Shelf'],[50,170,190,32,'#9b6a4a','Shelf'],[50,250,190,32,'#9b6a4a','Shelf'],[430,90,150,40,'#3b5f8a','Checkout']],a:[{x:505,y:152,l:'Checkout: shop',k:'super'}],ck:[505,70]},
rest:{fl:'#8a5a4a',f:[[40,50,240,40,'#5a3a2a','Counter'],[360,120,80,50,'#d9c36a','Table'],[500,120,80,50,'#d9c36a','Table'],[360,250,80,50,'#d9c36a','Table'],[500,250,80,50,'#d9c36a','Table']],a:[{x:160,y:110,l:'Order a meal ($12, heals)',k:'meal'}],ck:[160,62]},
hosp:{fl:'#dfe6ea',f:[[40,60,100,60,'#e8e8e8','Bed'],[160,60,100,60,'#e8e8e8','Bed'],[440,80,150,40,'#6aa6c9','Reception']],a:[{x:515,y:142,l:'Treatment: full heal ($50)',k:'heal'}]},
house:{fl:'#7a6e5a',f:[[40,60,130,50,'#58708a','Sofa'],[240,48,100,22,'#222','TV'],[430,60,140,40,'#6b4a2e','Bookshelf'],[440,240,100,60,'#7a5a3a','Table'],[60,230,50,70,'#5b4636','Drawer']],a:[{x:85,y:318,l:'Search the drawer',k:'loot'},{x:290,y:88,l:'Watch TV',k:'tv'}]}};
const EXIT={x:320,y:392};
function isolid(x,y){if(x<24||x>616||y<46||y>394)return true;const t=IN[BD[S.in].t];for(const f of t.f)if(x+5>f[0]&&x-5<f[0]+f[2]&&y+2>f[1]&&y-3<f[1]+f[3])return true;return false}
// ---------- outdoor helpers ----------
function solid(x,y,r){r=r||6;if(x<r||y<r||x>WW-r||y>WH-r)return true;for(const b of BD)if(x+r>b.x&&x-r<b.x+b.w&&y+r>b.y&&y-r<b.y+b.h)return true;for(const o of OB)if(x+r>o.x&&x-r<o.x+o.w&&y+r>o.y&&y-r<o.y+o.h)return true;return false}
const pSolid=(x,y)=>solid(x,y+2,5);
const onRoad=(x,y,p)=>{p=p||0;return RX.some(r=>Math.abs(x-r)<RW/2+p)||RY.some(r=>Math.abs(y-r)<RW/2+p)};
const SW=[];RY.forEach(y=>{SW.push({x:0,y:y-RW/2-SWK,w:WW,h:SWK},{x:0,y:y+RW/2,w:WW,h:SWK})});RX.forEach(x=>{SW.push({x:x-RW/2-SWK,y:0,w:SWK,h:WH},{x:x+RW/2,y:0,w:SWK,h:WH})});
const inStrip=(x,y)=>SW.some(s=>x>s.x&&x<s.x+s.w&&y>s.y&&y<s.y+s.h);
const inRect=(r,x,y,p)=>x>r.x-(p||0)&&x<r.x+r.w+(p||0)&&y>r.y-(p||0)&&y<r.y+r.h+(p||0);
// road graph for traffic + police
const ND=[];const nid=(x,y)=>{let i=ND.findIndex(n=>n.x===x&&n.y===y);if(i<0){ND.push({x,y,nb:[],p:0});i=ND.length-1}return i};
const link=(a,b)=>{if(!ND[a].nb.includes(b))ND[a].nb.push(b);if(!ND[b].nb.includes(a))ND[b].nb.push(a)};
RX.forEach(x=>{const ys=[0,...RY,WH];for(let i=0;i<ys.length-1;i++)link(nid(x,ys[i]),nid(x,ys[i+1]))});
RY.forEach(y=>{const xs=[0,...RX,WW];for(let i=0;i<xs.length-1;i++)link(nid(xs[i],y),nid(xs[i+1],y))});
ND.forEach(n=>{n.p=(n.x===0||n.y===0||n.x===WW||n.y===WH)?1:0});
const NEXT=ND.map(()=>[]);ND.forEach((_,t)=>{const pv=ND.map(()=>-1),q=[t];pv[t]=t;while(q.length){const u=q.shift();ND[u].nb.forEach(v=>{if(pv[v]<0){pv[v]=u;q.push(v)}})}ND.forEach((__,a)=>{NEXT[a][t]=pv[a]})});
function nearNode(x,y){let b=0,bd=1e9;ND.forEach((n,i)=>{if(n.p)return;const d=dist(x,y,n.x,n.y);if(d<bd){bd=d;b=i}});return b}
function clearLine(x1,y1,x2,y2){const d=dist(x1,y1,x2,y2),n=Math.ceil(d/30);for(let i=1;i<n;i++){const t=i/n;if(solid(x1+(x2-x1)*t,y1+(y2-y1)*t,10))return false}return true}
// ---------- background ----------
const TREES=[];(function(){for(let i=0;i<900&&TREES.length<150;i++){const x=sr()*WW,y=sr()*WH;if(onRoad(x,y,40)||solid(x,y,30)||inRect(FIELD,x,y,30)||inRect(YARD,x,y,30))continue;TREES.push([x,y,10+sr()*8])}})();
function buildBG(){const c=document.createElement('canvas');c.width=WW;c.height=WH;const g=c.getContext('2d');SEED=11;
g.fillStyle='#2f4a35';g.fillRect(0,0,WW,WH);for(let i=0;i<9000;i++){g.fillStyle=sr()<.5?'#38573d':'#2a4230';g.fillRect(sr()*WW|0,sr()*WH|0,3,3)}
g.fillStyle='#7a7d85';RY.forEach(y=>g.fillRect(0,y-RW/2-SWK,WW,RW+SWK*2));RX.forEach(x=>g.fillRect(x-RW/2-SWK,0,RW+SWK*2,WH));
g.fillStyle='#3a3d44';RY.forEach(y=>g.fillRect(0,y-RW/2,WW,RW));RX.forEach(x=>g.fillRect(x-RW/2,0,RW,WH));
g.fillStyle='#d9c36a';RY.forEach(y=>{for(let x=0;x<WW;x+=50)g.fillRect(x,y-1.5,28,3)});RX.forEach(x=>{for(let y=0;y<WH;y+=50)g.fillRect(x-1.5,y,3,28)});
RX.forEach(x=>RY.forEach(y=>{g.fillStyle='#3a3d44';g.fillRect(x-RW/2,y-RW/2,RW,RW);g.fillStyle='#e8e8e8';for(let k=-RW/2+8;k<RW/2-8;k+=12){g.fillRect(x+k,y-RW/2+3,7,12);g.fillRect(x+k,y+RW/2-15,7,12);g.fillRect(x-RW/2+3,y+k,12,7);g.fillRect(x+RW/2-15,y+k,12,7)}}));
g.fillStyle='#3f6a3f';g.fillRect(FIELD.x,FIELD.y,FIELD.w,FIELD.h);g.strokeStyle='#ffffff88';g.lineWidth=3;g.strokeRect(FIELD.x+10,FIELD.y+10,FIELD.w-20,FIELD.h-20);g.beginPath();g.moveTo(FIELD.x+FIELD.w/2,FIELD.y+10);g.lineTo(FIELD.x+FIELD.w/2,FIELD.y+FIELD.h-10);g.stroke();g.beginPath();g.arc(FIELD.x+FIELD.w/2,FIELD.y+FIELD.h/2,36,0,7);g.stroke();
OB.forEach(o=>{g.fillStyle='#8a7a5a';g.beginPath();g.roundRect(o.x-8,o.y-8,o.w+16,o.h+16,50);g.fill();g.fillStyle='#2e5d86';g.beginPath();g.roundRect(o.x,o.y,o.w,o.h,44);g.fill();g.fillStyle='#ffffff18';for(let i=0;i<30;i++)g.fillRect(o.x+20+sr()*(o.w-40),o.y+20+sr()*(o.h-40),24,2)});
g.fillStyle='#57504a';g.fillRect(YARD.x,YARD.y,YARD.w,YARD.h);g.strokeStyle='#999';g.lineWidth=3;g.setLineDash([8,5]);g.strokeRect(YARD.x,YARD.y,YARD.w,YARD.h);g.setLineDash([]);
for(let i=0;i<9;i++){g.fillStyle=['#7a3a3a','#3a5a7a','#8a8a3a','#555'][i%4];g.fillRect(YARD.x+14+(i%5)*72,YARD.y+14+((i/5|0)*60),54,26)}
g.fillStyle='#f2b84b';g.font='bold 14px sans-serif';g.textAlign='center';g.fillText('SCRAPYARD - cars bought, no questions',YARD.x+YARD.w/2,YARD.y+YARD.h-10);
BD.forEach(b=>{g.fillStyle='#0005';g.fillRect(b.x+8,b.y+b.h,b.w,10);g.fillStyle=b.c;g.fillRect(b.x,b.y,b.w,b.h);g.fillStyle='#0003';g.fillRect(b.x,b.y,b.w,24);g.fillStyle='#fff2';for(let x=b.x+16;x<b.x+b.w-30;x+=46)for(let y=b.y+36;y<b.y+b.h-48;y+=40)g.fillRect(x,y,26,22);
g.fillStyle='#2b1d14';g.fillRect(b.dx-11,b.dy-32,22,32);g.fillStyle='#d9a441';g.fillRect(b.dx-25,b.dy-40,50,8);g.fillStyle='#ffffff30';g.fillRect(b.dx-17,b.dy,34,6);
g.fillStyle='#fffe';g.font='bold 12px sans-serif';g.textAlign='center';g.fillText(b.n,b.dx,b.y+16);
if(b.t==='hosp'){g.fillStyle='#d33';g.fillRect(b.dx-4,b.y+40,8,28);g.fillRect(b.dx-14,b.y+50,28,8)}if(b.t==='pol'){g.fillStyle='#e5534b';g.fillRect(b.x+10,b.y+4,14,6);g.fillStyle='#4b8fe5';g.fillRect(b.x+b.w-24,b.y+4,14,6)}});
TREES.forEach(t=>{g.fillStyle='#0004';g.beginPath();g.ellipse(t[0]+3,t[1]+t[2]*.8,t[2],t[2]*.5,0,0,7);g.fill();g.fillStyle='#4a3a2a';g.fillRect(t[0]-2,t[1]-2,4,t[2]*.9);g.fillStyle='#245a30';g.beginPath();g.arc(t[0],t[1]-t[2]*.6,t[2],0,7);g.fill();g.fillStyle='#2f7a3d';g.beginPath();g.arc(t[0]-t[2]*.25,t[1]-t[2]*.8,t[2]*.6,0,7);g.fill()});
g.fillStyle='#555';g.fillRect(0,WH-12,WW,5);return c}
