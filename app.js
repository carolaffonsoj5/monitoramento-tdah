/* ============================================================
   Monitoramento TDAH — lógica do app
   ============================================================ */

/* ---------- Supabase ---------- */
let sb = null;
try {
  sb = window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey);
} catch (e) {
  alert("Configure o arquivo config.js com as chaves do Supabase (veja o README).");
}

let ME = null; // { id, name, role, relation }

/* ---------- Definição dos formulários por perfil ---------- */
const SCALE_HINT = "0 = nada · 5 = muito";

const SPEED = [
  ["vel_fala", "Velocidade da fala (mais rápida / atropelando)"],
  ["falando_mais", "Falando mais que o normal"],
  ["vel_raciocinio", "Velocidade de raciocínio (pensamento rápido)"],
  ["vel_acao", "Velocidade de ação (fazer as coisas mais rápido)"],
];

const COMPARE = { type:"segment", key:"comparado_ontem", label:"Comparado a ontem", options:["Pior","Igual","Melhor"] };

function speedSection(){
  return { title:"Velocidade / aceleração", warn:true,
    fields: SPEED.map(([k,l]) => ({ type:"scale", key:k, label:l, warn:true })) };
}
function changeSection(pos, neg){
  return { title:"Mudanças observadas hoje",
    fields:[
      { type:"check", key:"mud_pos", label:"Mudanças positivas", options:pos },
      { type:"check", key:"mud_neg", label:"Sinais de alerta / negativas", options:neg, neg:true },
      COMPARE,
    ] };
}

const FAM_POS = ["Mais focada","Mais organizada","Mais produtiva","Mais paciente","Mais comunicativa","Mais calma","Melhor humor"];
const FAM_NEG = ["Mais ansiosa","Mais irritada","Mais agitada","Mais distraída","Mais quieta/retraída","Mais cansada/sonolenta","Menos apetite","Choro fácil","Dor de cabeça"];

const SIDE_EFFECTS = ["Boca seca","Dor de cabeça","Ansiedade","Irritabilidade","Taquicardia","Insônia","Tontura","Náusea","Perda de apetite","Nenhum"];
const REBOTE = ["Tudo tranquilo","Irritabilidade","Choro fácil","Fome exagerada","Queda de humor","Cansaço/sono súbito","Ansiedade","Dor de cabeça"];

