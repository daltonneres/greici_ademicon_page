// EDITE: número com DDI+DDD, só dígitos
var NUM="5546984030196";
var $=function(id){return document.getElementById(id)};
// EDITE: quando o banco estiver pronto, coloque aqui a URL que recebe os leads (POST JSON)
var LEAD_ENDPOINT="";
// EDITE: links dos posts do Instagram, ex: "https://www.instagram.com/p/XXXX/"
var POSTS=[];
var rm=matchMedia("(prefers-reduced-motion:reduce)").matches;
function sendLead(d){d.origem=location.href;d.data=new Date().toISOString();if(!LEAD_ENDPOINT)return;try{fetch(LEAD_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d),keepalive:true}).catch(function(){})}catch(x){}}
function link(m){return "https://wa.me/"+NUM+"?text="+encodeURIComponent(m)}
["wa1","wa2","wa3"].forEach(function(x){var a=$(x);if(a){a.href=link("Olá, Greici! Vim pela sua página e quero saber mais sobre consórcio.");a.target="_blank";a.rel="noopener"}});

/* Palavras que se trocam no título (efeito de digitação) */
(function(){
var el=$("tw");if(!el||rm)return;
var W=["sua casa própria.","seu carro novo.","a viagem dos sonhos.","seu patrimônio."],i=0,j=W[0].length,del=true;
function t(){var w=W[i];j+=del?-1:1;el.textContent=w.slice(0,j);var d=del?35:70;
if(!del&&j===w.length){del=true;d=1800}else if(del&&j===0){del=false;i=(i+1)%W.length;d=300}
setTimeout(t,d)}
setTimeout(t,2400);
})();

/* Agendamento */
var dia="",hora="";
function chips(box,items,set){items.forEach(function(it){var b=document.createElement("button");b.type="button";b.className="chip";b.textContent=it;b.setAttribute("aria-pressed","false");
b.onclick=function(){box.querySelectorAll(".chip").forEach(function(c){c.setAttribute("aria-pressed","false")});b.setAttribute("aria-pressed","true");set(it)};box.appendChild(b)})}
var ds=[],d=new Date();
while(ds.length<6){d.setDate(d.getDate()+1);if(d.getDay()>0&&d.getDay()<6)ds.push(d.toLocaleDateString("pt-BR",{weekday:"short",day:"2-digit",month:"2-digit"}))}
chips($("dias"),ds,function(v){dia=v});
chips($("horas"),["09:00","10:00","11:00","14:00","15:00","16:00","17:00"],function(v){hora=v});

document.querySelectorAll(".tel").forEach(function(el){el.addEventListener("input",function(){
var v=this.value.replace(/\D/g,"").slice(0,11);
if(v.length>6)v="("+v.slice(0,2)+") "+v.slice(2,v.length>10?7:6)+"-"+v.slice(v.length>10?7:6);
else if(v.length>2)v="("+v.slice(0,2)+") "+v.slice(2);
this.value=v})});

$("go").onclick=function(){
var n=$("n").value.trim(),t=$("t").value.trim(),e=$("e").value.trim(),o=$("ok");
o.style.display="block";
if(!n||t.replace(/\D/g,"").length<10||!dia||!hora){o.textContent="Preencha nome, WhatsApp válido, dia e horário para confirmar.";return}
var m="Olá, Greici! Sou "+n+" ("+t+"). Quero agendar uma reunião: "+dia+" às "+hora+", formato "+$("fmt").value+". Interesse: "+$("i").value+"."+(e?" E-mail: "+e:"");
o.textContent="Abrindo o WhatsApp para confirmar seu horário…";sendLead({tipo:"reuniao",nome:n,whatsapp:t,email:e,dia:dia,hora:hora,formato:$("fmt").value,interesse:$("i").value});
if(!window.open(link(m),"_blank"))location.href=link(m);
};

/* Menu com sombra ao rolar */
var nav=document.querySelector("nav");
function sc(){nav.classList.toggle("sc",scrollY>8)}
addEventListener("scroll",sc,{passive:true});sc();

