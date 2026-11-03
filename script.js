// EDITE: número com DDI+DDD, só dígitos
var NUM="5546984030196";
var fm=function(v){return v.toLocaleString("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0})};
function sim(){
 var c=+cred.value,n=+prazo.value,a=+tipo.value;
 credv.textContent=fm(c);
 var tot=c*(1+a+0.02),p=tot/n,i=0.012,pm=c*i/(1-Math.pow(1+i,-n)),tf=pm*n;
 pc.textContent=fm(p);tc.textContent=fm(tot);tf_.textContent=fm(tf);
 ec.textContent=fm(tf-tot);
}
var tf_=document.getElementById("tf");
["cred","tipo","prazo"].forEach(function(x){document.getElementById(x).addEventListener("input",sim)});sim();
function link(m){return "https://wa.me/"+NUM+"?text="+encodeURIComponent(m)}
["wa1","wa2"].forEach(function(x){document.getElementById(x).href=link("Olá, Greici! Vim pela sua página e quero saber mais sobre consórcio.")});
var dia="",hora="",D=document.getElementById("dias"),H=document.getElementById("horas");
function chips(box,items,set){items.forEach(function(it){var b=document.createElement("button");b.type="button";b.className="chip";b.textContent=it;b.setAttribute("aria-pressed","false");b.onclick=function(){box.querySelectorAll(".chip").forEach(function(c){c.setAttribute("aria-pressed","false")});b.setAttribute("aria-pressed","true");set(it)};box.appendChild(b)})}
var ds=[],d=new Date();
while(ds.length<6){d.setDate(d.getDate()+1);if(d.getDay()>0&&d.getDay()<6)ds.push(d.toLocaleDateString("pt-BR",{weekday:"short",day:"2-digit",month:"2-digit"}))}
chips(D,ds,function(v){dia=v});
chips(H,["09:00","10:00","11:00","14:00","15:00","16:00","17:00"],function(v){hora=v});
document.getElementById("go").onclick=function(){
 var n=document.getElementById("n").value.trim(),t=document.getElementById("t").value.trim(),o=document.getElementById("ok");
 o.style.display="block";
 if(!n||!t||!dia||!hora){o.textContent="Preencha nome, WhatsApp, dia e horário para confirmar.";return}
 var m="Olá, Greici! Sou "+n+" ("+t+"). Quero agendar uma reunião: "+dia+" às "+hora+", formato "+document.getElementById("fmt").value+". Interesse: "+document.getElementById("i").value+"."+(document.getElementById("e").value?" E-mail: "+document.getElementById("e").value:"");
 o.textContent="Abrindo o WhatsApp para confirmar seu horário…";
 window.open(link(m),"_blank");
};
document.documentElement.classList.add('js');
(function(){
var rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
var els=document.querySelectorAll('section h2,.card,.steps div,.tl>div,details,.map,.res');
els.forEach(function(e,i){e.classList.add('rv');e.style.transitionDelay=(i%4)*80+'ms'});
function cnt(s){var t=+s.dataset.n,x=s.dataset.s||'',st=null;if(rm){s.textContent=t+x;return}
function f(ts){st=st||ts;var p=Math.min((ts-st)/1600,1);s.textContent=Math.round(t*(1-Math.pow(1-p,3)))+x;if(p<1)requestAnimationFrame(f)}requestAnimationFrame(f)}
var ns=document.querySelectorAll('[data-n]');ns.forEach(function(s){if(!rm)s.textContent='0'+(s.dataset.s||'')});
if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')});ns.forEach(cnt);return}
var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{threshold:.15});
els.forEach(function(e){io.observe(e)});
var io2=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){cnt(x.target);io2.unobserve(x.target)}})},{threshold:.5});
ns.forEach(function(s){io2.observe(s)});
})();
