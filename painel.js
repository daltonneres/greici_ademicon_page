/* Painel conectado ao Firebase: login pelo Firebase Auth e dados no Firestore (veja db.js e firestore.rules). */
var $=function(i){return document.getElementById(i)},ST=localStorage,SS=sessionStorage;
var CAT={imovel:"Imóvel",veiculo:"Veículo",servicos:"Serviços",investimento:"Investimento"},D={leads:[],visitas:[]},sel="",cur=new Date();
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function cat(t){t=String(t||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();return t.indexOf("imov")==0?"imovel":t.indexOf("ve")==0?"veiculo":t.indexOf("serv")==0?"servicos":t.indexOf("invest")==0?"investimento":""}
function fd(s){var d=new Date(s);return isNaN(d)?"-":d.toLocaleDateString("pt-BR")+" "+d.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}
function sha(s){return crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)).then(function(b){return Array.from(new Uint8Array(b)).map(function(x){return x.toString(16).padStart(2,"0")}).join("")})}

/* Acesso: sem login volta para admin.html */
var AUTH=window.DB?firebase.auth():null,LOGIN="admin.html";
$("out").onclick=function(){AUTH.signOut().then(function(){location.replace(LOGIN)})};
if(AUTH)AUTH.onAuthStateChanged(function(u){if(u)start();else location.replace(LOGIN)});else location.replace(LOGIN);

/* Dados: banco quando houver ENDPOINT; senão vazio (ou exemplo, se ativado) */
function demo(){var n=["Ana Souza","Carlos Lima","Marta Reis","João Pedro","Luiza Alves","Rafael Dias","Paula Nunes","Bruno Costa"],c=["Imóvel","Veículo","Serviços","Investimento"],s=["novo","contatado","negociando","fechado","perdido"],L=[],V=[],i,d;
for(i=0;i<16;i++){d=new Date();d.setDate(d.getDate()+(i%9)-3);d.setHours(9+i%8,0,0,0);
L.push({id:i,tipo:i%3?"reuniao":"popup",nome:n[i%8],whatsapp:"(46) 99999-0"+(100+i),interesse:c[i%4],status:s[i%5],data:new Date(Date.now()-i*864e5).toISOString(),quando:i%3?d.toISOString().slice(0,16):""})}
for(i=0;i<60;i++){var k=["imovel","veiculo","servicos","investimento"][(i*7)%4],o={};o[k]=2+i%4;V.push({segundos:[12,25,48,90,150,240,420][i%7],interesses:o,rolagem:30+i%70})}
return{leads:L,visitas:V}}
function load(){var F=DB.db,p=ST.getItem("demo")?Promise.resolve(demo()):Promise.all([F.collection("leads").orderBy("data","desc").limit(3000).get(),F.collection("visitas").orderBy("data","desc").limit(3000).get(),F.doc("config/disp").get()]).then(function(r){var c=r[2].exists?r[2].data():{};for(var k in c)AV[k]=c[k];
return{leads:r[0].docs.map(function(d){var o=d.data();o.id=d.id;return o}).filter(function(o){return o.tipo!=="visita"}),visitas:r[1].docs.map(function(d){return d.data()})}}).catch(function(e){console.error(e);$("db").textContent="erro ao ler (confira as regras e o e-mail da administradora)";return{leads:[],visitas:[]}});
return p.then(function(r){D=r;$("demo").hidden=!ST.getItem("demo");if(!$("db").textContent.indexOf("erro"))return render();$("db").textContent="conectado (Firebase)";render()})}
function start(){$("cid").value=ST.getItem("cal")||"";load()}

$("tabs").onclick=function(e){var b=e.target.closest("button");if(!b)return;[].forEach.call($("tabs").children,function(x){x.setAttribute("aria-pressed",x===b)});[].forEach.call(document.querySelectorAll(".v"),function(v){v.hidden=v.id!=="v-"+b.dataset.v})};
$("dm").onclick=function(){ST.setItem("demo","1");load()};$("demoOff").onclick=function(){ST.removeItem("demo");load()};
$("sv").onclick=function(){ST.setItem("cal",$("cid").value.trim());render();$("sv").textContent="Salvo ✓"};