/* Revelar ao rolar + contadores */
document.documentElement.classList.add("js");
(function(){
var els=document.querySelectorAll("section h2,.card,.steps div,.tl>div,details,.map,.ck li,.bars,.fl li");
els.forEach(function(e){e.classList.add("rv");var k=Array.prototype.indexOf.call(e.parentNode.children,e);e.style.transitionDelay=Math.min(k,5)*80+"ms"});
function cnt(s){var t=+s.dataset.n,x=s.dataset.s||"",st=null;if(rm){s.textContent=t+x;return}
function f(ts){st=st||ts;var p=Math.min((ts-st)/1600,1);s.textContent=Math.round(t*(1-Math.pow(1-p,3)))+x;if(p<1)requestAnimationFrame(f)}requestAnimationFrame(f)}
var ns=document.querySelectorAll("[data-n]");
if(!("IntersectionObserver" in window)){els.forEach(function(e){e.classList.add("in")});ns.forEach(cnt);return}
if(!rm)ns.forEach(function(s){s.textContent="0"+(s.dataset.s||"")});
var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add("in");io.unobserve(x.target)}})},{threshold:.12});
els.forEach(function(e){io.observe(e)});
var io2=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){cnt(x.target);io2.unobserve(x.target)}})},{threshold:.5});
ns.forEach(function(s){io2.observe(s)});
})();

/* Pop-up de captação (abre após ~20 segundos, uma vez por visita) */
(function(){
var p=$("pop");if(!p||!p.showModal)return;
var K="popv",seen=false;try{seen=sessionStorage.getItem(K)}catch(x){}
if(seen)return;
function show(){
var a=document.activeElement;
if(a&&/INPUT|SELECT|TEXTAREA/.test(a.tagName)){setTimeout(show,8000);return}
if(document.querySelector("dialog[open]"))return;
try{sessionStorage.setItem(K,"1")}catch(x){}
p.showModal();
}
setTimeout(show,20000);
$("px").onclick=function(){p.close()};
p.addEventListener("click",function(e){if(e.target===p)p.close()});
$("pgo").onclick=function(){
var n=$("pn").value.trim(),t=$("ptel").value.trim(),o=$("pok");o.style.display="block";
if(!n||t.replace(/\D/g,"").length<10){o.textContent="Informe seu nome e um WhatsApp válido.";return}
var it=$("pi").value;
sendLead({tipo:"popup",nome:n,whatsapp:t,interesse:it});
o.textContent="Pronto! Abrindo o WhatsApp para a Greici enviar sua simulação…";
var m="Olá, Greici! Sou "+n+" ("+t+"). Quero uma simulação gratuita de consórcio. Interesse: "+it+".";
if(!window.open(link(m),"_blank"))location.href=link(m);
setTimeout(function(){p.close()},1800);
};
})();
/* Posts do Instagram */
(function(){if(!POSTS.length)return;var b=$("igp");b.innerHTML="";
POSTS.forEach(function(u){var q=document.createElement("blockquote");q.className="instagram-media";q.setAttribute("data-instgrm-permalink",u);q.setAttribute("data-instgrm-version","14");b.appendChild(q)});
var s=document.createElement("script");s.async=true;s.src="https://www.instagram.com/embed.js";document.body.appendChild(s)})();


(function(){var s=$("brmap");if(!s)return;var tip=$("brtip"),b=$("br-pr").getBBox();
$("gm").setAttribute("transform","translate("+(b.x+b.width/2)+","+(b.y+b.height/2)+")");
s.querySelectorAll("path").forEach(function(p){function f(){s.querySelectorAll(".sel").forEach(function(x){x.classList.remove("sel")});p.classList.add("sel");tip.textContent=p.getAttribute("data-n")+(p.id==="br-pr"?": atendimento presencial e online":": atendimento online")}p.addEventListener("mouseenter",f);p.addEventListener("click",f)})})();

/* Sorteio x lance */
(function(){var ks=document.querySelectorAll(".lk"),ps=document.querySelectorAll(".lp");
ks.forEach(function(k,i){k.onclick=function(){ks.forEach(function(x,n){x.setAttribute("aria-pressed",n===i)});ps.forEach(function(p,n){p.hidden=n!==i})}})})();
/* Comparativo (valores fixos e ilustrativos) */
(function(){if(!$("bc1"))return;
var fm=function(v){return v.toLocaleString("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0})};
var C=300000,N=180,TX=.24,I=.015,cons=C*(1+TX),fp=C*I/(1-Math.pow(1+I,-N)),ft=fp*N,mx=Math.max(cons,ft);
function w(id,v){$(id).style.setProperty("--w",(v/mx*100)+"%")}
w("bc1",C);w("bc2",cons-C);w("bf1",C);w("bf2",ft-C);
$("bct").textContent="Total de "+fm(cons)+" · parcela de cerca de "+fm(cons/N)+" por mês";
$("bft").textContent="Total de "+fm(ft)+" · parcela de cerca de "+fm(fp)+" por mês";
$("dfx").textContent="Neste exemplo, o financiamento custa cerca de "+fm(ft-cons)+" a mais.";
})();
