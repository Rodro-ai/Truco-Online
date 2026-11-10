const express=require('express'),http=require('http'),{Server}=require('socket.io'),M=require('./motor');
const app=express();app.use(express.static(__dirname+'/public'));
const srv=http.createServer(app),io=new Server(srv),rooms={};
const code=()=>{let c;do c=Math.random().toString(36).slice(2,6).toUpperCase();while(rooms[c]);return c};
const clean=s=>String(s||'').replace(/[<>&"'`\\]/g,'').trim().slice(0,14)||'Jugador';
const push=r=>r.g&&r.ids.forEach((id,w)=>id&&io.to(id).emit('estado',M.view(r.g,w)));
function start(r,names,bot){r.g=M.nuevo(names,bot,()=>push(r));push(r)}
function leave(s){const r=rooms[s.data.room];if(!r)return;if(r.g)r.g.dead=true;delete rooms[r.code];
r.ids.forEach(id=>id&&id!==s.id&&io.to(id).emit('salio'))}
io.on('connection',s=>{
s.on('crear',(n,ia)=>{leave(s);const r={code:code(),ids:[s.id,null],names:[clean(n)]};rooms[r.code]=r;s.data.room=r.code;
if(ia)start(r,[r.names[0],'La IA'],1);else s.emit('sala',r.code)});
s.on('unirse',(c,n)=>{const r=rooms[String(c).toUpperCase().trim()];if(!r||r.ids[1]||r.g)return s.emit('error','Sala inexistente o completa.');
r.ids[1]=s.id;r.names.push(clean(n));s.data.room=r.code;start(r,r.names,null)});
s.on('accion',a=>{const r=rooms[s.data.room];if(!r||!r.g)return;if(M.act(r.g,r.ids.indexOf(s.id),a)=='no')s.emit('error','Jugada no válida.')});
s.on('disconnect',()=>leave(s))});
srv.listen(process.env.PORT||3000,()=>console.log('Truco en http://localhost:'+(process.env.PORT||3000)));
