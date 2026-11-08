const {parseHTML}=require(process.env.LINKEDOM_PATH || 'linkedom');const vm=require('vm'),fs=require('fs'),assert=require('assert');const base=require('path').resolve(__dirname,'..')+'/';
const {window}=parseHTML(fs.readFileSync(base+'index.html','utf8'));const document=window.document,noop=()=>{},context2d=new Proxy({},{get:()=>noop,set:()=>true});window.HTMLCanvasElement.prototype.getContext=()=>context2d;window.HTMLElement.prototype.getBoundingClientRect=()=>({left:0,top:0,width:256,height:256,right:256,bottom:256});window.HTMLElement.prototype.setPointerCapture=noop;window.HTMLElement.prototype.showModal=function(){this.open=true};window.HTMLElement.prototype.close=function(){this.open=false};const saved=new Map(),timers=[],autoNext=[],puzzleTicks=[];const context=vm.createContext({window,document,localStorage:{getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)},devicePixelRatio:1,ResizeObserver:class{constructor(f){this.f=f}observe(){this.f()}disconnect(){}},Path2D:class{moveTo(){}lineTo(){}quadraticCurveTo(){}bezierCurveTo(){}closePath(){}},performance,requestAnimationFrame:f=>f(performance.now()+1000),setTimeout:(f,ms)=>{if([250,950,1250,1950,2250,2950,3300,900,4000].includes(ms))puzzleTicks.push({f,ms});if(ms===1500)autoNext.push(f);if(ms===800)timers.push(f);return 1},clearTimeout:noop,console,Blob,URL});for(const f of ['data.js','engine.js','end-puzzles.js','app.js'])vm.runInContext(fs.readFileSync(base+f,'utf8'),context);const run=x=>vm.runInContext(x,context),click=s=>{if(s==='#next-word'&&document.querySelector(s)?.hidden){assert(autoNext.length,'missing automatic transition');const tick=autoNext.pop();autoNext.length=0;tick();return}const e=document.querySelector(s);assert(e,'missing '+s);e.onclick?.({target:e,preventDefault:noop})};function write(){const tracks=run('board.tracks');for(const track of tracks){const c=document.querySelector('canvas');const e=p=>({pointerId:1,pointerType:'pen',clientX:p[0],clientY:p[1],preventDefault:noop});c.onpointerdown(e(track[0]));for(const p of track)c.onpointermove(e(p));c.onpointerup(e(track.at(-1)))}assert(run('board.done===board.tracks.length'));assert(run("active.mode==='practice'")?!document.querySelector('#next-word').hidden:document.querySelector('#next-word').hidden)}

function wrong(){const c=document.querySelector('canvas'),e=(x,y)=>({pointerId:1,pointerType:'pen',clientX:x,clientY:y,preventDefault:noop});c.onpointerdown(e(0,0));c.onpointermove(e(255,255));c.onpointerup(e(255,255))}