const FORMS = {
  carol: {
    title: "Autoavaliação da Carol",
    sub: "Como você se sentiu hoje · "+SCALE_HINT,
    sections: [
      { title:"Como foi o dia", fields:[
        {type:"scale",key:"foco",label:"Foco"},
        {type:"scale",key:"energia",label:"Energia"},
        {type:"scale",key:"humor",label:"Humor"},
        {type:"scale",key:"ansiedade",label:"Ansiedade",warn:true},
        {type:"scale",key:"foco_mental",label:"Foco mental"},
        {type:"scale",key:"apetite",label:"Apetite"},
      ]},
      { title:"Sono e medicação", fields:[
        {type:"text",key:"horas_sono",label:"Horas de sono"},
        {type:"number",key:"qual_sono",label:"Qualidade do sono (0–10)"},
        {type:"text",key:"demorou_dormir",label:"Demorou p/ dormir?"},
        {type:"text",key:"acordou_noite",label:"Acordou à noite?"},
        {type:"text",key:"horario_med",label:"Horário da medicação"},
        {type:"text",key:"com_alimento",label:"Tomou com alimento?"},
        {type:"text",key:"peso",label:"Peso (kg)"},
        {type:"text",key:"pressao",label:"Pressão arterial"},
        {type:"text",key:"fc",label:"Freq. cardíaca"},
        {type:"text",key:"agua",label:"Água (ml)"},
        {type:"text",key:"cafeina",label:"Cafeína"},
        {type:"text",key:"evento",label:"Evento importante hoje?"},
      ]},
      { title:"Janela do efeito", fields:[
        {type:"text",key:"ef_inicio",label:"Início do efeito"},
        {type:"text",key:"ef_pico",label:"Pico do efeito"},
        {type:"text",key:"ef_queda",label:"Queda do efeito"},
        {type:"text",key:"ef_fim",label:"Fim do efeito"},
        {type:"text",key:"ef_duracao",label:"Duração total"},
      ]},
      speedSection(),
      { title:"Efeitos colaterais", fields:[
        {type:"check",key:"efeitos",label:"Marque os que sentiu",options:SIDE_EFFECTS},
      ]},
      { title:"Fim do efeito / rebote", warn:true, fields:[
        {type:"check",key:"rebote",label:"Como foi quando o remédio passou?",options:REBOTE},
      ]},
      { title:"Resumo do dia", fields:[
        {type:"text",key:"melhor_horario",label:"Melhor horário"},
        {type:"text",key:"pior_horario",label:"Pior horário"},
        {type:"text",key:"beneficio",label:"Principal benefício"},
        {type:"text",key:"dificuldade",label:"Maior dificuldade"},
        {type:"number",key:"nota_dia",label:"Nota geral do dia (0–10)"},
        {type:"textarea",key:"obs",label:"Observações gerais"},
      ]},
    ],
  },

  observador: {
    title: "Observação comportamental",
    sub: "O que você percebeu na Carol hoje · "+SCALE_HINT,
    sections: [
      { title:"Contexto", fields:[
        {type:"text",key:"apetite_perc",label:"Apetite percebido hoje"},
        {type:"text",key:"dormiu",label:"Dormiu/descansou bem?"},
        {type:"text",key:"evento",label:"Evento/contexto importante hoje?"},
      ]},
      { title:"Indicadores", fields:[
        {type:"scale",key:"foco",label:"Foco / atenção"},
        {type:"scale",key:"organizacao",label:"Organização"},
        {type:"scale",key:"produtividade",label:"Produtividade / responsabilidade"},
        {type:"scale",key:"motivacao",label:"Motivação / iniciativa"},
        {type:"scale",key:"humor",label:"Humor"},
        {type:"scale",key:"irritabilidade",label:"Irritabilidade",warn:true},
        {type:"scale",key:"ansiedade",label:"Ansiedade",warn:true},
        {type:"scale",key:"agitacao",label:"Agitação",warn:true},
        {type:"scale",key:"impulsividade",label:"Impulsividade",warn:true},
        {type:"scale",key:"comunicacao",label:"Comunicação"},
        {type:"scale",key:"convivio",label:"Convívio / interação social"},
        {type:"scale",key:"disposicao",label:"Disposição / energia"},
        {type:"scale",key:"presenca",label:"Presença"},
        {type:"scale",key:"escuta",label:"Capacidade de escuta"},
        {type:"scale",key:"controle_emoc",label:"Controle emocional / paciência"},
      ]},
      speedSection(),
      changeSection(FAM_POS, FAM_NEG),
      { title:"O que mais chamou atenção hoje?", fields:[
        {type:"textarea",key:"obs",label:""},
      ]},
    ],
  },

  chefe: {
    title: "Observação profissional (Chefe)",
    sub: "Desempenho no trabalho hoje · "+SCALE_HINT,
    sections: [
      { title:"Contexto", fields:[
        {type:"text",key:"carga",label:"Carga de trabalho (leve/média/alta)"},
        {type:"text",key:"modalidade",label:"Modalidade (presencial/remoto)"},
        {type:"text",key:"demandas",label:"Demandas principais do dia"},
        {type:"text",key:"reunioes",label:"Reuniões hoje?"},
      ]},
      { title:"Indicadores", fields:[
        {type:"scale",key:"foco",label:"Foco no trabalho"},
        {type:"scale",key:"produtividade",label:"Produtividade"},
        {type:"scale",key:"organizacao",label:"Organização"},
        {type:"scale",key:"prazos",label:"Cumprimento de prazos"},
        {type:"scale",key:"reunioes_atencao",label:"Atenção em reuniões"},
        {type:"scale",key:"qualidade",label:"Qualidade do trabalho"},
        {type:"scale",key:"iniciativa",label:"Iniciativa"},
        {type:"scale",key:"comunicacao",label:"Comunicação"},
        {type:"scale",key:"tarefas",label:"Conclusão de tarefas"},
        {type:"scale",key:"tempo",label:"Gestão do tempo"},
        {type:"scale",key:"erros",label:"Concentração / poucos erros"},
        {type:"scale",key:"pontualidade",label:"Pontualidade"},
        {type:"scale",key:"memoria",label:"Memória / retenção"},
        {type:"scale",key:"colaboracao",label:"Colaboração com a equipe"},
        {type:"scale",key:"controle_emoc",label:"Controle emocional / paciência"},
      ]},
      speedSection(),
      changeSection(
        ["Mais focada","Mais produtiva","Mais organizada","Mais pontual","Mais comunicativa","Mais proativa","Menos erros"],
        ["Menos produtiva","Mais distraída","Mais ansiosa","Mais agitada","Mais cansada/sonolenta","Mais quieta/retraída","Mais erros","Queda à tarde"]),
      { title:"Observações", fields:[ {type:"textarea",key:"obs",label:""} ] },
    ],
  },

  namorado: {
    title: "Observação do parceiro(a)",
    sub: "O que percebeu no contato de hoje · "+SCALE_HINT,
    sections: [
      { title:"Contato", fields:[
        {type:"text",key:"tipo_contato",label:"Tipo (presencial/ligação/vídeo/texto)"},
        {type:"text",key:"duracao",label:"Duração do contato"},
      ]},
      { title:"Indicadores", fields:[
        {type:"scale",key:"foco",label:"Foco"},
        {type:"scale",key:"energia",label:"Energia"},
        {type:"scale",key:"humor",label:"Humor"},
        {type:"scale",key:"paciencia",label:"Paciência"},
        {type:"scale",key:"comunicacao",label:"Comunicação"},
        {type:"scale",key:"motivacao",label:"Motivação"},
        {type:"scale",key:"atencao",label:"Atenção na conversa"},
        {type:"scale",key:"conexao",label:"Conexão emocional"},
        {type:"scale",key:"ansiedade",label:"Ansiedade",warn:true},
        {type:"scale",key:"irritabilidade",label:"Irritabilidade",warn:true},
        {type:"scale",key:"presenca",label:"Presença"},
        {type:"scale",key:"interesse",label:"Interesse nas atividades"},
      ]},
      speedSection(),
      changeSection(
        ["Mais focada","Mais paciente","Mais comunicativa","Mais organizada","Mais produtiva","Mais calma"],
        ["Mais ansiosa","Mais irritada","Mais distraída","Mais quieta/retraída","Mais cansada/sonolenta","Menos apetite","Dor de cabeça","Queda de humor no fim do efeito"]),
      { title:"Perguntas / observações", fields:[ {type:"textarea",key:"obs",label:""} ] },
    ],
  },
};

