/* ==========================================================================
   OFFICE SEGURANÇA — app.js
   © 2026 Thiago Vinicius de Souza Meireles — Todos os direitos reservados.
   Funcionalidades reais: menu, contadores, sliders, FAQ, simulador de
   orçamento, formulários via WhatsApp, vagas, busca, LGPD, PWA-ready.
   ========================================================================== */
(function(){
'use strict';
const $=(s,c=document)=>c.querySelector(s);
const $$=(s,c=document)=>Array.from(c.querySelectorAll(s));
const WA_NUMBER='5562992909444';

/* ---------- ano dinâmico ---------- */
$$('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());

/* ---------- header scroll ---------- */
const header=$('#site-header');
const onScroll=()=>{
  if(!header) return;
  if(window.scrollY>24){header.classList.add('shadow-2xl');header.classList.add('bg-[#060D1A]/95');}
  else{header.classList.remove('shadow-2xl');}
  const top=$('#back-top');
  if(top){ if(window.scrollY>700){top.classList.remove('opacity-0','pointer-events-none');} else {top.classList.add('opacity-0','pointer-events-none');} }
};
window.addEventListener('scroll',onScroll,{passive:true}); onScroll();

/* ---------- menu mobile ---------- */
const btnMenu=$('#btn-menu'), mobileMenu=$('#mobile-menu');
if(btnMenu&&mobileMenu){
  btnMenu.addEventListener('click',()=>{
    const open=mobileMenu.classList.toggle('hidden');
    btnMenu.setAttribute('aria-expanded',String(!open));
  });
  $$('#mobile-menu a').forEach(a=>a.addEventListener('click',()=>mobileMenu.classList.add('hidden')));
}

/* ---------- reveal on scroll ---------- */
const io=new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting){e.target.classList.add('visible'); io.unobserve(e.target);} });
},{threshold:.12});
$$('.reveal').forEach(el=>io.observe(el));

/* ---------- contadores animados ---------- */
const cio=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(!e.isIntersecting) return;
    const el=e.target, target=parseFloat(el.dataset.count||'0'), suffix=el.dataset.suffix||'';
    const dur=1600, t0=performance.now();
    const step=(t)=>{ const p=Math.min(1,(t-t0)/dur); const v=target*(1-Math.pow(1-p,3));
      el.textContent=(target>=100?Math.round(v).toLocaleString('pt-BR'): (Number.isInteger(target)?Math.round(v):v.toFixed(1)))+suffix;
      if(p<1) requestAnimationFrame(step); };
    requestAnimationFrame(step); cio.unobserve(el);
  });
},{threshold:.4});
$$('[data-count]').forEach(el=>cio.observe(el));

/* ---------- depoimentos slider ---------- */
const track=$('#depo-track');
if(track){
  const cards=$$('#depo-track > article'); let idx=0;
  const dotsWrap=$('#depo-dots');
  cards.forEach((_,i)=>{ const d=document.createElement('button');
    d.className='h-2 rounded-full transition-all '+(i===0?'w-8 bg-[#C9A227]':'w-2 bg-white/25');
    d.setAttribute('aria-label','Ir para depoimento '+(i+1));
    d.addEventListener('click',()=>go(i)); dotsWrap&&dotsWrap.appendChild(d); });
  const dots=dotsWrap?Array.from(dotsWrap.children):[];
  function go(i){ idx=(i+cards.length)%cards.length;
    track.style.transform=`translateX(-${idx*100}%)`;
    dots.forEach((d,j)=>{d.className='h-2 rounded-full transition-all '+(j===idx?'w-8 bg-[#C9A227]':'w-2 bg-white/25');});
  }
  $('#depo-prev')?.addEventListener('click',()=>go(idx-1));
  $('#depo-next')?.addEventListener('click',()=>go(idx+1));
  let auto=setInterval(()=>go(idx+1),6000);
  track.addEventListener('pointerenter',()=>clearInterval(auto));
}

/* ---------- FAQ ---------- */
$$('.faq-item').forEach(item=>{
  const btn=$('button',item); if(!btn) return;
  btn.addEventListener('click',()=>{
    const wasOpen=item.classList.contains('open');
    $$('.faq-item.open').forEach(o=>o.classList.remove('open'));
    if(!wasOpen) item.classList.add('open');
  });
});

