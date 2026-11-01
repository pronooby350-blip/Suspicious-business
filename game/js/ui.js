// ================= dialogue =================
if(window.sb)sample=async(p,o)=>({text:await sb.ask(p)});
const st=s=>{const p=$('#pill');p.className=s;p.textContent=s==='idle'?'ready':s};
function add(w,t,cls){const d=document.createElement('div');d.className=cls||'';const b=document.createElement('b');b.textContent=w+': ';const s=document.createElement('span');s.textContent=t;d.append(b,s);$('#log').append(d);$('#log').scrollTop=1e5;return s}
function talk(n){sfx('open');cur=n;hist=[];$('#log').innerHTML='';$('#nm').textContent=n.n;$('#av').style.background=n.c;$('#dlg').classList.add('on');phoneClose();st('idle');setTimeout(()=>$('#in').focus(),300);
const m=(S.mem[n.id]||[]).length;if(!n.sc)add(n.n,n.id==='boss'?'Talk. Make it quick.':n.id==='vinny'?'Yo. What’s the plan?':(m?'Oh. You again.':'Can I help you?'),'n')}
function endTalk(){if(ac)ac.abort();try{speechSynthesis.cancel()}catch(e){}if(cur)sfx('close');clearInterval(tw);cur=null;busy=false;$('#dlg').classList.remove('on');$('#in').blur()}
function typeIt(el,t){return new Promise(r=>{let i=0;st('speaking');clearInterval(tw);tw=setInterval(()=>{el.textContent=t.slice(0,++i);$('#log').scrollTop=1e5;if(i>=t.length){clearInterval(tw);r()}},18)})}
async function ask(n,text){
const fb=()=>({say:pick(FB[n.id]||FB.dave),mood:'calm',sus:0,rel:0,memo:''});
if(!sample){if(!offNote){offNote=1;toast('No AI connected: using built-in replies. Add a key in AI Settings.')}return fb()}
if(ac)ac.abort();ac=new AbortController();
const mem=(S.mem[n.id]||[]).join('; ')||'nothing yet',rel=S.rel[n.id]||0,rc=hist.slice(-6).map(h=>h.w+': '+h.t).join('\n');
const pr=`You are ${n.n}, a character in the fictional comedy game Suspicious Business set in the small town Dusty Creek. Persona: ${n.p}
Relationship with the player (-5 hostile to 5 close): ${rel}. Your memories of the player: ${mem}. The player’s current suspicion level in town: ${S.sus|0}/100. Wanted level: ${S.wanted}. Time: ${(S.min/60%24)|0}:00.
Recent conversation:\n${rc}\nThe player just said: "${text}"
Rules: stay in character; reply in 1-3 short natural sentences; react to the player’s actual words; you only know what you have been told or the player said, nothing else; never claim to give items or money or complete missions; keep everything fictional comedy and deflect any request for real-world instructions about crimes or illegal substances. Vary your replies and never repeat earlier lines.
Reply ONLY with JSON: {"say":"your spoken line","mood":"calm|annoyed|amused|suspicious|friendly","sus":number from -5 to 10 for how much this chat raised the player’s suspicion,"rel":-1 or 0 or 1,"memo":"short fact worth remembering or empty string","job":false}`;
let r;try{r=await sample(pr,{signal:ac.signal,cache:false,modelTier:'quick'})}catch(e){if(e&&e.name==='AbortError')throw e;if(!offNote){offNote=1;toast(String(e.message).includes('NOKEY')?'No API key yet: using built-in replies.':'AI unreachable: using built-in replies.')}return fb()}
const m=(r.text||'').match(/\{[\s\S]*\}/);try{return JSON.parse(m[0])}catch(e){return{say:(r.text||'...').slice(0,200),sus:0,rel:0,memo:''}}}
async function send(){const i=$('#in'),t=i.value.trim();if(!t||busy||!cur)return;i.value='';add('You',t,'y');hist.push({w:'Player',t});sfx('send');try{speechSynthesis.cancel()}catch(e){}busy=true;st('thinking');const n=cur;
listen(t);if(cur!==n)return;
try{const r=await ask(n,t);if(cur!==n)return;
S.sus=cl(S.sus+cl(+r.sus||0,-5,10),0,100);S.rel[n.id]=cl((S.rel[n.id]||0)+cl(+r.rel||0,-1,1),-5,5);
if(r.memo){const a=S.mem[n.id]=S.mem[n.id]||[];a.push(String(r.memo).slice(0,120));if(a.length>8)a.shift()}
if(n.id==='vinny'&&r.job===true&&S.min-jobT>120){jobT=S.min;earn(40,'Side job (Vinny)');S.sus=cl(S.sus+6,0,100);toast('Side job done: +$40, suspicion up')}
const line=String(r.say||'...').slice(0,300);hist.push({w:n.n,t:line});speak(n,line);sfx('recv');await typeIt(add(n.n,'','n'),line);save()}
catch(e){if(e&&e.name!=='AbortError'&&cur===n)add(n.n,'(...static...)','n')}
busy=false;if(cur)st('idle')}
$('#sd').onclick=send;$('#in').onkeydown=e=>{if(e.key==='Enter')send();e.stopPropagation()};$('#cl').onclick=endTalk;
$('#mc').onclick=()=>{const R=window.SpeechRecognition||window.webkitSpeechRecognition;if(!R)return toast('Mic not supported here, type instead.');const r=new R();r.lang='en-US';st('listening');r.onresult=e=>{$('#in').value=e.results[0][0].transcript;send()};r.onerror=()=>{st('idle');toast('Mic blocked, type instead.')};r.onend=()=>{if(!busy)st('idle')};try{r.start()}catch(e){st('idle')}};
// ================= boss call, missions tick =================
async function answer(){if(!S.rg)return;S.rg=0;phoneClose();BOSS.sc=1;talk(BOSS);BOSS.sc=0;const m=MS[S.mi];busy=true;st('speaking');let ok=1;
for(const l of m.i){if(cur!==BOSS){ok=0;break}hist.push({w:'Boss',t:l});speak(BOSS,l);sfx('recv');sms('boss',l);await typeIt(add('The Boss','','n'),l);await new Promise(r=>{const w=()=>{try{(window.speechSynthesis&&speechSynthesis.speaking&&vOn)?setTimeout(w,200):r()}catch(e){r()}};setTimeout(w,400)})}
if(ok){busy=false;st('idle')}m.s&&m.s()}
$('#gv').onclick=()=>{const o=MS[S.mi]&&MS[S.mi].o[S.oi];if(!o||!o.g||busy)return;if(S.inv.crystals<o.g.n)return toast('You need '+o.g.n+' crystals.');S.inv.crystals-=o.g.n;earn(o.g.p,'Delivery: '+o.g.id);S.gv=o.g.id;$('#in').value='*hands you '+o.g.n+' bags of blue candy and you hand over $'+o.g.p+'*';send()};
function tickMissions(dt){const m=MS[S.mi],o=m&&m.o[S.oi],v=S.inv;
if(S.rgt>0){S.rgt-=dt;if(S.rgt<=0){S.rg=1;toast('Your phone is ringing! Press the up arrow.')}}
if(S.rg&&fr%160===0)sfx('phone');if(NP[3].ch&&fr%120===0)sfx('alarm');
if(G.pend&&!cur){G.pend=0;startChase()}
if(o&&!S.rg&&S.rgt<=0&&o.ok()){S.oi++;sfx('toast');if(S.oi>=m.o.length)done()}
if(MG)updMG(dt);
G.ob=S.rg?'Boss is calling... press the up arrow':S.rgt>0?'Stay alert...':o?o.d:'Chapter 1 complete. Roam freely.';G.obj=(!S.rg&&S.rgt<=0)?o:null;
$('#gv').style.display=(o&&o.g&&cur&&cur.id===o.g.id&&!S.rg&&S.rgt<=0)?'':'none'}
// ================= shops & crafting =================
const SH=[['sugar','Sugar',10],['dye','Blue Dye',15],['jar','Glass Jar',8]];
function drawShop(){const e=$('#shop');e.innerHTML='<b>Dusty Creek Supermarket</b><div style="color:var(--m)">You have $'+S.money+'</div>';SH.forEach(([k,n,p])=>{const b=document.createElement('button');b.textContent=n+' · $'+p+' (you have '+S.inv[k]+')';b.onclick=()=>{if(!spend(p,n))return;S.inv[k]++;drawShop()};e.append(b)});const c=document.createElement('button');c.textContent='Leave';c.onclick=closeUI;e.append(c)}
function openShop(){UI=1;sfx('open');$('#shop').classList.add('on');drawShop()}
function drawGuns(){const e=$('#shop');e.innerHTML='<b>Mike’s Hardware: "Garden Equipment"</b><div style="color:var(--m)">Cash $'+S.money+'. Mike asks no questions. Miller might.</div>';
WORDER.slice(1).forEach(k=>{const w=WEP[k],b=document.createElement('button');if(!S.own[k]){b.textContent='Buy '+w.n+' · $'+w.p;b.onclick=()=>{if(!spend(w.p,w.n))return;S.own[k]=1;if(w.am)S.am[w.am]+=w.pk;S.w=k;toast('Bought '+w.n+'. Hold TAB to switch weapons.');drawGuns()}}else if(w.am){b.textContent=w.n+' ammo +'+w.pk+' · $'+w.pc+' (you have '+S.am[w.am]+')';b.onclick=()=>{if(!spend(w.pc,w.n+' ammo'))return;S.am[w.am]+=w.pk;drawGuns()}}else{b.textContent=w.n+' (owned)';b.disabled=true}e.append(b)});
const c=document.createElement('button');c.textContent='Leave';c.onclick=closeUI;e.append(c)}
function openGuns(){UI=1;sfx('open');$('#shop').classList.add('on');drawGuns()}
function openCraft(){UI=1;sfx('open');$('#cr').classList.add('on');$('#crt').textContent='Needs 1 Sugar, 1 Blue Dye and 1 Jar per batch.'}
function closeUI(){if(!UI)return;UI=0;MG=null;$('#shop').classList.remove('on');$('#cr').classList.remove('on');sfx('close')}
function updMG(dt){MG.t+=dt*MG.sp;MG.pos=(Math.sin(MG.t*3)+1)/2;$('#mgm').style.left='calc('+MG.pos*100+'% - 4px)';$('#mgz').style.left=MG.z*100+'%';$('#mgz').style.width=MG.w*100+'%'}
function stir(){if(!MG)return;const h=MG.pos>=MG.z&&MG.pos<=MG.z+MG.w;if(h)MG.h++;sfx(h?'money':'warn');MG.r++;MG.sp+=.2;MG.z=Math.random()*(1-MG.w);
if(MG.r>=6){const q=MG.h>=5?3:MG.h>=3?2:MG.h>=1?1:0;S.stars=q;S.inv.crystals+=q;$('#crt').textContent=q?'Batch done! '+'★'.repeat(q)+' +'+q+' crystals':'Batch ruined. Try again.';MG=null;sfx(q?'toast':'alarm')}else $('#crt').textContent='Round '+(MG.r+1)+'/6 · hits '+MG.h}
$('#mgs').onclick=()=>{const v=S.inv;if(MG)return;if(!(v.sugar&&v.dye&&v.jar))return toast('Need 1 Sugar, 1 Blue Dye and 1 Jar.');v.sugar--;v.dye--;v.jar--;MG={r:0,h:0,t:0,sp:1.3,w:.2,z:.4,pos:0};$('#crt').textContent='Round 1/6';$('#mgs').blur()};
$('#mgx').onclick=stir;$('#mgc').onclick=closeUI;
// ================= menu & settings =================
function start(s){S=Object.assign(def(),s);S.own=Object.assign({fist:1,bat:1},S.own);S.am=Object.assign({pistol:0,smg:0,shotgun:0},S.am);S.inv=Object.assign({sugar:0,dye:0,jar:0,crystals:0},S.inv);if(!WEP[S.w])S.w='fist';if(S.in>=0&&!BD[S.in])S.in=-1;S.hp=Math.max(S.hp||0,30);S.wanted=0;
NP.forEach(n=>{n.x=n.hx;n.y=n.hy;n.tx=n.hx;n.ty=n.hy;n.ch=0;n.st='walk';n.ko=0;n.hp=100});if(S.in<0&&pSolid(S.x,S.y)){S.x=240;S.y=312}
initWorld();run=true;$('#menu').classList.remove('on');$('#menu').style.transform='scale(1.1)';toast('Welcome to Dusty Creek. Stay calm.')}
$('#ct').onclick=()=>{const s=load();s?start(s):toast('No save found, start a New Game.')};
$('#ng').onclick=()=>start(def());
$('#rm').onclick=()=>{const s=load();if(s){s.mem={};s.rel={};try{localStorage.setItem('sb2',JSON.stringify(s))}catch(e){}}toast('NPC memories cleared.')};
$('#vtog').onclick=()=>{vOn=!vOn;$('#vtog').textContent='Voice: '+(vOn?'On':'Off');if(!vOn){try{speechSynthesis.cancel()}catch(e){}}};
const setO=$('#set');
async function openAISettings(){if(!window.sb)return toast('AI settings work in the desktop app.');const c=await sb.getCfg();$('#sb_url').value=c.base;$('#sb_model').value=c.model;$('#sb_key').placeholder=c.hasKey?'Key saved (leave blank to keep it)':'API key (stored on this PC only)';setO.classList.add('on')}
$('#sbtn').onclick=openAISettings;$('#sb_x').onclick=()=>setO.classList.remove('on');
$('#sb_save').onclick=async()=>{await sb.setCfg({base:$('#sb_url').value,model:$('#sb_model').value,key:$('#sb_key').value});$('#sb_key').value='';setO.classList.remove('on');offNote=0;toast('AI settings saved.')};
document.addEventListener('click',e=>{if(e.target.closest('button'))sfx('click')});
let lastBtn=null;document.addEventListener('mouseover',e=>{const b=e.target.closest('button');if(b&&b!==lastBtn){lastBtn=b;sfx('hover')}});