const ROLE_LABEL = { carol:"Carol", observador:"Observador", chefe:"Chefe", namorado:"Parceiro(a)" };

/* ---------- Helpers de tela ---------- */
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
function show(id){ $$(".screen").forEach(s=>s.classList.add("hidden")); $(id).classList.remove("hidden"); }
function todayStr(){ return new Date().toISOString().slice(0,10); }
function fmtDate(d){ const [y,m,dd]=d.split("-"); return `${dd}/${m}/${y}`; }

/* ---------- Auth UI ---------- */
$$(".tab").forEach(t => t.addEventListener("click", () => {
  $$(".tab").forEach(x=>x.classList.remove("active")); t.classList.add("active");
  $("#form-login").classList.toggle("hidden", t.dataset.tab!=="login");
  $("#form-signup").classList.toggle("hidden", t.dataset.tab!=="signup");
  authMsg("");
}));
$("select[name=role]").addEventListener("change", e=>{
  $("#relation-field").classList.toggle("hidden", e.target.value!=="observador");
});
function authMsg(t, cls=""){ const m=$("#auth-msg"); m.textContent=t; m.className="msg "+cls; }

$("#form-signup").addEventListener("submit", async e=>{
  e.preventDefault();
  const f=e.target;
  authMsg("Criando acesso...");
  const { data, error } = await sb.auth.signUp({
    email:f.email.value.trim(), password:f.password.value,
    options:{ data:{ name:f.name.value.trim(), role:f.role.value, relation:f.relation.value.trim() } }
  });
  if(error){ authMsg(error.message, "err"); return; }
  if(data.session){ await loadMe(); enterApp(); }
  else authMsg("Acesso criado! Confira seu e-mail se for pedida confirmação, depois faça login.", "ok");
});

