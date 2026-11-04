/* EDITE: ENDPOINT = URL da API quando o banco estiver pronto (GET /leads, /visitas, PATCH /leads/:id).
   AVISO: o login abaixo é só uma barreira visual no navegador. Sem servidor, qualquer pessoa técnica consegue contorná-lo.
   Antes de armazenar dados reais, mova a autenticação para o back-end (sessão/JWT) e proteja a API. */
var CFG={ENDPOINT:"",USER:"greici",HASH:"6dae63d004409c30522b32998064cc9e70b4e5da118b1fb208584ed9b21f7160"}; // senha inicial: Trocar@123 (hash = sha256("usuario|senha"))
var $=function(i){return document.getElementById(i)},ST=localStorage,SS=sessionStorage;
var CAT={imovel:"Imóvel",veiculo:"Veículo",servicos:"Serviços",investimento:"Investimento"},D={leads:[],visitas:[]},sel="",cur=new Date();
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function cat(t){t=String(t||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();return t.indexOf("imov")==0?"imovel":t.indexOf("ve")==0?"veiculo":t.indexOf("serv")==0?"servicos":t.indexOf("invest")==0?"investimento":""}
function fd(s){var d=new Date(s);return isNaN(d)?"-":d.toLocaleDateString("pt-BR")+" "+d.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}
function sha(s){return crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)).then(function(b){return Array.from(new Uint8Array(b)).map(function(x){return x.toString(16).padStart(2,"0")}).join("")})}

/* Login com bloqueio após 5 tentativas */
$("lf").onsubmit=function(e){e.preventDefault();var er=$("er"),bl=+ST.getItem("blk")||0;
if(Date.now()<bl){er.textContent="Muitas tentativas. Aguarde um minuto.";return}
if(!window.crypto||!crypto.subtle){er.textContent="Abra o painel por HTTPS para entrar.";return}
sha($("u").value.trim().toLowerCase()+"|"+$("p").value).then(function(h){
if(h===CFG.HASH&&$("u").value.trim().toLowerCase()===CFG.USER){ST.removeItem("tent");SS.setItem("adm","1");$("p").value="";start()}
else{var n=(+ST.getItem("tent")||0)+1;ST.setItem("tent",n);if(n>=5){ST.setItem("blk",Date.now()+60000);ST.setItem("tent",0)}er.textContent="Usuário ou senha incorretos."}})};
$("out").onclick=function(){SS.removeItem("adm");location.reload()};
if(SS.getItem("adm"))start();

/* Dados: banco quando houver ENDPOINT; senão vazio (ou exemplo, se ativado) */
function demo(){var n=["Ana Souza","Carlos Lima","Marta Reis","João Pedro","Luiza Alves","Rafael Dias","Paula Nunes","Bruno Costa"],c=["Imóvel","Veículo","Serviços","Investimento"],s=["novo","contatado","negociando","fechado","perdido"],L=[],V=[],i,d;
for(i=0;i<16;i++){d=new Date();d.setDate(d.getDate()+(i%9)-3);d.setHours(9+i%8,0,0,0);
L.push({id:i,tipo:i%3?"reuniao":"popup",nome:n[i%8],whatsapp:"(46) 99999-0"+(100+i),interesse:c[i%4],status:s[i%5],data:new Date(Date.now()-i*864e5).toISOString(),quando:i%3?d.toISOString().slice(0,16):""})}
for(i=0;i<60;i++){var k=["imovel","veiculo","servicos","investimento"][(i*7)%4],o={};o[k]=2+i%4;V.push({segundos:[12,25,48,90,150,240,420][i%7],interesses:o,rolagem:30+i%70})}
return{leads:L,visitas:V}}
function load(){var p=CFG.ENDPOINT?Promise.all([fetch(CFG.ENDPOINT+"/leads",{credentials:"include"}).then(function(r){return r.json()}),fetch(CFG.ENDPOINT+"/visitas",{credentials:"include"}).then(function(r){return r.json()})]).then(function(r){return{leads:r[0],visitas:r[1]}}).catch(function(){return{leads:[],visitas:[]}}):Promise.resolve(ST.getItem("demo")?demo():{leads:[],visitas:[]});
return p.then(function(r){D=r;$("demo").hidden=!ST.getItem("demo");$("db").textContent=CFG.ENDPOINT?"conectado":"não conectado";render()})}
function start(){$("lg").hidden=true;$("app").hidden=false;$("cid").value=ST.getItem("cal")||"";load()}

$("tabs").onclick=function(e){var b=e.target.closest("button");if(!b)return;[].forEach.call($("tabs").children,function(x){x.setAttribute("aria-pressed",x===b)});[].forEach.call(document.querySelectorAll(".v"),function(v){v.hidden=v.id!=="v-"+b.dataset.v})};
$("dm").onclick=function(){ST.setItem("demo","1");load()};$("demoOff").onclick=function(){ST.removeItem("demo");load()};
$("sv").onclick=function(){ST.setItem("cal",$("cid").value.trim());render();$("sv").textContent="Salvo ✓"};

function render(){geral();leads();agenda();analise();disp()}
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
$("lb").onchange=function(e){var s=e.target;if(!s.dataset.id)return;D.leads.forEach(function(l){if(String(l.id)===s.dataset.id)l.status=s.value});
if(CFG.ENDPOINT)fetch(CFG.ENDPOINT+"/leads/"+encodeURIComponent(s.dataset.id),{method:"PATCH",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:s.value})});geral()};
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
var AV=JSON.parse(ST.getItem("av")||"null")||{dias:[1,2,3,4,5],horas:["09:00","10:00","11:00","14:00","15:00","16:00","17:00"],dias_bloqueados:[],slots_bloqueados:[],janela:6},HR=[];
for(var h=8;h<=18;h++)HR.push(("0"+h).slice(-2)+":00");
function tg(box,items,on,fn,cls){$(box).innerHTML=items.map(function(x){return"<button type='button' data-k='"+esc(x[0])+"' aria-pressed='"+on(x[0])+"' class='"+(cls?cls(x[0]):"")+"'>"+esc(x[1])+"</button>"}).join("")}
function disp(){var oc=D.leads.filter(function(l){return l.quando}).map(function(l){return l.quando.slice(0,16)}),k=$("adt").value;
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
var o=JSON.parse(JSON.stringify(AV));o.slots_ocupados=D.leads.filter(function(l){return l.quando}).map(function(l){return l.quando.slice(0,16)});return o}
$("asv").onclick=function(){var o=avOut();ST.setItem("av",JSON.stringify(o));
if(CFG.ENDPOINT)fetch(CFG.ENDPOINT+"/disponibilidade",{method:"PUT",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)}).then(function(r){$("asm").textContent=r.ok?"Salvo no site.":"Não foi possível salvar no servidor."});
else $("asm").textContent="Salvo neste navegador. Sem banco, baixe o arquivo e envie para a raiz do site para publicar.";disp()};
$("adl").onclick=function(){var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(avOut(),null,2)],{type:"application/json"}));a.download="disponibilidade.json";a.click()};