/* ---------- simulador de orçamento ---------- */
const simForm=$('#simulador');
if(simForm){
  const tabela={armada:5200,desarmada:3400,pessoal:6800,portaria:3100,limpeza:2900,eletronica:1500};
  const nomes={armada:'Segurança Armada',desarmada:'Segurança Desarmada',pessoal:'Segurança Pessoal / Escolta',portaria:'Portaria / Controle de Acesso',limpeza:'Limpeza & Conservação',eletronica:'Segurança Eletrônica / Monitoramento'};
  const calc=()=>{
    const servico=$('#sim-servico')?.value||'armada';
    const postos=parseInt($('#sim-postos')?.value||'1',10);
    const turno=$('#sim-turno')?.value||'12x36-diurno';
    const mult=turno.includes('24h')?2.15:turno.includes('noturno')?1.25:1;
    const base=tabela[servico]||3500;
    const mensal=Math.round(base*postos*mult/100)*100;
    const implant=Math.round(mensal*0.4/100)*100;
    $('#sim-valor').textContent=mensal.toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0});
    $('#sim-detalhe').textContent=`${postos} posto(s) · ${nomes[servico]} · ${( $('#sim-turno option:checked')||{}).textContent||turno}`;
    $('#sim-implant').textContent=implant.toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0});
    return {servico,postos,turno,mensal};
  };
  ['sim-servico','sim-postos','sim-turno'].forEach(id=>$('#'+id)?.addEventListener('input',calc));
  calc();
  simForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    const r=calc();
    const nome=$('#sim-nome')?.value||'';
    const msg=`Olá! Fiz uma simulação no site da Office Segurança.%0A%0AServiço: ${encodeURIComponent(nomes[r.servico])}%0APostos: ${r.postos}%0ATurno: ${encodeURIComponent(r.turno)}%0AEstimativa mensal: ${encodeURIComponent(r.mensal.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}))}%0ANome: ${encodeURIComponent(nome)}%0A%0AGostaria de um orçamento oficial.`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`,'_blank');
  });
}

/* ---------- formulário de contato -> WhatsApp ---------- */
$$('form[data-wa-form]').forEach(form=>{
  form.addEventListener('submit',(e)=>{
    e.preventDefault();
    if(!form.checkValidity()){form.reportValidity();return;}
    const data=Object.fromEntries(new FormData(form).entries());
    const linhas=Object.entries(data).map(([k,v])=>`${k}: ${v}`).join('\n');
    const text=encodeURIComponent(`Novo contato pelo site Office Segurança\n\n${linhas}`);
    window.open(`https://wa.me/${WA_NUMBER}?text=${text}`,'_blank');
    const ok=$('#form-ok',form)||form.querySelector('.form-ok');
    if(ok){ok.classList.remove('hidden');}
    else{const p=document.createElement('p');p.className='form-ok text-green-600 font-semibold mt-3';p.textContent='Recebido! Abrimos o WhatsApp para concluir o envio.';form.appendChild(p);}
    form.reset?.();
  });
});

/* ---------- trabalhe conosco: valida PDF ---------- */
const cvInput=$('#cv-arquivo');
if(cvInput){
  cvInput.addEventListener('change',()=>{
    const f=cvInput.files[0]; const hint=$('#cv-hint');
    if(!f) return;
    const isPdf=f.type==='application/pdf'||/\.pdf$/i.test(f.name);
    const okSize=f.size<=5*1024*1024;
    if(hint){ hint.textContent=!isPdf?'Anexe o currículo em PDF.':!okSize?'Arquivo acima de 5 MB. Comprima e tente de novo.':`Arquivo pronto: ${f.name} (${(f.size/1024).toFixed(0)} KB)`;
      hint.className='text-sm mt-2 '+((isPdf&&okSize)?'text-green-600':'text-red-600'); }
    if(!isPdf||!okSize) cvInput.value='';
  });
}

/* ---------- busca do blog ---------- */
const search=$('#blog-search');
if(search){
  search.addEventListener('input',()=>{
    const q=search.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    $$('[data-post]').forEach(card=>{
      const hay=(card.textContent||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
      card.style.display=hay.includes(q)?'':'none';
    });
  });
}

/* ---------- cookie / LGPD ---------- */
try{
  if(!localStorage.getItem('office-lgpd')){
    const bar=$('#cookie-bar');
    if(bar){bar.classList.remove('translate-y-full','opacity-0');
      $('#cookie-ok')?.addEventListener('click',()=>{localStorage.setItem('office-lgpd','1');bar.classList.add('translate-y-full','opacity-0');});
    }
  }
}catch(_){}

/* ---------- status operacional (simulado realista, baseado no horário) ---------- */
const statusEl=$('#op-status');
if(statusEl){
  const h=new Date().getHours(); const open=(h>=8&&h<18);
  statusEl.innerHTML=open
    ?'<span class="w-2.5 h-2.5 rounded-full bg-green-500 pulse-dot"></span> Central ativa agora — atendimento comercial + plantão 24h'
    :'<span class="w-2.5 h-2.5 rounded-full bg-amber-400 pulse-dot"></span> Fora do horário comercial — plantão operacional 24h ativo';
}
})();
