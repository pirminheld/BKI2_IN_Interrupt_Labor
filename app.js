'use strict';
const $=id=>document.getElementById(id),fmt=(n,k=2)=>n.toFixed(k).replace('.',',');
let sim=new InterruptLab.Experiment(),playing=false,last=0,acc=0;
const names=['Taster lesen → LED 2 setzen','Andere Aufgabe bearbeiten','Durchlauf abschließen → LED 1 toggeln'];
function circuit(c){const l2=!!c.led2;return `<svg class="circuit" viewBox="0 0 570 215" role="img" aria-label="Mikrocontroller mit einem Tastereingang und zwei Ausgängen. LED 1 ${c.led1?'an':'aus'}, LED 2 ${l2?'an':'aus'}."><rect x="175" y="25" width="185" height="160" rx="12" class="mcu"/><text x="195" y="60">Mikrocontroller</text><text x="195" y="86" class="tiny">${c.irq?'Taster → Interrupt':'Taster → Polling'}</text><path d="M25 160H175" class="wire ${sim.button?'hot':''}"/><text x="25" y="150">Taster = ${sim.button}</text><path d="M360 110H395M425 110H470M510 110H550V195M360 160H395M425 160H470M510 160H540V195" class="wire"/><rect x="395" y="103" width="30" height="14" class="resistor"/><rect x="395" y="153" width="30" height="14" class="resistor"/><text x="394" y="91" class="tiny">R</text><circle cx="490" cy="110" r="19" class="led ${c.led1?'blue':''}"/><circle cx="490" cy="160" r="19" class="led ${l2?'amber':''}"/><text x="460" y="74">LED 1</text><text x="450" y="207">LED 2</text><text x="520" y="211" class="tiny">GND</text><text x="195" y="137" class="tiny">Hauptprogramm</text><text x="195" y="159" class="tiny">${c.stage>=0?'pausiert':'aktiv'}</text></svg>`;}
function panel(c,id){const isr=c.stage>=0;const stage=['Eintritt: Rückkehrstelle sichern','ISR: Tasterpegel → LED 2','Rückkehr zur gesicherten Stelle'][c.stage];const missed=sim.pulses.filter(p=>p.end!==null&&!p.poll).length;
 $(id).className='card cpu'+(c.irq?' irq':'');
 $(id).innerHTML=`<div class="card-top"><div><p class="eyebrow">${c.irq?'02 · EREIGNISGESTEUERT':'01 · REGELMÄSSIG ABFRAGEN'}</p><h2>${c.irq?'Mit Interrupt':'Mit Polling'}</h2></div><span class="pill ${isr?'running':''}">${isr?'ISR aktiv':'Hauptprogramm'}</span></div>${circuit(c)}<div class="status">${isr?stage:names[c.phase]}<br><small>${isr?'Die andere Aufgabe ist angehalten.':`Noch ${fmt(Math.max(0,c.remaining))} s bis zum nächsten Hauptschritt.`}</small></div><div class="flow">${names.map((n,i)=>({n,i})).filter(({i})=>!c.irq||i!==0).map(({n,i})=>`<div class="${!isr&&c.phase===i?'current':''}">${c.irq?i:i+1}. ${n}</div>`).join('')}${c.irq?`<div class="isr ${isr?'current':''}">↳ ISR: Tasterpegel lesen → LED 2 → zurück</div>`:'<div>↻ Wieder von vorn – Taster erneut lesen</div>'}</div><p class="small">Ohne Ereignis: ${fmt(sim.work+(c.irq?.12:.24))} s pro Durchlauf.${c.irq?' Je ISR zusätzlich 0,12 s.':' Davon 0,12 s Tasterabfrage – in jedem Durchlauf.'}</p><p class="cycles">Abgeschlossene Durchläufe: <b>${c.cycles}</b> · LED 1 ${c.led1?'an':'aus'}</p><div class="stats"><div><strong>${c.hits}</strong><small>Tastendrücke erfasst</small></div><div><strong>${c.irq?sim.pulses.length:missed}</strong><small>${c.irq?'Flanken eingegangen':'Impulse übersehen'}</small></div><div><strong>${c.latency===null?'–':fmt(c.latency)+' s'}</strong><small>letzte Reaktionszeit</small></div></div>`;
}
let chartView='reaction';
function chart(){
 const end=Math.max(12,sim.t),start=end-12,left=220,right=1080,x=t=>left+(t-start)*(right-left)/12;
 const reaction=chartView==='reaction',bottom=reaction?380:290;
 const hist=sim.history.filter(p=>p.t>=start-InterruptLab.DT);
 const colors=['#c97913','#90a4ae','#cbd5e1','#005b96'];
 $('chart-title').textContent=reaction?'Wie schnell reagiert LED 2?':'Womit beschäftigt sich der Mikrocontroller?';
 $('chart-legend').innerHTML=reaction?'<span>Grau hinterlegt: Taster gedrückt</span><span>● Tasterabfrage beim Polling</span>':'<span><i class="swatch" style="background:#90a4ae"></i>Andere Aufgabe</span><span><i class="swatch" style="background:#c97913"></i>Tasterabfrage</span><span><i class="swatch" style="background:#cbd5e1"></i>Durchlauf abschließen</span><span><i class="swatch" style="background:#005b96"></i>ISR</span><span>◆ Durchlauf beendet · LED 1 toggelt</span>';
 let s=`<defs><clipPath id="plot-clip"><rect x="${left}" y="15" width="${right-left}" height="${bottom-15}"/></clipPath></defs>`;
 for(let n=Math.ceil(start);n<=end;n++)s+=`<path d="M${x(n)} 25V${bottom}" stroke="#e1e8ed"/><text class="time-label" x="${x(n)}" y="${bottom+25}" text-anchor="middle">${n} s</text>`;
 if(reaction){
  s+='<g clip-path="url(#plot-clip)">';
  for(const p of sim.pulses)if((p.end??sim.t)>=start)s+=`<rect x="${x(p.at)}" y="30" width="${Math.max(0,x(p.end??sim.t)-x(p.at))}" height="340" fill="#15334b" opacity=".055"/>`;
  s+='</g>';
  [['Taster','button','#526b7d'],['LED 2 · Polling','p2','#b26700'],['LED 2 · Interrupt','i2','#005b96']].forEach(([label,key,color],i)=>{
   const base=125+i*115;
   s+=`<text class="lane-label" x="0" y="${base-43}" fill="${color}">${label}</text><text class="state-label" x="200" y="${base-27}" text-anchor="end">${i?'an · 1':'gedrückt · 1'}</text><text class="state-label" x="200" y="${base+4}" text-anchor="end">${i?'aus · 0':'losgelassen · 0'}</text><path d="M${left} ${base}H${right}" stroke="#d9e4eb"/>`;
   let d='';
   if(i===0){let t=start,level=sim.pulses.some(p=>p.at<=start&&(p.end===null||p.end>start))?1:0;d=`M${x(t)} ${base-level*32}`;for(const p of sim.pulses){for(const [at,val] of [[p.at,1],[p.end,0]])if(at!==null&&at>=start&&at<=sim.t)d+=`H${x(at)}V${base-val*32}`;}d+=`H${x(sim.t)}`;}
   else hist.forEach((p,j)=>{d+=j?`H${x(p.t)}V${base-p[key]*32}`:`M${x(p.t)} ${base-p[key]*32}`;});
   s+=`<path clip-path="url(#plot-clip)" d="${d}" stroke="${color}" stroke-width="3" fill="none"/>`;
   if(i===1)for(const p of hist)if(p.sample)s+=`<circle clip-path="url(#plot-clip)" cx="${x(p.t)}" cy="${base+13}" r="4" fill="${color}"><title>Tasterabfrage bei ${fmt(p.t)} s</title></circle>`;
  });
  const pulse=sim.pulses.filter(p=>p.at>=start).at(-1);
  $('reaction-summary').innerHTML=pulse?['poll','irq'].map((key,i)=>{const at=pulse[key+'At'];const label=at!==undefined?`${fmt(at-pulse.at)} s Reaktionszeit`:pulse.end!==null?'Nicht erkannt':'Noch nicht erfasst';return `<div><b>${i?'Interrupt':'Polling'}: ${label}</b>Tastendruck bei ${fmt(pulse.at)} s${at!==undefined?` · erkannt bei ${fmt(at)} s`:''}</div>`;}).join(''):'<div><b>Versuch starten</b>Taster drücken oder den Vergleichsimpuls auslösen.</div>';
  if(pulse)for(const [key,y,color] of [['poll',175,'#b26700'],['irq',290,'#005b96']]){const at=pulse[key+'At'];if(at!==undefined){const x1=x(pulse.at),x2=x(at);s+=`<path d="M${x1} ${y-4}V${y+4}M${x1} ${y}H${x2}M${x2-4} ${y-4}L${x2} ${y}L${x2-4} ${y+4}" fill="none" stroke="${color}"/><text class="annotation" x="${Math.min(right-110,x1)}" y="${y-10}" fill="${color}">${fmt(at-pulse.at)} s Verzögerung</text>`;}}
  $('chart-note').textContent='Oben = 1, unten = 0. Punkte zeigen die tatsächlichen Polling-Abfragen. Die Reaktionszeiten beziehen sich auf den letzten Tastendruck im sichtbaren Zeitfenster.';
 }else{
  [['Polling','pa','pDone'],['Interrupt','ia','iDone']].forEach(([label,key,done],i)=>{
   const y=80+i*120;s+=`<text class="lane-label" x="0" y="${y+25}">${label}</text>`;
   let segments=[];for(const p of hist){if(p.t===0)continue;let prev=segments.at(-1);if(prev&&prev.kind===p[key])prev.end=p.t;else segments.push({start:p.t-InterruptLab.DT,end:p.t,kind:p[key]});}
   for(const seg of segments){const a=Math.max(start,seg.start),b=Math.min(sim.t,seg.end);if(b<=a)continue;const width=x(b)-x(a),name=['Tasterabfrage','Andere Aufgabe','Abschluss','ISR'][seg.kind];s+=`<rect x="${x(a)}" y="${y}" width="${width}" height="38" fill="${colors[seg.kind]}" stroke="white" stroke-width=".5"><title>${name}: ${fmt(a)} bis ${fmt(b)} s</title></rect>`;if(width>110)s+=`<text class="band-label" x="${(x(a)+x(b))/2}" y="${y+25}" text-anchor="middle">${name}</text>`;}
   for(const p of hist)if(p[done]&&p.t>=start)s+=`<text x="${x(p.t)}" y="${y+59}" text-anchor="middle" style="font-size:18px">◆<title>Durchlauf beendet bei ${fmt(p.t)} s · LED 1 ${p[i?'i1':'p1']?'an':'aus'}</title></text>`;
  });
  $('reaction-summary').innerHTML='';$('chart-note').textContent='Polling kostet in jedem Durchlauf Abfragezeit (orange). Eine ISR (blau) benötigt nur bei einem Ereignis Zeit und unterbricht die laufende Aufgabe. Nach der ISR wird diese fortgesetzt. Jede Raute markiert einen Wechsel von LED 1.';
 }
 s+=`<path d="M${x(sim.t)} 20V${bottom}" stroke="#15334b" stroke-dasharray="4 4"/><text x="${x(sim.t)}" y="14" text-anchor="middle">Jetzt</text>`;
 $('chart').innerHTML=`<svg viewBox="0 0 1100 ${bottom+40}" role="img" aria-label="${reaction?'Tasterreaktion: Taster und LED 2 bei Polling und Interrupt':'Programmlauf: CPU-Zeit für Aufgabe, Abfrage, Abschluss und ISR'}">${s}</svg>`;
}
for(const view of ['reaction','program'])$('view-'+view).onclick=()=>{chartView=view;for(const v of ['reaction','program']){ $('view-'+v).setAttribute('aria-pressed',String(v===view));$('view-'+v).classList.toggle('on',v===view);}chart();};
function render(){ $('time').textContent=fmt(sim.t)+' s';$('button-state').textContent=sim.button;$('button-state').className='level'+(sim.button?' high':'');$('pulse').disabled=!!sim.button;$('hold').textContent=sim.button?'Taster loslassen':'Taster drücken';$('hold').setAttribute('aria-pressed',String(!!sim.button));$('hold').classList.toggle('on',!!sim.button);$('play').textContent=playing?'❚❚ Pause':'▶ Start';$('step').disabled=playing;panel(sim.poll,'poll-panel');panel(sim.irq,'irq-panel');chart();$('stack').innerHTML=sim.irq.stack?`<small>Zuletzt abgelegt · oben</small><div class="address">Zurück zu Schritt ${sim.irq.stack.phase}<br><small>${fmt(sim.irq.stack.remaining)} s Restzeit</small></div>`:'<p class="stack-empty">Kein Interrupt-Rücksprung abgelegt.</p>';$('events').innerHTML=sim.events.map(e=>`<li>${fmt(e.t)} s · ${e.msg}</li>`).join('')||'<li>Noch kein Tastendruck.</li>'; }
function restart(){playing=false;acc=0;sim=new InterruptLab.Experiment(+$('work').value);$('work-value').textContent=fmt(sim.work)+' s';render();}
$('play').onclick=()=>{playing=!playing;acc=0;render();};$('step').onclick=()=>{sim.tick();render();};$('reset').onclick=restart;
$('work').oninput=restart;$('pulse').onclick=()=>{sim.press(.2);render();};$('hold').onclick=()=>{if(sim.button)sim.release();else sim.press(Infinity);render();};
$('demo').onclick=()=>{$('work').value='1.5';restart();sim.demo();playing=true;render();};
$('projector').onclick=e=>{const on=document.body.classList.toggle('projector');e.target.setAttribute('aria-pressed',String(on));e.target.textContent=on?'Standardansicht':'Beameransicht';};
function frame(now){if(last&&playing){acc+=Math.min((now-last)/1000,.1)*+$('speed').value;while(acc>=InterruptLab.DT){sim.tick();acc-=InterruptLab.DT;}render();}last=now;requestAnimationFrame(frame);}
render();requestAnimationFrame(frame);
