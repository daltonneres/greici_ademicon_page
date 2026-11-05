(function(){
  if (!window.firebase || !window.FB_CFG) {
    console.warn("Firebase não configurado (firebase-config.js).");
    return;
  }

  var app = firebase.apps.length ? firebase.app() : firebase.initializeApp(window.FB_CFG);
  var db = firebase.firestore(app);
  var auth = firebase.auth ? firebase.auth(app) : null;

  function ok(ref) { return { ok: true, status: 201, id: ref && ref.id }; }
  function fail(err, status) {
    console.error("DB.lead error:", err && err.code, err);
    return { ok: false, status: status || 500, error: err };
  }

  function lead(payload) {
    payload = payload || {};
    var doc = Object.assign({
      data: new Date().toISOString(),
      origem: location.href
    }, payload);

    // Medição de visita vai para a coleção "visitas" (o painel lê dali)
    if (payload.tipo === "visita") {
      delete doc.tipo;    // as regras da coleção "visitas" não aceitam estes campos
      delete doc.origem;
      return db.collection("visitas").add(doc).then(ok).catch(fail);
    }

    // As regras exigem todos estes campos em todo lead (vazios quando não se aplicam)
    doc = Object.assign({ email: "", formato: "", dia: "", hora: "", quando: "", interesse: "" }, doc);
    doc.status = "novo";

    // Reunião: grava o lead e reserva o horário (slots/<quando>) de uma vez só
    if (payload.tipo === "reuniao" && payload.quando) {
      var slotRef = db.doc("slots/" + payload.quando);
      var leadRef = db.collection("leads").doc();
      var checked = false;
      return slotRef.get().then(function (s) {
        checked = true;
        if (s.exists) return { ok: false, status: 409 };
        return null;
      }).catch(function () { return null; }).then(function (busy) {
        if (busy) return busy;
        var b = db.batch();
        b.set(slotRef, { quando: payload.quando, lead: leadRef.id });
        b.set(leadRef, doc);
        return b.commit().then(function () {
          return { ok: true, status: 201, id: leadRef.id };
        }).catch(function (err) {
          // Se a leitura do slot foi permitida e a gravação foi negada, o horário foi pego por outra pessoa
          return fail(err, checked && err && err.code === "permission-denied" ? 409 : 500);
        });
      });
    }

    return db.collection("leads").add(doc).then(ok).catch(fail);
  }

  // Disponibilidade configurada no painel + horários já reservados
  function av() {
    var hoje = new Date();
    var d = hoje.getFullYear() + "-" + ("0" + (hoje.getMonth() + 1)).slice(-2) + "-" + ("0" + hoje.getDate()).slice(-2);
    return Promise.all([
      db.doc("config/disp").get().then(function (s) { return s.exists ? s.data() : {}; }),
      db.collection("slots").where("quando", ">=", d).get().then(function (q) {
        return q.docs.map(function (x) { return x.data().quando; });
      }).catch(function () { return []; })
    ]).then(function (r) {
      var o = r[0] || {};
      o.slots_ocupados = r[1];
      return o;
    }).catch(function (err) {
      console.error("DB.av error:", err);
      return {};
    });
  }

  window.DB = {
    app: app,
    db: db,
    auth: auth,
    lead: lead,
    av: av
  };

  window.AUTH = auth;
})();