$("#form-login").addEventListener("submit", async e=>{
  e.preventDefault();
  const f=e.target;
  authMsg("Entrando...");
  const { error } = await sb.auth.signInWithPassword({ email:f.email.value.trim(), password:f.password.value });
  if(error){ authMsg(error.message, "err"); return; }
  await loadMe(); enterApp();
});

$("#btn-logout").addEventListener("click", async ()=>{ await sb.auth.signOut(); location.reload(); });

async function loadMe(){
  const { data } = await sb.auth.getUser();
  const u = data.user; if(!u) return;
  const m = u.user_metadata || {};
  ME = { id:u.id, name:m.name||u.email, role:m.role||"observador", relation:m.relation||"" };
}

function enterApp(){
  show("#screen-app");
  $("#who-name").textContent = ME.name;
  $("#who-role").textContent = ROLE_LABEL[ME.role] || ME.role;
  $("#entry-date").value = todayStr();
  $("#rep-to").value = todayStr();
  const d = new Date(); d.setDate(d.getDate()-6);
  $("#rep-from").value = d.toISOString().slice(0,10);
  renderForm();
  loadEntryForDate();
}

/* ---------- Navegação ---------- */
$$(".navbtn[data-view]").forEach(b=> b.addEventListener("click", ()=>{
  $$(".navbtn[data-view]").forEach(x=>x.classList.remove("active")); b.classList.add("active");
  const v=b.dataset.view;
  $$(".view").forEach(x=>x.classList.add("hidden"));
  $("#view-"+v).classList.remove("hidden");
  if(v==="historico") loadHistory();
}));

/* ---------- Render do formulário ---------- */
let STATE = {}; // valores atuais do formulário

function renderForm(){
  const def = FORMS[ME.role];
  $("#form-title").textContent = def.title;
  $("#form-sub").textContent = def.sub;
  const form = $("#entry-form"); form.innerHTML="";
  def.sections.forEach(sec=>{
    const box=document.createElement("div");
    box.className="fsection"+(sec.warn?" warn":"");
    box.innerHTML = `<h3>${sec.title}</h3>`;
    const scaleFields = sec.fields.filter(f=>f.type==="scale");
    const wrap = document.createElement("div");
    sec.fields.forEach(fld => wrap.appendChild(renderField(fld)));
    box.appendChild(wrap);
    form.appendChild(box);
  });
}

