const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements=new Map();function el(key){if(!elements.has(key))elements.set(key,{innerHTML:'',textContent:'',style:{},classList:{toggle(){},remove(){}},addEventListener(){}});return elements.get(key)}
const ctx={console,performance:{now:()=>0},localStorage:{getItem:()=>null,setItem(){}},document:{querySelector:el,addEventListener(){},hidden:false},window:{addEventListener(){}},setInterval(){},setTimeout(){},clearTimeout(){},crypto:require('node:crypto').webcrypto,CafeAudio:{sync(){},unlock(){},effect(){},preparation(){}}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('build/prep.js','utf8'),ctx);vm.runInContext(fs.readFileSync('build/game.js','utf8'),ctx);
vm.runInContext(`
 screen='game';state.relaxed=true;
 for(let chapter=1;chapter<=4;chapter++){
  const seen=new Set();
  for(let visit=0;visit<3;visit++){
   modal=null;addOrder();
   if(!state.orders.length)throw Error('Missing visit');
   const portrait=state.orders[0].portrait;if(seen.has(portrait))throw Error('Repeated customer');seen.add(portrait);
   const size=state.orders.length;addOrder();if(state.orders.length!==size)throw Error('Duplicate arrival while serving');
   for(const o of state.orders){o.step=recipe(o).steps.length;delete o.action;}
   serve(state.orders[0].id);
   if(visit<2&&level()!==chapter)throw Error('Level advanced early');
  }
  if(seen.size!==3)throw Error('Wrong customer count');
  if(chapter<4&&level()!==chapter+1)throw Error('Level did not advance after three visits');
 }
 if(!state.journeyComplete||modal!=='complete')throw Error('Missing ending');
 modal=null;addOrder();if(state.orders.length)throw Error('Extra customer after ending');
`,ctx);
// All departed visits also complete the chapter, avoiding an empty café deadlock.
vm.runInContext(`state=fresh();screen='game';modal=null;for(let i=0;i<3;i++){addOrder();state.orders=[];finishVisit();}if(level()!==2)throw Error('Missed visits stalled progression');`,ctx);
assert.ok(fs.readFileSync('build/index.html','utf8').includes('audio.js'));
console.log('PASS: 3 distinct visits in all 4 levels, groups, progression, ending, missed visits, audio inclusion');

assert.ok(fs.readFileSync('build/game.js','utf8').includes("if(a==='music-toggle')"),'Music button handler must survive production build');
