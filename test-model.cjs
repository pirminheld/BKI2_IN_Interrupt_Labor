const assert=require('node:assert/strict');const {Experiment}=require('./model.js');
let s=new Experiment();s.step(1.74);assert.equal(s.poll.led1,1);assert.equal(s.poll.cycles,1);s.step(1.74);assert.equal(s.poll.led1,0);
s=new Experiment();s.demo();s.step(.06);assert.equal(s.irq.led2,1);assert.equal(s.poll.led2,0);s.step(.2);assert.equal(s.irq.led2,0);assert.equal(s.irq.hits,1);s.step(2);assert.equal(s.poll.hits,0);assert.equal(s.poll.led2,0);
s=new Experiment();s.step(.4);s.press(Infinity);s.step(2);assert.equal(s.poll.led2,1);assert.equal(s.irq.led2,1);s.step(4);assert.equal(s.poll.led2,1);assert.equal(s.irq.led2,1);assert.equal(s.irq.hits,1);s.release();s.step(.06);assert.equal(s.irq.led2,0);assert.equal(s.poll.led2,1);s.step(2);assert.equal(s.poll.led2,0);
s=new Experiment();s.step(.4);s.press(Infinity);s.tick();const saved={...s.irq.stack};s.step(.1);assert.equal(s.irq.stack,null);assert.equal(s.irq.phase,saved.phase);assert.ok(Math.abs(s.irq.remaining-saved.remaining)<1e-6);
s=new Experiment(.1);s.step(.4);s.press(.2);s.step(.1);assert.equal(s.poll.led2,1);assert.equal(s.irq.led2,1);s.step(.4);assert.equal(s.poll.led2,0);assert.equal(s.irq.led2,0);
console.log('Geprüft: LED1-Toggle, kurzer Impuls, langes Halten ohne Zeitabschaltung, Loslassen in beiden Varianten, verzögertes Polling-Aus und ISR-Rückkehr.');
