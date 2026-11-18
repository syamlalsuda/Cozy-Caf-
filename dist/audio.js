'use strict';
// Original procedural café score and kitchen effects. No third-party music or recordings.
const CafeAudio=(()=>{
 let ctx,master,musicGain,fxGain,previewGain,clock=null,next=0,beat=0,active=false,music=true,effects=true;
 const notes=[60,64,67,71,62,65,69,72,59,62,67,71,60,64,69,72];
 function tone(freq,at,duration,volume,bus,type='sine'){
  const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=type;osc.frequency.value=freq;
  gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(volume,at+.015);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
  osc.connect(gain);gain.connect(bus);osc.start(at);osc.stop(at+duration+.02);
 }
 function noise(duration,volume,cutoff=1500){
  const buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*duration),ctx.sampleRate),data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);
  const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=buffer;filter.type='lowpass';filter.frequency.value=cutoff;gain.gain.value=volume;
  source.connect(filter);filter.connect(gain);gain.connect(fxGain);source.start();
 }
 function tick(){
  if(!ctx||ctx.state!=='running'||!active||!music)return;
  if(next<ctx.currentTime)next=ctx.currentTime+.03;
  while(next<ctx.currentTime+.16){
   const chord=Math.floor(beat/8)%4,root=[48,50,43,45][chord];
   if(beat%2===0)tone(440*2**((notes[chord*4+(beat/2)%4]-69)/12),next,1.4,.14,musicGain);
   if(beat%4===0){tone(440*2**((root-69)/12),next,2,.12,musicGain);tone(440*2**((root+7-69)/12),next,1.8,.035,musicGain);}
   beat++;next+=60/76/2;
  }
 }
 function unlock(){try{if(!ctx){const AudioEngine=window.AudioContext||window.webkitAudioContext;if(!AudioEngine)return Promise.resolve(false);ctx=new AudioEngine();master=ctx.createGain();master.gain.value=.8;master.connect(ctx.destination);musicGain=ctx.createGain();musicGain.connect(master);fxGain=ctx.createGain();fxGain.connect(master);previewGain=ctx.createGain();previewGain.gain.value=.9;previewGain.connect(master);clock=setInterval(tick,80);}return ctx.resume().then(()=>{tick();return ctx.state==='running';}).catch(()=>false);}catch{return Promise.resolve(false);}}
 function sync(opts){active=opts.active;music=opts.music;effects=opts.effects;if(!ctx)return;musicGain.gain.setTargetAtTime(active&&music ? .65 : 0,ctx.currentTime,.08);fxGain.gain.setTargetAtTime(active&&effects ? .9 : 0,ctx.currentTime,.03);}
 function effect(kind,preview=false){if(!ctx||ctx.state!=='running'||(!preview&&(!active||!effects)))return;const t=ctx.currentTime,bus=preview?previewGain:fxGain;
  if(kind==='pour'){noise(.65,.23,900);for(let i=0;i<6;i++)tone(500+i*73,t+i*.07,.12,.05,bus);}
  else if(kind==='brew'||kind==='sizzle')noise(kind==='brew'?1.3:.9,.14,kind==='brew'?500:2600);
  else if(kind==='chop'){for(let i=0;i<3;i++)tone(170,t+i*.12,.045,.22,bus,'triangle');}
  else if(kind==='stir'){for(let i=0;i<4;i++)tone(1400+i*80,t+i*.13,.09,.07,bus);}
  else if(kind==='serve'||kind==='arrive'){[0,4,7].forEach((n,i)=>tone(523.25*2**(n/12),t+i*.11,.45,.11,bus));}
  else if(kind==='wrong')tone(150,t,.23,.16,bus,'triangle');
  else {tone(kind==='plate'?1100:650,t,.14,.14,bus);}
 }
 function preparation(item){effect(/water|milk|stock|cream|oil/i.test(item)?'pour':/brew|coffee|espresso|cool water/i.test(item)?'brew':/sauté|grill|bake|simmer|boil|toast|melt|heat|reduce|warm/i.test(item)?'sizzle':/stir|whisk|fold/i.test(item)?'stir':/bread|tomato|garlic|mushroom/i.test(item)?'chop':/cup|plate|pot|pan|bowl|tray|ramekin/i.test(item)?'plate':'tap');}
 function preview(){return unlock().then(ok=>{if(ok)effect('serve',true);return ok;});}
 return {unlock,sync,effect,preparation,preview};
})();