function renderField(f){
  const row=document.createElement("div"); row.className="field-row";
  if(f.type==="scale"){
    row.innerHTML = `<span class="flbl">${f.label}</span>`;
    const sc=document.createElement("div"); sc.className="scale"+(f.warn?" warn":"");
    for(let i=0;i<=5;i++){
      const b=document.createElement("button"); b.type="button"; b.textContent=i;
      b.addEventListener("click",()=>{ STATE[f.key]=i; sc.querySelectorAll("button").forEach(x=>x.classList.remove("on")); b.classList.add("on"); });
      sc.appendChild(b);
    }
    row.appendChild(sc);
  }
  else if(f.type==="check"){
    if(f.label) row.innerHTML = `<span class="flbl">${f.label}</span>`;
    const g=document.createElement("div"); g.className="checks";
    f.options.forEach(opt=>{
      const id="c_"+f.key+"_"+opt.replace(/\W/g,"");
      const lab=document.createElement("label"); lab.className="chk"+(f.neg?" neg":"");
      lab.innerHTML=`<input type="checkbox" data-key="${f.key}" value="${opt}" id="${id}"><span>${opt}</span>`;
      g.appendChild(lab);
    });
    row.appendChild(g);
  }
  else if(f.type==="segment"){
    row.innerHTML = `<span class="flbl">${f.label}</span>`;
    const sg=document.createElement("div"); sg.className="segment";
    f.options.forEach(opt=>{
      const b=document.createElement("button"); b.type="button"; b.textContent=opt;
      b.addEventListener("click",()=>{ STATE[f.key]=opt; sg.querySelectorAll("button").forEach(x=>x.classList.remove("on")); b.classList.add("on"); });
      sg.appendChild(b);
    });
    row.appendChild(sg);
  }
  else if(f.type==="textarea"){
    if(f.label) row.innerHTML = `<span class="flbl">${f.label}</span>`;
    const ta=document.createElement("textarea"); ta.dataset.key=f.key;
    ta.addEventListener("input",()=>STATE[f.key]=ta.value);
    row.appendChild(ta);
  }
  else { // text / number
    const wrap=document.createElement("label"); wrap.style.cssText="display:flex;flex-direction:column;gap:6px;font-size:13px;color:var(--ink)";
    const inp=document.createElement("input"); inp.type=f.type==="number"?"number":"text"; inp.dataset.key=f.key;
    inp.addEventListener("input",()=>STATE[f.key]=inp.value);
    wrap.innerHTML=`<span class="flbl">${f.label}</span>`; wrap.appendChild(inp);
    row.appendChild(wrap);
  }
  return row;
}

function applyState(){
  // text/number/textarea
  $$("#entry-form [data-key]").forEach(el=>{
    const k=el.dataset.key;
    if(el.type==="checkbox"){ el.checked = Array.isArray(STATE[k]) && STATE[k].includes(el.value); }
    else if(el.tagName==="TEXTAREA"||el.tagName==="INPUT"){ if(STATE[k]!=null) el.value=STATE[k]; }
  });
  // scales & segments
  FORMS[ME.role].sections.forEach(sec=>sec.fields.forEach(f=>{
    if(f.type!=="scale" && f.type!=="segment") return;
    const v=STATE[f.key]; if(v==null) return;
    // locate the row by matching label
    [...$$("#entry-form .field-row")].forEach(row=>{
      const lbl=row.querySelector(".flbl"); if(!lbl||lbl.textContent!==f.label) return;
      if(f.type==="scale"){ const btns=row.querySelectorAll(".scale button"); if(btns[v]) btns[v].classList.add("on"); }
      else { row.querySelectorAll(".segment button").forEach(b=>{ if(b.textContent===v) b.classList.add("on"); }); }
    });
  }));
  // checkbox listeners keep STATE updated
  $$("#entry-form input[type=checkbox]").forEach(c=> c.addEventListener("change",()=>{
    const k=c.dataset.key; STATE[k]=STATE[k]||[];
    if(c.checked){ if(!STATE[k].includes(c.value)) STATE[k].push(c.value); }
    else STATE[k]=STATE[k].filter(x=>x!==c.value);
  }));
}

/* ---------- Carregar / salvar registro ---------- */
$("#entry-date").addEventListener("change", loadEntryForDate);

