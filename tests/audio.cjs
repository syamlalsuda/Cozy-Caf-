const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let scheduled=0;const gains=[];let timer;
const param=()=>({value:0,setValueAtTime(v){this.value=v},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(v){this.value=v}});
class AudioEngine{constructor(){this.currentTime=0;this.sampleRate=48000;this.state='suspended';this.destination={}}createGain(){const n={gain:param(),connect(){}};gains.push(n);return n}createOscillator(){return {frequency:param(),connect(){},start(){scheduled++},stop(){}}}resume(){this.state='running';return Promise.resolve()}createBuffer(c,n){return {getChannelData:()=>new Float32Array(n)}}createBufferSource(){return {connect(){},start(){scheduled++}}}createBiquadFilter(){return {frequency:param(),connect(){}}}}
const ctx={window:{AudioContext:AudioEngine},setInterval(fn){timer=fn},Math,Float32Array};vm.createContext(ctx);vm.runInContext(fs.readFileSync('dist/audio.js','utf8'),ctx);
(async()=>{
 assert.equal(await vm.runInContext('CafeAudio.unlock()',ctx),true);
 vm.runInContext('CafeAudio.sync({active:true,music:true,effects:true})',ctx);timer();assert.ok(scheduled>=3,'Music schedules audible notes');assert.equal(gains[1].gain.value,.65);
 vm.runInContext("CafeAudio.preparation('Hot water')",ctx);assert.ok(scheduled>=10,'Pouring schedules noise and droplets');
 vm.runInContext('CafeAudio.sync({active:false,music:false,effects:false})',ctx);assert.equal(gains[1].gain.value,0);assert.equal(gains[2].gain.value,0);
 const before=scheduled;await vm.runInContext('CafeAudio.preview()',ctx);assert.equal(scheduled,before+3,'Sound preview works while paused and muted');assert.equal(gains[3].gain.value,.9);
 console.log('PASS: music start, audible gain, pouring effects, mute, and paused preview');
})();
