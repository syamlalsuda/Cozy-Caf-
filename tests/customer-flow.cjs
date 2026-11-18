const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements=new Map();function el(key){if(!elements.has(key))elements.set(key,{innerHTML:'',textContent:'',style:{},classList:{toggle(){},remove(){}},addEventListener(){}});return elements.get(key)}
let loop;
const ctx={console,Date,performance:{now:()=>0},localStorage:{getItem:()=>null,setItem(){}},document:{querySelector:el,addEventListener(){},hidden:false},window:{addEventListener(){}},setInterval(fn){loop=fn},setTimeout(){},clearTimeout(){},crypto:require('node:crypto').webcrypto,CafeAudio:{sync(){},unlock(){return Promise.resolve(true)},effect(){},preparation(){}}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('build/prep.js','utf8'),ctx);vm.runInContext(fs.readFileSync('build/game.js','utf8'),ctx);
vm.runInContext(`
 screen='game';state.relaxed=true;
 // Failing three or more visits must neither unlock the next level nor stall new arrivals.
 const portraits=new Set();let previous=null;
 for(let i=0;i<12;i++){
  modal=null;addOrder();if(!state.orders.length)throw Error('No retry customer');
  const portrait=state.orders[0].portrait;portraits.add(portrait);
  if(i>=3&&portrait===previous)throw Error('Back-to-back duplicate');previous=portrait;
  state.orders=[];finishVisit();if(level()!==1)throw Error('Failed order advanced level without cash');
 }
 if(portraits.size!==3)throw Error('Level has more or fewer than three customer characters');
 // Money, not visit count or XP, unlocks every next chapter.
 for(let chapter=1;chapter<=3;chapter++){
  state={...fresh(),levelNumber:chapter,cash:chapter*100-30,xp:9999,relaxed:true};screen='game';modal=null;
  addOrder();const size=state.orders.length;addOrder();if(state.orders.length!==size)throw Error('Overlapping arrival');
  state.orders=[];finishVisit();if(level()!==chapter)throw Error('Advanced below target');
  state.cash=chapter*100-1;addOrder();for(const o of state.orders){o.step=recipe(o).steps.length;delete o.action;}serve(state.orders[0].id);
  if(level()!==chapter+1||modal!=='level')throw Error('Earnings did not unlock next level');
 }
 // Final hotel chapter still has a finite ending.
 state={...fresh(),levelNumber:4,relaxed:true};screen='game';modal=null;
 for(let i=0;i<3;i++){addOrder();for(const o of state.orders){o.step=recipe(o).steps.length;delete o.action;}serve(state.orders[0].id);}
 if(!state.journeyComplete)throw Error('Missing hotel ending');modal=null;addOrder();if(state.orders.length)throw Error('Customer after completion');
`,ctx);
// Exercise real timeout/arrival loop, rather than only the helper.
vm.runInContext(`state=fresh();screen='game';modal=null;addOrder();state.orders.forEach(o=>o.remaining=-21);`,ctx);loop();
assert.equal(vm.runInContext('level()',ctx),1);vm.runInContext('state.nextArrival=0',ctx);loop();assert.ok(vm.runInContext('state.orders.length>0',ctx));
assert.ok(fs.readFileSync('build/index.html','utf8').includes('audio.js'));
assert.ok(fs.readFileSync('build/game.js','utf8').includes("if(a==='music-toggle')"));
console.log('PASS: cash gates $100/$200/$300, failed-order retries, random customers limited to three identities, expiry/arrival loop, hotel ending');