async function loadEntryForDate(){
  STATE={};
  renderForm();
  const date=$("#entry-date").value;
  $("#save-status").textContent="";
  const { data, error } = await sb.from("entries").select("data")
    .eq("author_id", ME.id).eq("role", ME.role).eq("entry_date", date).maybeSingle();
  if(!error && data){ STATE=data.data||{}; applyState(); $("#save-status").textContent="Registro carregado."; }
  else applyState();
}

$("#btn-save").addEventListener("click", async ()=>{
  const date=$("#entry-date").value;
  if(!date){ alert("Escolha a data."); return; }
  $("#save-status").textContent="Salvando...";
  const row={ author_id:ME.id, author_name:ME.name, role:ME.role, relation:ME.relation, entry_date:date, data:STATE };
  const { error } = await sb.from("entries").upsert(row, { onConflict:"author_id,role,entry_date" });
  $("#save-status").textContent = error ? ("Erro: "+error.message) : "✓ Salvo na nuvem";
});

/* ---------- Histórico ---------- */
async function loadHistory(){
  const list=$("#history-list"); list.innerHTML="<p class='empty'>Carregando...</p>";
  const { data, error } = await sb.from("entries").select("entry_date,created_at,updated_at")
    .eq("author_id", ME.id).eq("role", ME.role).order("entry_date",{ascending:false});
  if(error){ list.innerHTML="<p class='empty'>Erro ao carregar.</p>"; return; }
  if(!data.length){ list.innerHTML="<p class='empty'>Nenhum registro ainda.</p>"; return; }
  list.innerHTML="";
  data.forEach(r=>{
    const it=document.createElement("div"); it.className="hist-item";
    it.innerHTML=`<span class="hist-date">${fmtDate(r.entry_date)}</span><span class="hist-meta">abrir ›</span>`;
    it.addEventListener("click",()=>{
      $("#entry-date").value=r.entry_date;
      $$(".navbtn[data-view]").forEach(x=>x.classList.remove("active"));
      document.querySelector('.navbtn[data-view=hoje]').classList.add("active");
      $$(".view").forEach(x=>x.classList.add("hidden")); $("#view-hoje").classList.remove("hidden");
      loadEntryForDate();
    });
    list.appendChild(it);
  });
}

/* ---------- Relatório ---------- */
let CHARTS=[];
$("#btn-build-report").addEventListener("click", buildReport);
$("#btn-print").addEventListener("click", ()=>window.print());

