'use strict';
let endPuzzle=null,endTimers=[];
const END_PUZZLES=[['生字記憶配對','森林精靈的雙生符文','翻開石牌，找出三對相同的生字。'],['字形尋寶','溪谷精靈的字形寶石','看上方的字，點選下方一模一樣的字。'],['筆畫數排序','晶洞的石板階梯','由筆畫少到多，依序點選下方生字。'],['找出消失的字','古樹的失落封印','記住三個字，找回稍後消失的那一字。'],['符文順序記憶','潮汐的閃光密碼','看生字依序亮起，再依相同順序點選。'],['生字拼圖','星城的破碎石碑','先點一塊碎片，再點它應該放入的格子。']];
function normalizeEndPuzzles(target,source=target){const old=source.endPuzzleVersion!==1,done={};for(let i=0;i<6;i++)if(target.progress[i]===lessonTotal(i)&&(old||source.endPuzzles?.[i]===true))done[i]=true;target.endPuzzles=done;target.endPuzzleVersion=1}
function cleanupEndPuzzle(){endTimers.forEach(clearTimeout);endTimers=[];endPuzzle=null;if(window.speechSynthesis)window.speechSynthesis.cancel()}
function endLater(fn,ms){const session=endPuzzle;const id=setTimeout(()=>{if(endPuzzle===session&&screen==='end-puzzle')fn()},ms);endTimers.push(id)}
function shuffled(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function endMessage(text){$('#end-message').textContent=text}
function endButton(word,index){return `<button class="rune-choice" data-choice="${index}">${word.char}</button>`}
function finishEndPuzzle(){const p=endPuzzle;if(!p||p.done)return;p.done=true;const alreadyOwned=regionCleared(p.region);state.endPuzzles[p.region]=true;save();regionVictory(p.region,alreadyOwned)}
function renderEndPuzzle(i){
 if(state.progress[i]!==lessonTotal(i)||(i>0&&!regionCleared(i-1))){renderMap();return}
 cleanup();active={mode:'story',region:i};screen='end-puzzle';setNav('map');
 const pool=shuffled(Q.required(D.lessons[i])),words=pool.slice(0,3);
 endPuzzle={region:i,words,pool,done:false,busy:false,chosen:[],target:0};
 APP.innerHTML=battleHeader('水晶試煉・'+END_PUZZLES[i][0],regions[i]+' · Boss 已擊敗')+`<section class="end-puzzle" style="--puzzle-color:${CRYSTAL_COLORS[i]}"><span class="tag">解開這一題，就能取得水晶</span><h1>${END_PUZZLES[i][1]}</h1><p>${END_PUZZLES[i][2]}</p><div id="end-area"></div><div id="end-tools"></div><p id="end-message" role="status">答錯可以再試，不扣生命值。</p><p class="puzzle-note">離開後需重新解這一題，已完成的戰鬥會保留</p></section>`;
 $('#back').onclick=renderMap;$('#game-help').onclick=()=>modal('<h2>'+END_PUZZLES[i][0]+'</h2><p>'+END_PUZZLES[i][2]+'</p><p>解開謎題就能取得水晶。答錯不扣生命，可使用畫面上的提示或重播。</p><button class="primary" id="puzzle-help-close">知道了，繼續 →</button>',{'puzzle-help-close':closeModal});
 [pairPuzzle,shapePuzzle,sortPuzzle,missingPuzzle,sequencePuzzle,jigsawPuzzle][i]();save()
}
function pairPuzzle(){const p=endPuzzle;p.cards=shuffled([...p.words,...p.words]);p.matched=[];
 $('#end-area').innerHTML='<div class="rune-grid">'+p.cards.map((c,i)=>`<button class="rune-choice card-back" data-card="${i}" aria-label="翻開第 ${i+1} 張石牌">✦</button>`).join('')+'</div>';
 document.querySelectorAll('[data-card]').forEach(b=>b.onclick=()=>{const k=+b.dataset.card;if(p.busy||p.done||p.matched.includes(k)||p.chosen.includes(k))return;b.textContent=p.cards[k].char;b.setAttribute('aria-label',p.cards[k].char);b.classList.remove('card-back');p.chosen.push(k);if(p.chosen.length<2)return;const [a,c]=p.chosen;if(p.cards[a].char===p.cards[c].char){p.matched.push(a,c);p.chosen=[];[a,c].forEach(n=>{const e=$('[data-card="'+n+'"]');e.disabled=true;e.classList.add('matched')});endMessage('配對成功！'+p.matched.length/2+' / 3 對');if(p.matched.length===6)finishEndPuzzle()}else{p.busy=true;endMessage('不是同一個字，記住它們的位置再試。');endLater(()=>{[a,c].forEach(n=>{const e=$('[data-card="'+n+'"]');e.textContent='✦';e.classList.add('card-back');e.setAttribute('aria-label','翻開第 '+(n+1)+' 張石牌')});p.chosen=[];p.busy=false},900)}})
}
function shapePuzzle(){const p=endPuzzle,word=p.pool[0];
 const others=p.pool.filter(c=>c.char!==word.char).sort((a,b)=>Math.abs(a.count-word.count)-Math.abs(b.count-word.count)).slice(0,2);
 p.words=shuffled([word,...others]);p.target=p.words.findIndex(c=>c.char===word.char);
 $('#end-area').innerHTML='<div class="shape-reference"><span class="puzzle-label">找出和這個一樣的字</span><strong id="shape-word">'+word.char+'</strong></div><div class="rune-options">'+p.words.map(endButton).join('')+'</div>';
 $('#end-tools').innerHTML='';endMessage('仔細看字形，再點選。答錯可以再試，不扣生命值。');
 document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{if(p.done||endPuzzle!==p)return;if(+b.dataset.choice===p.target)finishEndPuzzle();else endMessage('還不一樣喔！看看每一筆的位置，再找一次。')})
}
function sortPuzzle(){const p=endPuzzle;p.words=p.pool.filter((c,i,a)=>a.findIndex(x=>x.count===c.count)===i).slice(0,3);p.order=[];
 $('#end-area').innerHTML='<div class="sort-slots" id="sort-answer">'+p.words.map(()=> '◇').join(' → ')+'</div><div class="rune-options">'+p.words.map(endButton).join('')+'</div>';
 $('#end-tools').innerHTML='<button class="subtle" id="sort-reset">重新排列</button><button class="subtle" id="stroke-hint">查看筆畫數</button>';
 const reset=()=>{p.order=[];$('#sort-answer').textContent=p.words.map(()=> '◇').join(' → ');document.querySelectorAll('[data-choice]').forEach(b=>b.disabled=false)};$('#sort-reset').onclick=reset;
 $('#stroke-hint').onclick=()=>{document.querySelectorAll('[data-choice]').forEach((b,i)=>b.innerHTML=p.words[i].char+'<small>'+p.words[i].count+' 畫</small>')};
 document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{b.disabled=true;p.order.push(+b.dataset.choice);$('#sort-answer').textContent=p.order.map(k=>p.words[k].char).join(' → ');if(p.order.length===p.words.length){if(p.order.every((k,n)=>n===0||p.words[p.order[n-1]].count<=p.words[k].count))finishEndPuzzle();else{endMessage('順序還不對，從筆畫最少的字開始。可查看筆畫數。');reset()}}})
}
function missingPuzzle(){const p=endPuzzle;p.target=Math.floor(Math.random()*3);
 $('#end-area').innerHTML='<div class="rune-options" id="memory-words">'+p.words.map(c=>'<span class="rune-choice">'+c.char+'</span>').join('')+'</div>';
 $('#end-tools').innerHTML='<button class="primary" id="memory-start">準備好了，開始記憶</button>';
 $('#memory-start').onclick=()=>{if(p.busy)return;p.busy=true;$('#memory-start').disabled=true;endMessage('記住這三個字，4 秒後一個字會消失。');endLater(()=>{$('#memory-words').children[p.target].textContent='？';$('#end-tools').innerHTML='<div class="rune-options">'+shuffled(p.words.map((c,k)=>({c,k}))).map(({c,k})=>endButton(c,k)).join('')+'</div><button class="subtle" id="memory-again">再看一次</button>';endMessage('哪個字消失了？');$('#memory-again').onclick=()=>{p.busy=false;missingPuzzle()};document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{if(+b.dataset.choice===p.target)finishEndPuzzle();else endMessage('再想想空格原本是哪個字，也可以再看一次。')})},4000)}
}
function sequencePuzzle(){const p=endPuzzle;p.sequence=shuffled([0,1,2]);p.input=[];p.busy=true;
 $('#end-area').innerHTML='<div class="rune-options">'+p.words.map(endButton).join('')+'</div>';
 $('#end-tools').innerHTML='<button class="primary" id="sequence-start">播放閃光順序</button>';
 const play=()=>{if(p.playing)return;p.playing=true;p.busy=true;p.input=[];$('#sequence-start').disabled=true;document.querySelectorAll('[data-choice]').forEach(b=>{b.classList.remove('lit');b.disabled=true});endMessage('仔細看，記住亮起的先後順序。');p.sequence.forEach((k,n)=>{endLater(()=>{$('[data-choice="'+k+'"]').classList.add('lit')},n*1000+250);endLater(()=>{$('[data-choice="'+k+'"]').classList.remove('lit')},n*1000+950)});endLater(()=>{p.playing=false;p.busy=false;$('#sequence-start').disabled=false;$('#sequence-start').textContent='再看一次順序';document.querySelectorAll('[data-choice]').forEach(b=>b.disabled=false);endMessage('換你了！依剛才順序點選。')},3300)};
 $('#sequence-start').onclick=play;document.querySelectorAll('[data-choice]').forEach(b=>b.disabled=true);endMessage('先按「播放閃光順序」，看完再點生字。');
 document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{if(p.busy||p.done)return;const k=+b.dataset.choice;if(k!==p.sequence[p.input.length]){p.input=[];endMessage('順序不對，從第一個重新開始；可重播。');return}p.input.push(k);endMessage('正確！'+p.input.length+' / 3');if(p.input.length===3)finishEndPuzzle()})
}
function jigsawPuzzle(){const p=endPuzzle;p.word=p.words[0];p.pieces=shuffled([0,1,2,3]);p.selected=null;p.placed=[];
 const tile=k=>`<svg viewBox="${k%2*128} ${Math.floor(k/2)*128} 128 128" aria-hidden="true"><text x="128" y="204" text-anchor="middle" font-size="224" fill="currentColor" font-family="Noto Sans TC, sans-serif">${p.word.char}</text></svg>`;
 $('#end-area').innerHTML=`<div class="jigsaw-layout"><div><span class="puzzle-label">完整石碑</span><div class="jigsaw-target">${[0,1,2,3].map(k=>`<button class="jigsaw-slot" data-slot="${k}" aria-label="${['左上','右上','左下','右下'][k]}格">＋</button>`).join('')}</div></div><div><span class="puzzle-label">選一塊碎片</span><div class="jigsaw-pieces">${p.pieces.map(k=>`<button class="jigsaw-piece" data-piece="${k}" draggable="true" aria-label="碎片 ${p.pieces.indexOf(k)+1}">${tile(k)}</button>`).join('')}</div></div></div>`;
 $('#end-tools').innerHTML=`<button class="subtle" id="jigsaw-hint">查看完整字形</button><div class="jigsaw-reference" id="whole-word" hidden>${p.word.char}</div>`;$('#jigsaw-hint').onclick=()=>{$('#whole-word').hidden=!$('#whole-word').hidden;$('#jigsaw-hint').textContent=$('#whole-word').hidden?'查看完整字形':'收起完整字形'};
 const select=k=>{p.selected=k;endMessage('碎片已選好，請點左上、右上、左下或右下的空格。');document.querySelectorAll('[data-piece]').forEach(b=>b.classList.toggle('selected',+b.dataset.piece===k))};
 document.querySelectorAll('[data-piece]').forEach(b=>{b.onclick=()=>select(+b.dataset.piece);b.ondragstart=e=>{select(+b.dataset.piece);e.dataTransfer?.setData('text/plain',b.dataset.piece)}});
 const place=b=>{if(p.selected===null){endMessage('先點選一塊碎片，再點它應該放入的格子。');return}const k=+b.dataset.slot;if(p.selected!==k){endMessage('這塊的位置不對，看看字形再試一次。');return}b.innerHTML=tile(k);b.disabled=true;p.placed.push(k);const piece=$('[data-piece="'+k+'"]');piece.disabled=true;piece.classList.remove('selected');piece.style.visibility='hidden';p.selected=null;if(p.placed.length===4)finishEndPuzzle();else endMessage('修復成功！'+p.placed.length+' / 4 塊')};
 document.querySelectorAll('[data-slot]').forEach(b=>{b.onclick=()=>place(b);b.ondragover=e=>e.preventDefault();b.ondrop=e=>{e.preventDefault();if(!b.disabled)place(b)}})
}