function render(){boas();geral();leads();agenda();analise();disp()}
function kp(id,a){$(id).innerHTML=a.map(function(x){return"<div><b>"+esc(x[1])+"</b><span>"+esc(x[0])+"</span></div>"}).join("")}
function mt(s){return s>=60?Math.floor(s/60)+"min "+s%60+"s":s+"s"}
function geral(){var L=D.leads,r=L.filter(function(l){return l.tipo==="reuniao"}).length,n=L.filter(function(l){return l.status==="novo"}).length;
kp("kp",[["Leads","" +L.length],["Novos",""+n],["Reuniões agendadas",""+r],["Visitas medidas",""+D.visitas.length]]);
$("ult").innerHTML=L.length?lista(L.slice().sort(function(a,b){return new Date(b.data)-new Date(a.data)}).slice(0,5)):'<div class="card em">Nenhum lead ainda. Quando o banco estiver conectado, eles aparecem aqui.</div>'}
function lista(a){return'<div class="tw2"><table><tbody>'+a.map(function(l){return"<tr><td>"+fd(l.data)+"</td><td>"+esc(l.nome)+"</td><td><span class='tg'>"+esc(l.interesse)+"</span></td><td>"+esc(l.tipo)+"</td></tr>"}).join("")+"</tbody></table></div>"}