function flushPuzzle(){const q=puzzleTicks.splice(0).sort((a,b)=>a.ms-b.ms);q.forEach(x=>x.f())}
function solve(i){
 if(i===0){const cards=run('endPuzzle.cards.map(c=>c.char)');const seen=new Set();cards.forEach((c,k)=>{if(!seen.has(c)){seen.add(c);click('[data-card="'+k+'"]');click('[data-card="'+cards.indexOf(c,k+1)+'"]')}})}
 if(i===1){click('#listen-rune');assert(!document.querySelector('#phonetic-text').hidden);click('[data-choice="'+run('endPuzzle.target')+'"]')}
 if(i===2){const order=run('endPuzzle.words.map((c,k)=>({k,n:c.count})).sort((a,b)=>a.n-b.n).map(c=>c.k)');order.forEach(k=>click('[data-choice="'+k+'"]'))}
 if(i===3){click('#memory-start');assert(!document.querySelector('[data-choice]'));flushPuzzle();click('[data-choice="'+run('endPuzzle.target')+'"]')}
 if(i===4){click('#sequence-start');flushPuzzle();run('endPuzzle.sequence').forEach(k=>click('[data-choice="'+k+'"]'))}
 if(i===5){for(let k=0;k<4;k++){click('[data-piece="'+k+'"]');click('[data-slot="'+k+'"]')}}
 assert(run('state.endPuzzles['+i+']===true'));assert(document.querySelector('.crystal-award'));assert.equal(document.querySelector('.award-progress strong').textContent.trim(),(i+1)+' / 6')
}
// A full new adventure never displays the removed mid-lesson puzzle.
click('#continue');for(let i=0;i<6;i++){
 if(i)run('enterRegion('+i+')');
 for(let n=0;n<18;n++){assert.equal(run('screen'),'battle');write();click('#next-word')}
 assert.equal(run('screen'),'end-puzzle');assert(!run('regionCleared('+i+')'));assert.equal(run('cleared()'),i);assert(!run('crystalsReady()'));assert.equal(run('endPuzzle.words.every(c=>Q.required(D.lessons['+i+']).some(w=>w.char===c.char))'),true);
 const coins=run('state.coins'),mistakes=run('JSON.stringify(state.storyMistakes)');
 if(i===0){const cards=run('endPuzzle.cards.map(c=>c.char)');click('[data-card="0"]');click('[data-card="'+cards.findIndex(c=>c!==cards[0])+'"]');assert(run('endPuzzle.busy'));flushPuzzle();assert(!run('endPuzzle.busy'))}
 if(i===1){click('[data-choice="'+((run('endPuzzle.target')+1)%3)+'"]');assert(!run('endPuzzle.done'));assert.equal(run('new Set(endPuzzle.words.map(c=>c.zhuyin)).size'),3)}
 if(i===2){run('endPuzzle.words.map((c,k)=>({k,n:c.count})).sort((a,b)=>b.n-a.n).map(c=>c.k)').forEach(k=>click('[data-choice="'+k+'"]'));assert(!run('endPuzzle.done'));assert.equal(run('endPuzzle.order.length'),0)}
 if(i===5){click('[data-piece="0"]');click('[data-slot="1"]');assert.equal(run('endPuzzle.placed.length'),0)}
 solve(i);assert.equal(run('state.coins'),coins);assert.equal(run('JSON.stringify(state.storyMistakes)'),mistakes);assert(JSON.parse(saved.get('rune-quest-v1')).endPuzzles[i]);assert.equal(run('screen'),'victory');assert(document.querySelector('[data-new-crystal="'+i+'"] .newly-acquired'));click('#award-skip');assert(document.querySelector('.award-settled'));if(i===5){click('#victory-next');assert.equal(run('screen'),'summon')}
}
assert.equal(run('count()'),108);assert(run('crystalsReady()'));click('#summon-skip');click('#summon-enter');assert.equal(run('state.finalQueue.length'),10);for(let i=0;i<10;i++){write();click('#next-word')}assert(run('state.finalDone'));
// Old completed crystals are preserved; modern pending puzzles stay pending on reload/import.
run('const oldSave={progress:[18,18,0,0,0,0]};normalizeEndPuzzles(oldSave);');assert.equal(run('Object.keys(oldSave.endPuzzles).length'),2);
run('const newSave={progress:[18,18,0,0,0,0],endPuzzleVersion:1,endPuzzles:{0:true,2:true}};normalizeEndPuzzles(newSave);');assert.equal(run('Object.keys(newSave.endPuzzles).length'),1);
// Timer callbacks from abandoned memory screens must not mutate a new screen.
run('renderEndPuzzle(3)');click('#memory-start');click('#back');flushPuzzle();assert.equal(run('screen'),'map');run('enterRegion(3)');assert.equal(run('screen'),'battle');assert.equal(run('active.mode'),'replay');
console.log('PASS: 108-word adventure, six distinct post-Boss puzzles, removed mid-lesson gate, errors/retries, audio fallback and unique sounds, crystal/dragon gating, replay, migration, pending save and timer cancellation.');