async function buildReport(){
  const from=$("#rep-from").value, to=$("#rep-to").value;
  const out=$("#report-output");
  out.innerHTML="<p class='empty'>Gerando...</p>";
  CHARTS.forEach(c=>c.destroy()); CHARTS=[];
  const { data, error } = await sb.from("entries").select("*")
    .gte("entry_date",from).lte("entry_date",to).order("entry_date");
  if(error){ out.innerHTML="<p class='empty'>Erro: "+error.message+"</p>"; return; }
  if(!data.length){ out.innerHTML="<p class='empty'>Nenhum registro no período.</p>"; return; }

  let html = `<h2 class="rep-title">Relatório de Monitoramento</h2>
    <p class="rep-sub">Paciente: Carolina Chaves Affonso · Período: ${fmtDate(from)} a ${fmtDate(to)} · Lisdexanfetamina 30mg</p>`;

  const byRole={};
  data.forEach(r=>{ (byRole[r.role]=byRole[r.role]||[]).push(r); });

  for(const role of ["carol","observador","chefe","namorado"]){
    const rows=byRole[role]; if(!rows) continue;
    const def=FORMS[role];
    const names=[...new Set(rows.map(r=>r.author_name))].join(", ");
    html+=`<div class="rep-block"><h3>${def.title} — ${rows.length} registro(s) · ${names}</h3>`;

    // médias dos indicadores (scale)
    const scales=[];
    def.sections.forEach(s=>s.fields.forEach(f=>{ if(f.type==="scale") scales.push(f); }));
    if(scales.length){
      html+=`<div class="rep-grid">`;
      scales.forEach(f=>{
        const vals=rows.map(r=>r.data[f.key]).filter(v=>typeof v==="number");
        if(!vals.length) return;
        const avg=(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1);
        html+=`<div class="avg-card${f.warn?" warn":""}"><div class="an">${f.label}</div><div class="av">${avg}<span style="font-size:13px;color:var(--ink-faint)"> /5</span></div></div>`;
      });
      html+=`</div>`;
    }

    // gráfico de evolução (até 4 indicadores principais)
    const chartId="chart_"+role;
    html+=`<div class="chartbox"><canvas id="${chartId}"></canvas></div>`;

    // efeitos colaterais / mudanças frequência
    const freqKeys = role==="carol" ? [["efeitos","Efeitos colaterais"],["rebote","Fim do efeito / rebote"]]
                                     : [["mud_neg","Sinais de alerta marcados"]];
    freqKeys.forEach(([key,title])=>{
      const counts={};
      rows.forEach(r=>(r.data[key]||[]).forEach(o=>counts[o]=(counts[o]||0)+1));
      const items=Object.entries(counts).sort((a,b)=>b[1]-a[1]);
      if(items.length){
        const max=items[0][1];
        html+=`<p style="font-size:12px;font-weight:700;color:var(--ink-soft);margin:14px 0 8px">${title}</p>`;
        items.forEach(([o,n])=>{
          html+=`<div class="freq-row"><span class="freq-lbl">${o}</span><div class="freq-bar" style="width:${Math.max(18,n/max*180)}px"></div><span class="freq-n">${n}×</span></div>`;
        });
      }
    });

    // observações / notas
    const notes = rows.filter(r=>r.data.obs && r.data.obs.trim());
    if(notes.length){
      html+=`<p style="font-size:12px;font-weight:700;color:var(--ink-soft);margin:14px 0 6px">Observações</p>`;
      notes.forEach(r=>{ html+=`<div class="rep-note"><div class="rn-meta">${fmtDate(r.entry_date)} · ${r.author_name}</div><div class="rn-text">${escapeHtml(r.data.obs)}</div></div>`; });
    }
    html+=`</div>`;
  }

  out.innerHTML=html;

  // desenha os gráficos depois do HTML existir
  for(const role of Object.keys(byRole)){
    const rows=byRole[role].slice().sort((a,b)=>a.entry_date<b.entry_date?-1:1);
    const def=FORMS[role];
    const scales=[]; def.sections.forEach(s=>s.fields.forEach(f=>{ if(f.type==="scale") scales.push(f); }));
    const pick=scales.slice(0,4);
    const labels=[...new Set(rows.map(r=>fmtDate(r.entry_date)))];
    const palette=["#3a6b4a","#a8623f","#6b8f7a","#c79a6b"];
    const datasets=pick.map((f,i)=>({
      label:f.label, borderColor:palette[i%4], backgroundColor:palette[i%4],
      tension:.3, spanGaps:true,
      data: labels.map(L=>{ const r=rows.find(x=>fmtDate(x.entry_date)===L); const v=r?r.data[f.key]:null; return typeof v==="number"?v:null; })
    }));
    const cv=document.getElementById("chart_"+role); if(!cv) continue;
    CHARTS.push(new Chart(cv,{ type:"line",
      data:{ labels, datasets },
      options:{ responsive:true, maintainAspectRatio:false,
        scales:{ y:{ min:0, max:5, ticks:{ stepSize:1 } } },
        plugins:{ legend:{ position:"bottom", labels:{ boxWidth:12, font:{ size:11 } } },
          title:{ display:true, text:"Evolução no período", font:{ size:12 } } } }
    }));
  }
}
function escapeHtml(s){ return s.replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c])); }

/* ---------- Início: já está logado? ---------- */
(async ()=>{
  if(!sb) return;
  const { data } = await sb.auth.getSession();
  if(data.session){ await loadMe(); enterApp(); }
  else show("#screen-auth");
})();
