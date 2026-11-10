// Motor de reglas del Truco (1 contra 1). Corre solo en el servidor.
const SU=['espada','basto','oro','copa'],NU=[1,2,3,4,5,6,7,10,11,12],TN=['','Truco','Retruco','Vale cuatro'],EN={e:'Envido',r:'Real Envido',f:'Falta Envido'};
const ot=w=>1-w;
function rk(c){const{n,s}=c;if(n==1&&s=='espada')return 14;if(n==1&&s=='basto')return 13;if(n==7&&s=='espada')return 12;if(n==7&&s=='oro')return 11;
if(n==3)return 10;if(n==2)return 9;if(n==1)return 8;if(n==12)return 7;if(n==11)return 6;if(n==10)return 5;if(n==7)return 4;return n-3}
function tanto(h){const v=c=>c.n<10?c.n:0;let b=0;h.forEach(c=>b=Math.max(b,v(c)));
for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)if(h[i].s==h[j].s)b=Math.max(b,20+v(h[i])+v(h[j]));return b}
function hw(r,m){const c=x=>r.filter(v=>v===x).length;if(c(0)>=2)return 0;if(c(1)>=2)return 1;const[a,b,z]=r;
if(r.length==2){if(a==='t'&&b!=='t')return b;if(a!=='t'&&b==='t')return a;return null}
if(r.length==3){if(z!=='t')return z;if(a!=='t')return a;if(b!=='t')return b;return m}return null}
const lg=(g,t)=>g.logs.push(t);
const later=(g,ms,f)=>setTimeout(()=>{if(!g.dead)f()},ms);
function emit(g){g.cb();botTurn(g)}
function nuevo(names,bot,cb){const g={names,bot,cb,sc:[0,0],dealer:Math.random()<.5?0:1,over:null,k:0,dead:false};deal(g);return g}
function deal(g){const d=[];SU.forEach(s=>NU.forEach(n=>d.push({n,s})));
for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]]}
g.dealer=ot(g.dealer);g.mano=ot(g.dealer);g.h=[d.slice(0,3),d.slice(3,6)];g.orig=[[...g.h[0]],[...g.h[1]]];
Object.assign(g,{pl:[[],[]],res:[],rd:0,turn:g.mano,tl:0,owner:null,envDone:false,env:null,pend:null,saved:null,pause:false,logs:[]});
lg(g,'Nueva mano. '+g.names[g.mano]+' es mano.');emit(g)}
const envPts=(g,c)=>{const k=c[c.length-1];return k=='f'?Math.max(1,30-Math.max(...g.sc)):k=='e'?2:3};
const envOK=(g,w,resp)=>g.rd==0&&!g.envDone&&g.pl[w].length==0&&(resp?(g.tl==1&&g.pend&&g.pend.t=='truco'):(g.tl==0&&!g.pend));
function trucoOK(g,w){if(g.rd<2)return true;const h=g.h[w][0];return!((h&&h.n==4)||(g.pl[0][2]&&g.pl[0][2].n==4)||(g.pl[1][2]&&g.pl[1][2].n==4))}
function award(g,w,n){g.sc[w]+=n;lg(g,g.names[w]+' suma '+n+' punto'+(n>1?'s':'')+'.');if(g.sc[w]>=30){g.sc[w]=30;g.over=w}}
function callEnv(g,w,k){if(g.pend&&g.pend.t=='truco')g.saved=g.pend;
if(g.env)g.env.calls.push(k);else g.env={calls:[k]};g.env.last=w;g.pend={t:'env',to:ot(w)};
lg(g,g.names[w]+': «'+EN[k]+'»');emit(g)}
function envResp(g,w,a){const e=g.env,c=e.calls;
if(a=='n'){lg(g,g.names[w]+': «No quiero»');award(g,e.last,c.length>1?envPts(g,c.slice(0,-1)):1);return endEnv(g)}
if(a=='q'){lg(g,g.names[w]+': «Quiero»');const m=g.mano,o=ot(m),tm=tanto(g.orig[m]),to=tanto(g.orig[o]);
lg(g,g.names[m]+': «'+tm+'»');let win=m;if(to>tm){lg(g,g.names[o]+': «'+to+'»');win=o}else lg(g,g.names[o]+': «Son buenas»');
award(g,win,envPts(g,c));return endEnv(g)}
callEnv(g,w,a)}
function endEnv(g){g.envDone=true;g.pend=g.saved;g.saved=null;emit(g)}
function callTruco(g,w){g.tl++;g.owner=null;g.pend={t:'truco',to:ot(w),by:w};lg(g,g.names[w]+': «'+TN[g.tl]+'»');emit(g)}
function trucoResp(g,w,a){const p=g.pend;
if(a=='n'){lg(g,g.names[w]+': «No quiero»');return handEnd(g,p.by,g.tl==1?1:g.tl)}
g.owner=w;g.pend=null;lg(g,g.names[w]+': «Quiero»');if(a=='rt')return callTruco(g,w);emit(g)}
function handEnd(g,w,n){g.pause=true;g.pend=null;award(g,w,n);emit(g);if(!g.over)later(g,2200,()=>deal(g))}
function mazo(g,w){lg(g,g.names[w]+' se va al mazo.');handEnd(g,ot(w),(g.tl?g.tl+1:1)+(!g.envDone&&g.rd==0?1:0))}
function play(g,w,i){const c=g.h[w].splice(i,1)[0];g.pl[w].push(c);lg(g,g.names[w]+' juega el '+c.n+' de '+c.s+'.');
if(g.pl[0].length==g.pl[1].length){g.pause=true;emit(g);later(g,1300,()=>{g.pause=false;endRound(g)})}else{g.turn=ot(w);emit(g)}}
function endRound(g){const r=g.rd,a=rk(g.pl[0][r]),b=rk(g.pl[1][r]),w=a>b?0:a<b?1:'t';g.res.push(w);
lg(g,w==='t'?'Parda.':g.names[w]+' gana la ronda.');const x=hw(g.res,g.mano);
if(x!==null)return handEnd(g,x,g.tl?g.tl+1:1);g.rd++;g.turn=w==='t'?g.mano:w;emit(g)}
// Acción de un jugador: devuelve 'no' si no es válida.
function act(g,w,a){if(!a||g.over||g.pause)return'no';const p=g.pend,t=a.t;
if(t=='play'){if(g.turn!=w||p||!g.h[w][a.i])return'no';return play(g,w,a.i)}
if(t=='truco'){if(g.turn!=w||p||!(g.tl==0||(g.owner==w&&g.tl<3))||!trucoOK(g,w))return'no';return callTruco(g,w)}
if(t=='mazo'){if(g.turn!=w||p)return'no';return mazo(g,w)}
if(t=='env'){const k=a.k;if(!EN[k])return'no';
if(p&&p.t=='env'){if(p.to!=w)return'no';const c=g.env.calls,f=c.includes('f'),r=c.includes('r');if(f||k=='e'||(k=='r'&&r))return'no';return callEnv(g,w,k)}
if(p){if(p.to!=w||!envOK(g,w,1))return'no';return callEnv(g,w,k)}
if(g.turn!=w||!envOK(g,w))return'no';return callEnv(g,w,k)}
if(t=='q'||t=='n'||t=='rt'){if(!p||p.to!=w)return'no';
if(p.t=='env'){if(t=='rt')return'no';return envResp(g,w,t)}
if(t=='rt'&&(g.tl>=3||!trucoOK(g,w)))return'no';return trucoResp(g,w,t)}
return'no'}
// Botones disponibles para un jugador (lo decide el servidor).
function acts(g,w){if(g.over||g.pause)return[];const p=g.pend,A=[],b=(t,l,k)=>A.push({t,k,l});
if(p&&p.to==w){b('q','Quiero');b('n','No quiero');
if(p.t=='env'){const c=g.env.calls,f=c.includes('f'),r=c.includes('r');if(!f&&!r)b('env','Real Envido','r');if(!f)b('env','Falta Envido','f')}
else{if(g.tl<3&&trucoOK(g,w))b('rt','Quiero '+TN[g.tl+1]);if(envOK(g,w,1)){b('env','Envido','e');b('env','Real Envido','r');b('env','Falta Envido','f')}}}
else if(!p&&g.turn==w){if((g.tl==0||(g.owner==w&&g.tl<3))&&trucoOK(g,w))b('truco',TN[g.tl+1]);
if(envOK(g,w)){b('env','Envido','e');b('env','Real Envido','r');b('env','Falta Envido','f')}b('mazo','Irse al mazo')}
return A}
// Estado que ve cada jugador: solo sus propias cartas.
function view(g,w){return{names:g.names,you:w,sc:g.sc,mano:g.mano,turn:g.turn,tl:g.tl,over:g.over,pause:g.pause,hand:g.h[w],oppN:g.h[ot(w)].length,pl:g.pl,
pend:g.pend?{t:g.pend.t,to:g.pend.to}:null,val:g.pend&&g.pend.t=='truco'?(g.tl==1?1:g.tl):(g.tl?g.tl+1:1),logs:g.logs.slice(-6),acts:acts(g,w)}}
// ---- IA (jugador g.bot) ----
function str(g,w){const h=g.h[w].map(rk).sort((x,y)=>y-x),W=[.5,.3,.2];let a=0,b=0;h.forEach((v,i)=>{a+=W[i]*v/14;b+=W[i]});
return(b?a/b:0)+.12*(g.res.filter(x=>x===w).length-g.res.filter(x=>x===ot(w)).length)}
function botTurn(g){if(g.bot==null||g.over||g.pause)return;const w=g.bot,k=++g.k,due=()=>g.pend?g.pend.to==w:g.turn==w;
if(due())later(g,900,()=>{if(g.k==k&&!g.over&&!g.pause&&due())botMove(g)})}
function botMove(g){const w=g.bot,o=ot(w),p=g.pend,h=g.h[w],t=tanto(g.orig[w]),s=str(g,w),R=Math.random,me=k=>envResp(g,w,k);
if(p&&p.t=='env'){const c=g.env.calls,f=c.includes('f'),r=c.includes('r'),need=25+(r?1:0)+(f?4:0)+(c.length>2?1:0);
if(!f){if(t>=need+3&&R()<.7)return me(t>=32||r?'f':'r');if(t<need&&R()<.1)return me(r||R()<.35?'f':'r')}
return me(t>=need||R()<.12?'q':'n')}
if(p){if(envOK(g,w,1)&&((t>=27&&R()<.7)||(t>=20&&R()<.15)))return callEnv(g,w,t>=31?'f':t>=29?'r':'e');
if(g.tl<3&&trucoOK(g,w)&&((s>.8&&R()<.5)||R()<.14-.03*g.tl))return trucoResp(g,w,'rt');
return trucoResp(g,w,s>.4+.06*g.tl||R()<.12?'q':'n')}
if(envOK(g,w)){const fa=t>=31||(t>=29&&g.sc[o]>=22);
if(t>=27&&R()<.8)return callEnv(g,w,fa?'f':t>=29?'r':'e');
if(t>=24&&t<27&&R()<.3)return callEnv(g,w,'e');
if(t<24&&R()<.1){const x=R();return callEnv(g,w,x<.65?'e':x<.9?'r':'f')}}
if((g.tl==0||(g.owner==w&&g.tl<3))&&trucoOK(g,w)&&((s>.72+.04*g.tl&&R()<.5)||R()<.09))return callTruco(g,w);
const ix=h.map((c,i)=>i).sort((x,y)=>rk(h[x])-rk(h[y]));let i;
if(g.pl[o].length>g.pl[w].length){const oc=g.pl[o][g.rd];i=ix.find(x=>rk(h[x])>rk(oc));if(i==null)i=ix[0]}
else i=g.rd==0?(R()<.35?ix[ix.length-1]:ix[ix.length>1?1:0]):ix[ix.length-1];
play(g,w,i)}
module.exports={nuevo,act,view,acts};