function leads(){var q=$("q").value.toLowerCase(),fc=$("fc").value,fs=$("fs").value;
var a=D.leads.filter(function(l){return(!q||(l.nome+l.whatsapp).toLowerCase().indexOf(q)>-1)&&(!fc||cat(l.interesse)===fc)&&(!fs||l.status===fs)}).sort(function(a,b){return new Date(b.data)-new Date(a.data)});
$("lb").innerHTML=a.length?a.map(function(l){var w=String(l.whatsapp).replace(/\D/g,"");return"<tr><td>"+fd(l.data)+"</td><td>"+esc(l.nome)+"</td><td><span class='tg'>"+esc(l.interesse)+"</span></td><td>"+esc(l.tipo)+"</td><td><select data-id='"+esc(l.id)+"' aria-label='Status'>"+["novo","contatado","negociando","fechado","perdido"].map(function(s){return"<option"+(s===l.status?" selected":"")+">"+s+"</option>"}).join("")+"</select></td><td><a class='b g' target='_blank' rel='noopener' href='https://wa.me/55"+w+"'>WhatsApp</a></td></tr>"}).join(""):'<tr><td colspan="6" class="em">Nenhum lead encontrado.</td></tr>'}
["q","fc","fs"].forEach(function(i){$(i).addEventListener("input",leads)});
$("lb").onchange=function(e){var s=e.target;if(!s.dataset.id)return;var L=null;D.leads.forEach(function(l){if(String(l.id)===s.dataset.id)L=l});if(!L)return;var old=L.status;L.status=s.value;
if(!ST.getItem("demo")){var F=DB.db,b=F.batch();b.update(F.collection("leads").doc(L.id),{status:s.value});
if(L.tipo==="reuniao"&&L.quando){var sr=F.doc("slots/"+L.quando);if(s.value==="perdido")b.delete(sr);else if(old==="perdido")b.set(sr,{quando:L.quando,lead:L.id})}
b.commit().catch(function(){L.status=old;alert("Não foi possível alterar o status. Se for uma reunião, o horário pode já estar ocupado por outra.");load()})}geral()};
$("csv").onclick=function(){var r=[["data","nome","whatsapp","categoria","origem","status"]].concat(D.leads.map(function(l){return[l.data,l.nome,l.whatsapp,l.interesse,l.tipo,l.status]}));
var t=r.map(function(x){return x.map(function(c){c=String(c==null?"":c);if(/^[=+\-@]/.test(c))c="'"+c;return'"'+c.replace(/"/g,'""')+'"'}).join(",")}).join("\n");
var a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\ufeff"+t],{type:"text/csv"}));a.download="leads.csv";a.click()};

/* Agenda */
function agenda(){var y=cur.getFullYear(),m=cur.getMonth(),f=new Date(y,m,1).getDay(),n=new Date(y,m+1,0).getDate(),ev={},h="";
D.leads.forEach(function(l){if(l.quando){var k=l.quando.slice(0,10);(ev[k]=ev[k]||[]).push(l)}});
$("mt").textContent=cur.toLocaleDateString("pt-BR",{month:"long",year:"numeric"});
"DSTQQSS".split("").forEach(function(x){h+="<i>"+x+"</i>"});for(var i=0;i<f;i++)h+="<span></span>";
for(var d=1;d<=n;d++){var k=y+"-"+String(m+1).padStart(2,"0")+"-"+String(d).padStart(2,"0");h+="<button data-k='"+k+"' class='"+(ev[k]?"ev ":"")+(k===sel?"sl ":"")+(k===new Date().toISOString().slice(0,10)?"td":"")+"'>"+d+"</button>"}
$("cal").innerHTML=h;$("cal").onclick=function(e){var b=e.target.closest("button");if(!b)return;sel=b.dataset.k;agenda();dia(ev[sel]||[])};
if(sel)dia(ev[sel]||[]);
var id=ST.getItem("cal");$("gc").innerHTML=id?"<h3>Google Agenda</h3><iframe title='Google Agenda' src='https://calendar.google.com/calendar/embed?mode=MONTH&ctz=America%2FSao_Paulo&src="+encodeURIComponent(id)+"'></iframe>":"<h3>Google Agenda</h3><p class='m'>Informe o ID da agenda em Configurações para exibi-la aqui. Para criar eventos e salas do Meet automaticamente, é preciso conectar a API do Google no back-end.</p>"}
function dia(a){$("dt").textContent=new Date(sel+"T12:00").toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long"});
$("dl").innerHTML=a.length?a.map(function(l){var t=l.quando.slice(11,16),s=l.quando.replace(/[-:]/g,"").slice(0,13)+"00",e=new Date(new Date(l.quando).getTime()+18e5),z=function(x){return x.getFullYear()+String(x.getMonth()+1).padStart(2,"0")+String(x.getDate()).padStart(2,"0")+"T"+String(x.getHours()).padStart(2,"0")+String(x.getMinutes()).padStart(2,"0")+"00"};
return"<p><b>"+esc(t)+"</b> "+esc(l.nome)+" <span class='tg'>"+esc(l.interesse)+"</span> <a target='_blank' rel='noopener' href='https://calendar.google.com/calendar/render?action=TEMPLATE&text="+encodeURIComponent("Reunião com "+l.nome)+"&dates="+z(new Date(l.quando))+"/"+z(e)+"&details="+encodeURIComponent("WhatsApp: "+l.whatsapp)+"'>Adicionar ao Google Agenda</a></p>"}).join(""):"<p class='m'>Sem reuniões neste dia.</p>"}
$("pm").onclick=function(){cur.setMonth(cur.getMonth()-1);agenda()};$("nm").onclick=function(){cur.setMonth(cur.getMonth()+1);agenda()};

/* Análises */
function analise(){var V=D.visitas,L=D.leads,t=V.reduce(function(s,v){return s+(v.segundos||0)},0),c={},lc={},b=[0,0,0,0];
V.forEach(function(v){var s=v.segundos||0;b[s<30?0:s<120?1:s<300?2:3]++;var m="",x=0;for(var k in v.interesses||{})if(v.interesses[k]>x){x=v.interesses[k];m=k}if(m)c[m]=(c[m]||0)+1});
L.forEach(function(l){var k=cat(l.interesse);if(k)lc[k]=(lc[k]||0)+1});
kp("ak",[["Visitas medidas",""+V.length],["Tempo médio",V.length?mt(Math.round(t/V.length)):"-"],["Leads",""+L.length],["Conversão",V.length?(L.length/V.length*100).toFixed(1)+"%":"-"]]);
function bars(o,rows){var mx=Math.max.apply(null,rows.map(function(r){return r[1]}).concat(1));return rows.map(function(r){return"<div class='bw'><div><span>"+esc(r[0])+"</span><b>"+r[1]+(r[2]!=null?" · "+r[2]+" leads":"")+"</b></div><i style='--w:"+r[1]/mx*100+"%'></i></div>"}).join("")}
$("bc").innerHTML=V.length||L.length?bars(0,Object.keys(CAT).map(function(k){return[CAT[k],c[k]||0,lc[k]||0]})):'<p class="m">Sem dados ainda.</p>';
$("bt").innerHTML=V.length?bars(0,[["Menos de 30s",b[0]],["30s a 2min",b[1]],["2 a 5min",b[2]],["Mais de 5min",b[3]]]):'<p class="m">Sem dados ainda.</p>';
$("an").textContent="O interesse é medido pela categoria que a pessoa mais clicou, ficou lendo ou escolheu nos formulários. A medição é anônima e agregada; informe isso na política de privacidade."}

/* Disponibilidade do site */
var AV={dias:[1,2,3,4,5],horas:["09:00","10:00","11:00","14:00","15:00","16:00","17:00"],dias_bloqueados:[],slots_bloqueados:[],janela:6},HR=[];
for(var h=8;h<=18;h++)HR.push(("0"+h).slice(-2)+":00");
function tg(box,items,on,fn,cls){$(box).innerHTML=items.map(function(x){return"<button type='button' data-k='"+esc(x[0])+"' aria-pressed='"+on(x[0])+"' class='"+(cls?cls(x[0]):"")+"'>"+esc(x[1])+"</button>"}).join("")}
function disp(){var oc=D.leads.filter(function(l){return l.quando&&l.status!=="perdido"}).map(function(l){return l.quando.slice(0,16)}),k=$("adt").value;
tg("adw","Dom Seg Ter Qua Qui Sex Sáb".split(" ").map(function(n,i){return[i,n]}),function(i){return AV.dias.indexOf(+i)>-1});
tg("ahr",HR.map(function(h){return[h,h]}),function(h){return AV.horas.indexOf(h)>-1});$("ajn").value=AV.janela;
$("abl").innerHTML=AV.dias_bloqueados.length?AV.dias_bloqueados.sort().map(function(d){return"<button type='button' class='g' data-d='"+esc(d)+"'>"+d.split("-").reverse().join("/")+" ✕</button>"}).join(""):"<span class='m'>Nenhum.</span>";
if(!k){$("aslot").innerHTML="";$("abd").hidden=true;return}
var bd=AV.dias_bloqueados.indexOf(k)>-1;$("abd").hidden=false;$("abd").textContent=bd?"Liberar dia inteiro":"Bloquear dia inteiro";
tg("aslot",AV.horas.map(function(h){return[h,h]}),function(){return false},0,function(h){var s=k+"T"+h;return oc.indexOf(s)>-1?"oc":AV.slots_bloqueados.indexOf(s)>-1||bd?"x":""})}
$("adt").onchange=disp;
$("adw").onclick=function(e){var b=e.target.closest("button");if(!b)return;var i=+b.dataset.k,p=AV.dias.indexOf(i);p>-1?AV.dias.splice(p,1):AV.dias.push(i);disp()};
$("ahr").onclick=function(e){var b=e.target.closest("button");if(!b)return;var p=AV.horas.indexOf(b.dataset.k);p>-1?AV.horas.splice(p,1):AV.horas.push(b.dataset.k);AV.horas.sort();disp()};
$("abd").onclick=function(){var k=$("adt").value,p=AV.dias_bloqueados.indexOf(k);p>-1?AV.dias_bloqueados.splice(p,1):AV.dias_bloqueados.push(k);disp()};
$("abl").onclick=function(e){var b=e.target.closest("button");if(!b)return;AV.dias_bloqueados.splice(AV.dias_bloqueados.indexOf(b.dataset.d),1);disp()};
$("aslot").onclick=function(e){var b=e.target.closest("button");if(!b||b.classList.contains("oc"))return;var s=$("adt").value+"T"+b.dataset.k,p=AV.slots_bloqueados.indexOf(s);p>-1?AV.slots_bloqueados.splice(p,1):AV.slots_bloqueados.push(s);disp()};
function avOut(){AV.janela=Math.max(1,Math.min(14,+$("ajn").value||6));var t=new Date().toISOString().slice(0,10);AV.dias_bloqueados=AV.dias_bloqueados.filter(function(d){return d>=t});AV.slots_bloqueados=AV.slots_bloqueados.filter(function(s){return s.slice(0,10)>=t});
var o=JSON.parse(JSON.stringify(AV));o.slots_ocupados=D.leads.filter(function(l){return l.quando&&l.status!=="perdido"}).map(function(l){return l.quando.slice(0,16)});return o}
$("asv").onclick=function(){var o=avOut();delete o.slots_ocupados;$("asm").textContent="Salvando…";DB.db.doc("config/disp").set(o).then(function(){$("asm").textContent="Salvo. Já vale no site."}).catch(function(){$("asm").textContent="Não foi possível salvar."});disp()};
$("adl").onclick=function(){var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(avOut(),null,2)],{type:"application/json"}));a.download="disponibilidade.json";a.click()};

/* Abertura: saudação, reuniões de hoje e previsão do tempo */
var CIDADE="Dois Vizinhos",LAT=-25.7447,LON=-53.0572,WX=null,WXC={0:"céu limpo",1:"quase sem nuvens",2:"parcialmente nublado",3:"nublado",45:"neblina",48:"neblina",51:"garoa fraca",53:"garoa",55:"garoa forte",61:"chuva fraca",63:"chuva",65:"chuva forte",80:"pancadas de chuva",81:"pancadas de chuva",82:"pancadas fortes",95:"tempestade",96:"tempestade com granizo",99:"tempestade com granizo"};
function hoje(){var x=new Date();return x.getFullYear()+"-"+("0"+(x.getMonth()+1)).slice(-2)+"-"+("0"+x.getDate()).slice(-2)}
function clima(){if(WX!==null)return;WX=false;fetch("https://api.open-meteo.com/v1/forecast?latitude="+LAT+"&longitude="+LON+"&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=America%2FSao_Paulo&forecast_days=1").then(function(r){return r.json()}).then(function(o){WX={t:Math.round(o.current.temperature_2m),c:WXC[o.current.weather_code]||"tempo variável",mx:Math.round(o.daily.temperature_2m_max[0]),mn:Math.round(o.daily.temperature_2m_min[0]),ch:o.daily.precipitation_probability_max[0]};boas()}).catch(function(){})}
function boas(){var h=new Date().getHours(),s=h<12?"Bom dia":h<18?"Boa tarde":"Boa noite",t=hoje(),
M=D.leads.filter(function(l){return l.quando&&l.quando.slice(0,10)===t&&l.status!=="perdido"}).sort(function(a,b){return a.quando<b.quando?-1:1}),n=M.length,nv=D.leads.filter(function(l){return l.status==="novo"}).length,
r=n?"Você tem <b>"+n+(n>1?" reuniões":" reunião")+"</b> hoje"+(M[0]?", a primeira às <b>"+esc(M[0].quando.slice(11,16))+"</b>":"")+".":"Você não tem reuniões hoje.",
l=nv?" Há <b>"+nv+(nv>1?" leads novos":" lead novo")+"</b> esperando contato.":"",
w=WX?"<p class='m'>Em "+esc(CIDADE)+" agora: "+WX.t+"°C, "+esc(WX.c)+". Hoje de "+WX.mn+"° a "+WX.mx+"°, chance de chuva de "+WX.ch+"%.</p>":"<p class='m'>Carregando a previsão do tempo…</p>",
x="<h1>Olá, Greici! "+s+".</h1><p>"+r+l+"</p>"+w;
$("gr").innerHTML=x;$("abt").innerHTML=x;clima();
if(!SS.getItem("ab")&&!boas.v){boas.v=1;$("ab").hidden=false;$("abgo").focus()}}
$("abgo").onclick=function(){SS.setItem("ab","1");$("ab").hidden=true};

/* Avisos de novos leads: som, notificação do navegador, aviso na tela e título piscando */
var AL={ctx:null,ids:null,on:0,n:0,base:document.title};
function alCtx(){try{AL.ctx=AL.ctx||new(window.AudioContext||window.webkitAudioContext)();if(AL.ctx.state==="suspended")AL.ctx.resume()}catch(x){}}
["click","keydown","touchstart"].forEach(function(e){document.addEventListener(e,alCtx,{passive:true})});
function beep(){alCtx();var c=AL.ctx;if(!c)return;[[880,0],[1175,.2],[1480,.4]].forEach(function(f){var o=c.createOscillator(),g=c.createGain(),t=c.currentTime+f[1];o.type="sine";o.frequency.value=f[0];g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.3,t+.02);g.gain.exponentialRampToValueAtTime(.001,t+.35);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+.38)})}
function alReset(){AL.n=0;document.title=AL.base}
document.addEventListener("visibilitychange",function(){if(!document.hidden)alReset()});
$("toast").onclick=function(){$("toast").hidden=true;alReset();var b=document.querySelector("#tabs [data-v=leads]");if(b)b.click()};
function aviso(a){var l=a[0],tx=a.length>1?a.length+" novos leads chegaram":l.nome+" · "+(l.interesse||"")+(l.tipo==="reuniao"&&l.quando?" · reunião em "+l.quando.slice(8,10)+"/"+l.quando.slice(5,7)+" às "+l.quando.slice(11,16):" · pediu simulação");
beep();var t=$("toast");t.innerHTML="<b>Novo lead!</b> "+esc(tx)+"<span class='m'> (toque para ver)</span>";t.hidden=false;
AL.n+=a.length;if(document.hidden)document.title="("+AL.n+") Novo lead | Painel";
try{if(window.Notification&&Notification.permission==="granted"){var nt=new Notification("Novo lead!",{body:tx,tag:"lead",renotify:true});nt.onclick=function(){window.focus();nt.close()}}}catch(x){}}
function alertas(){if(AL.on||ST.getItem("demo"))return;AL.on=1;
DB.db.collection("leads").orderBy("data","desc").limit(20).onSnapshot(function(s){var first=!AL.ids,novos=[];AL.ids=AL.ids||{};
s.docChanges().forEach(function(c){if(c.type==="added"&&!AL.ids[c.doc.id]){AL.ids[c.doc.id]=1;var o=c.doc.data();o.id=c.doc.id;if(o.tipo!=="visita")novos.push(o)}});
if(first||!novos.length)return;aviso(novos);load()},function(e){console.error(e)});
/* atualização automática a cada 5 min, se ela não estiver digitando */
setInterval(function(){var a=document.activeElement;if(a&&/INPUT|SELECT|TEXTAREA/.test(a.tagName))return;if(!ST.getItem("demo"))load()},3e5)}
var _st=start;start=function(){_st();alertas()};
function alBtn(){var N=window.Notification,p=N?N.permission:"denied";$("al").textContent=p==="granted"?"🔔 Avisos ativos":p==="denied"?"🔕 Avisos bloqueados":"🔔 Ativar avisos"}
$("al").onclick=function(){alCtx();beep();if(window.Notification&&Notification.permission==="default")Notification.requestPermission().then(alBtn);else alBtn()};alBtn();
