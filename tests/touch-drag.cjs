const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const handlers={},docHandlers={},nodes=new Map(),classes=new Set();
function node(key){if(!nodes.has(key))nodes.set(key,{innerHTML:'',style:{},textContent:'',classList:{add(){},remove(){},toggle(){}},addEventListener(type,fn){(handlers[type]??=[]).push(fn)},getBoundingClientRect:()=>({left:200,right:400,top:100,bottom:300}),remove(){nodes.delete(key)}});return nodes.get(key)}
const body={classList:{add:c=>classes.add(c),remove:c=>classes.delete(c)},append:g=>nodes.set('.drag-ghost',g)};
const ctx={console,Date,performance:{now:()=>0},crypto:require('node:crypto').webcrypto,localStorage:{getItem:()=>null,setItem(){}},document:{body,hidden:false,querySelector:node,createElement:()=>({style:{},remove(){nodes.delete('.drag-ghost')}}),addEventListener(type,fn){(docHandlers[type]??=[]).push(fn)}},window:{addEventListener(){}},setInterval(){},setTimeout(){},clearTimeout(){},CafeAudio:{sync(){},unlock(){return Promise.resolve(true)},effect(){},preparation(){}}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('build/prep.js','utf8'),ctx);vm.runInContext(fs.readFileSync('build/game.js','utf8'),ctx);
vm.runInContext("screen='game';state.relaxed=true;addOrder(true);selected=state.orders[0].id;render()",ctx);
let captured=false;const source={dataset:{ingredient:'Cup'},disabled:false,setPointerCapture(){captured=true},hasPointerCapture:()=>captured,releasePointerCapture(){captured=false}};
function event(extra={}){return {pointerId:7,pointerType:'touch',button:0,clientX:40,clientY:300,cancelable:true,prevented:false,preventDefault(){this.prevented=true},target:{closest:s=>s==='[data-ingredient]'?source:null},...extra}}
const fire=(type,e)=>{for(const fn of handlers[type]||[])fn(e)};
let down=event();fire('pointerdown',down);assert.ok(down.prevented&&captured);assert.ok(classes.has('ingredient-dragging'));
let move=event({clientX:250,clientY:150});fire('pointermove',move);assert.ok(move.prevented,'Drag movement must not scroll');
const second=event({pointerId:8});fire('pointerup',second);assert.equal(vm.runInContext('drag.pointerId',ctx),7,'Second finger must not complete drag');
const touch=event();for(const fn of docHandlers.touchmove)fn(touch);assert.ok(touch.prevented,'iOS active gesture must prevent page pan');
fire('pointerup',event({clientX:250,clientY:150}));assert.equal(vm.runInContext('state.orders[0].action',ctx),'Cup');assert.ok(!captured&&!classes.has('ingredient-dragging'));
const normal=event();for(const fn of docHandlers.touchmove)fn(normal);assert.equal(normal.prevented,false,'Scrolling outside a drag stays available');
vm.runInContext('delete state.orders[0].action',ctx);fire('pointerdown',event());fire('pointercancel',event());assert.equal(vm.runInContext('drag',ctx),null);assert.ok(!classes.has('ingredient-dragging'));
fire('pointerdown',event());fire('pointerup',event());assert.equal(vm.runInContext('pick',ctx),'Cup','Tap-to-place stays available');
console.log('PASS: touch drag/drop, scroll prevention, second finger isolation, cancellation cleanup, normal scrolling and tap selection');
