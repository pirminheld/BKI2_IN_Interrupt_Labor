const assert=require('node:assert/strict');const {Experiment}=require('./model.js');
let s=new Experiment();s.step(1.98);assert.equal(s.signal,1);s.tick();assert.equal(s.signal,0);s.step(2);assert.equal(s.signal,1);
s=new Experiment();s.demo();const rest=s.irq.remaining;s.tick();assert.ok(s.irq.stack);s.step(.12);assert.equal(s.irq.hits,1);assert.equal(s.irq.stack,null);assert.equal(s.poll.hits,0);s.step(1.5);assert.equal(s.poll.hits,0);assert.equal(s.pulses[0].poll,false);assert.ok(s.irq.latency<=.06);
s=new Experiment();s.step(.4);s.press(Infinity);s.step(2);assert.equal(s.poll.hits,1);assert.equal(s.irq.hits,1);assert.ok(s.poll.latency>s.irq.latency);s.step(3);assert.equal(s.poll.hits,1);assert.equal(s.irq.hits,1);s.release();s.step(2);s.press(Infinity);s.step(2);assert.equal(s.poll.hits,2);assert.equal(s.irq.hits,2);
s=new Experiment(.1);s.step(.4);s.press(.2);s.step(.3);assert.equal(s.poll.hits,1);assert.equal(s.irq.hits,1);
s=new Experiment();s.step(.4);s.press(.2);s.tick();const saved={...s.irq.stack};s.step(.1);assert.equal(s.irq.phase,saved.phase);assert.ok(Math.abs(s.irq.remaining-saved.remaining)<1e-6);assert.equal(s.irq.stack,null);s.step(1.2);assert.ok(s.t>s.irq.lampUntil);
console.log('Modell geprüft: 4-s-Signal, verpasster kurzer Impuls, langer Tastendruck, schnelles Polling, Flankenerkennung, ISR-Rückkehr und Nachleuchtdauer.');
