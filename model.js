(function(root){
'use strict';
const DT=.02;
class Experiment{
 constructor(work=1.5){this.work=work;this.reset();}
 reset(){this.t=0;this.button=0;this.until=0;this.pulses=[];this.active=null;this.history=[];this.events=[];this.poll=this.cpu(false);this.irq=this.cpu(true);this.sample=false;this.activityP=0;this.activityI=1;this.pDone=false;this.iDone=false;this.record();}
 cpu(irq){return {irq,phase:irq?1:0,remaining:irq?this.work:.12,led1:0,cycles:0,led2:0,hits:0,checks:0,last:0,pending:null,stage:-1,ticks:0,stack:null,latency:null};}
 log(msg){this.events.unshift({t:this.t,msg});this.events=this.events.slice(0,12);}
 press(duration=.2){if(this.button)return false;this.button=1;this.until=duration===Infinity?Infinity:this.t+duration;const p={at:this.t,end:null,poll:false,irq:false};this.pulses.push(p);this.active=p;this.irq.pending=p;this.log('Taster: steigende Flanke → Interruptanforderung gespeichert.');return true;}
 release(){if(!this.button)return;this.button=0;this.until=0;this.active.end=this.t;this.irq.pending={at:this.t,level:0};this.log('Taster: fallende Flanke → Interruptanforderung gespeichert.');this.log(this.active.poll?'Taster losgelassen; Polling hat diesen Impuls erfasst.':'Taster losgelassen; Polling hat diesen Impuls nicht als neuen Tastendruck erfasst.');this.active=null;}
 hit(c,p){c.hits++;c.latency=this.t-p.at;p[c.irq?'irq':'poll']=true;p[c.irq?'irqAt':'pollAt']=this.t;}
 tick(){this.t=+(this.t+DT).toFixed(8);this.sample=false;if(this.button&&this.t+1e-8>=this.until)this.release();this.activityP=this.poll.phase;this.activityI=(this.irq.stage>=0||this.irq.pending)?3:this.irq.phase;const pc=this.poll.cycles,ic=this.irq.cycles;this.run(this.poll);this.run(this.irq);this.pDone=this.poll.cycles>pc;this.iDone=this.irq.cycles>ic;this.record();}
 run(c){
  if(c.irq&&c.stage<0&&c.pending){c.stage=0;c.ticks=2;c.servicing=c.pending;c.pending=null;c.stack={phase:c.phase,remaining:c.remaining};this.log('Interrupt: Rückkehrstelle auf den Stack, Hauptprogramm pausiert.');}
  if(c.stage>=0){if(--c.ticks<=0){if(c.stage===0){c.stage=1;c.ticks=2;c.led2=this.button;if(this.button&&this.active&&!this.active.irq)this.hit(c,this.active);c.servicing=null;this.log('ISR: Tasterpegel gelesen → LED 2 '+(c.led2?'an.':'aus.'));}else if(c.stage===1){c.stage=2;c.ticks=2;}else{c.phase=c.stack.phase;c.remaining=c.stack.remaining;c.stack=null;c.stage=-1;this.log('RETI: Rückkehrstelle entnommen; Hauptprogramm wird fortgesetzt.');}}return;}
  c.remaining-=DT;if(c.remaining>1e-8)return;
  if(c.phase===0){if(!c.irq){c.checks++;this.sample=true;c.led2=this.button;if(this.button&&!c.last&&this.active)this.hit(c,this.active);c.last=this.button;}c.phase=1;c.remaining=this.work;}
  else if(c.phase===1){c.phase=2;c.remaining=.12;}
  else{c.led1=1-c.led1;c.cycles++;c.phase=c.irq?1:0;c.remaining=c.irq?this.work:.12;}
 }
 record(){this.history.push({t:this.t,button:this.button,p1:this.poll.led1,i1:this.irq.led1,p2:this.poll.led2,i2:this.irq.led2,pa:this.activityP,ia:this.activityI,pDone:this.pDone,iDone:this.iDone,sample:this.sample,isr:+(this.irq.stage>=0)});while(this.history.length>610)this.history.shift();}
 step(seconds){const n=Math.round(seconds/DT);for(let i=0;i<n;i++)this.tick();}
 demo(){this.reset();this.step(.4);this.press(.2);}
}
const api={Experiment,DT};if(typeof module!=='undefined')module.exports=api;else root.InterruptLab=api;
})(typeof window!=='undefined'?window:globalThis);
