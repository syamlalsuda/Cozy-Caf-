const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const storage=new Map();
function boot(){
 const elements=new Map(),listeners={};const el=key=>{if(!elements.has(key))elements.set(key,{innerHTML:'',textContent:'',style:{},addEventListener(){},classList:{toggle(){},remove(){}}});return elements.get(key)};
 const ctx={console,Date,performance:{now:()=>0},crypto:require('node:crypto').webcrypto,localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},document:{querySelector:el,addEventListener(){},hidden:false},window:{addEventListener:(key,fn)=>listeners[key]=fn},setInterval(){},setTimeout(){},clearTimeout(){},CafeAudio:{sync(){},unlock(){return Promise.resolve(true)},effect(){},preparation(){}}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('build/prep.js','utf8'),ctx);vm.runInContext(fs.readFileSync('build/game.js','utf8'),ctx);return {ctx,listeners,read:code=>vm.runInContext(code,ctx)};
}
let game=boot();game.read(`state.name='Syam';state.seenIntro=true;state.levelNumber=2;state.cash=137;state.xp=56;state.upgrades=['plants'];screen='game';modal=null;addOrder();selected=state.orders[0].id;state.orders[0].step=2;state.orders[0].remaining=37.5;state.orders[0].action='Tomato';state.orders[0].actionLeft=.4;state.orders[0].actionTotal=1;render();`);
const id=game.read('selected');game.listeners.pagehide();game=boot();
assert.equal(game.read('state.cash'),137);assert.equal(game.read('level()'),2);assert.equal(game.read('selected'),id);assert.equal(game.read('state.orders[0].step'),2);assert.equal(game.read('state.orders[0].remaining'),37.5);assert.equal(game.read('state.orders[0].actionLeft'),.4);assert.equal(game.read('screen'),'game');assert.equal(game.read('modal'),'resume');assert.equal(game.read("state.upgrades[0]"),'plants');
// Recover the whole café if the main record is malformed.
storage.set('cozy-cafe-v1','broken JSON');game=boot();assert.equal(game.read('state.cash'),137);assert.equal(game.read('selected'),id);
// Legacy saves without view information also resume safely.
const legacy=JSON.parse(storage.get('cozy-cafe-v1'));delete legacy.view;storage.set('cozy-cafe-v1',JSON.stringify(legacy));game=boot();assert.equal(game.read('selected'),null);assert.equal(game.read('state.orders[0].step'),2);assert.equal(game.read('modal'),'resume');
console.log('PASS: refresh preserves café, active preparation, timer, upgrades; backup and older saves recover');
