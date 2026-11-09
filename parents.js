'use strict';
const BASE_QUEST=window.QUEST_DATA,PARENT_KEY='rune-quest-parent-v1';
let parentGeneration=0,adventureReady=false;
const packCache=new Map();
function escaped(text){return String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function canonicalPlan(plan){const book=window.QUEST_CATALOG.books.find(b=>b.id===plan?.book);if(!book||!Array.isArray(plan.lessons)||plan.lessons.length!==6||new Set(plan.lessons).size!==6||plan.lessons.some(id=>!book.lessons.some(l=>l.id===id)))return null;return {book:book.id,lessons:[...plan.lessons].sort((a,b)=>a-b),...(book.id==='bopomofo'?{mode:plan.mode==='challenge'?'challenge':'beginner'}:{})}}
function campaignKey(plan){if(plan.book==='bopomofo')return 'rune-quest-bopomofo-v1-'+(plan.mode==='challenge'?'challenge':'beginner');return plan.book==='h-2-up'&&plan.lessons.join(',')==='1,2,3,4,5,6'?'rune-quest-v1':'rune-quest-plan-'+window.QUEST_CATALOG.snapshot+'-'+plan.book+'-'+plan.lessons.join('-')}
function savedPlan(){try{return canonicalPlan(JSON.parse(localStorage.getItem(PARENT_KEY)||'null'))}catch(e){return null}}
function renderParent(forceChinese=false){
 if(!forceChinese&&savedPlan()?.book==='bopomofo'){renderBopomofoParent();return}
 cleanup();active=null;screen='parent';setNav('');const generation=++parentGeneration;
 const previous=(savedPlan()?.book!=='bopomofo'?savedPlan():null)||{book:'h-2-up',lessons:[1,2,3,4,5,6]};let book=window.QUEST_CATALOG.books.find(b=>b.id===previous.book),selected=[...previous.lessons],busy=false;
 APP.innerHTML=`<section class="parent-setup"><div class="parent-welcome"><span class="tag">PARENT SETUP · 家長模式</span><h1>替小勇者，選好這次冒險。</h1><p>選擇課本版本與年級，再挑選六課。<br>每課是一個關卡，寫字打怪、解謎後取得水晶。</p></div><button class="primary" id="choose-bopomofo">一年級入門 · 注音冒險（37 個符號） →</button><div class="parent-layout"><section class="card parent-picker"><div class="parent-filters"><label>① 課本版本<select id="parent-publisher">${[['n','南一版'],['k','康軒版'],['h','翰林版']].map(([v,n])=>`<option value="${v}" ${book.publisher===v?'selected':''}>${n}</option>`).join('')}</select></label><label>② 年級<select id="parent-grade">${[1,2,3,4,5,6].map(g=>`<option value="${g}" ${book.grade===g?'selected':''}>${g} 年級</option>`).join('')}</select></label><div class="parent-semester">上學期<span>目前提供上學期課程</span></div></div><div class="parent-picker-title"><h2>③ 選擇六課</h2><div><button class="subtle" id="parent-first">選前六課</button><button class="subtle" id="parent-clear">取消全部選課</button></div></div><p class="parent-instruction">依課次順序對應六關；點選課名可加入或取消。</p><div id="parent-lessons"></div></section><aside class="card parent-plan"><span class="tag">YOUR SIX CHAPTERS</span><h2>這次的冒險</h2><p id="parent-count" role="status"></p><ol id="parent-route"></ol><p id="parent-total"></p><div id="parent-save-note"></div><button class="primary" id="parent-start">開始冒險 →</button>${adventureReady?'<button class="subtle" id="parent-cancel">返回目前冒險</button>':''}<p id="parent-status" role="status"></p><details class="parent-reset"><summary>重新挑戰與重置</summary><p>只影響目前選取的六課，其他選課的存檔不變。</p><button class="subtle" id="parent-retry">重玩六課・保留金幣與物品</button><button class="subtle reset-danger" id="parent-reset-all">完整重置這六課</button><small id="parent-reset-note"></small></details><p class="parent-storage-note">不同選課分開保存進度、金幣與裝備。選回同一組六課，就能接續原本的冒險。</p></aside></div><div class="parent-mobile-actions"><span id="parent-mobile-count"></span><button class="primary" id="parent-start-mobile">開始冒險 →</button></div></section>`;
 $('#choose-bopomofo').onclick=renderBopomofoParent;
 const draw=()=>{
 selected.sort((a,b)=>a-b);
 $('#parent-lessons').innerHTML=book.lessons.map(l=>`<button class="parent-lesson ${selected.includes(l.id)?'chosen':''}" data-lesson-id="${l.id}" aria-pressed="${selected.includes(l.id)}"><span class="parent-checkbox">${selected.includes(l.id)?'✓':'＋'}</span><span><b>${escaped(l.title)}</b><small>${l.count} 個必寫生字 · ${escaped(l.preview.slice(0,8))}…</small></span></button>`).join('');
 $('#parent-count').textContent='已選 '+selected.length+' / 6 課'+(selected.length<6?'，還要選 '+(6-selected.length)+' 課':'，可以出發！');$('#parent-route').innerHTML=Array.from({length:6},(_,i)=>{const l=book.lessons.find(l=>l.id===selected[i]);return `<li><span>0${i+1}</span><div><b>${regions[i]}</b><small>${l?escaped(l.title):'尚未選課'}</small></div></li>`}).join('');
 $('#parent-total').textContent='共 '+selected.reduce((n,id)=>n+book.lessons.find(l=>l.id===id).count,0)+' 個必寫生字';$('#parent-start').disabled=selected.length!==6||busy;
 let saved=null;try{if(selected.length===6)saved=JSON.parse(localStorage.getItem(campaignKey({book:book.id,lessons:selected}))||'null')}catch(e){}
 $('#parent-retry').disabled=$('#parent-reset-all').disabled=busy||selected.length!==6||!saved?.progress;$('#parent-reset-note').textContent=selected.length!==6?'請先選滿六課。':!saved?.progress?'這組選課尚無進度可重置。':'重置前會再次確認。';
 $('#parent-save-note').textContent=saved?.progress?'已有紀錄：完成 '+saved.progress.reduce((a,b)=>a+b,0)+' 字，選定後接續。':'建立這組六課的冒險，其他選課進度會保留。';$('#parent-start').textContent=saved?.progress?'接續這組冒險 →':'選定六課，開始冒險 →';
 $('#parent-mobile-count').textContent='已選 '+selected.length+' / 6 課';$('#parent-start-mobile').disabled=$('#parent-start').disabled;$('#parent-start-mobile').textContent=saved?.progress?'接續冒險 →':'開始冒險 →';
 document.querySelectorAll('[data-lesson-id]').forEach(b=>b.onclick=()=>{if(busy)return;const id=+b.dataset.lessonId;if(selected.includes(id))selected=selected.filter(x=>x!==id);else if(selected.length<6)selected.push(id);else{$('#parent-status').textContent='最多選六課，請先取消一課再加入。';toast('已選滿六課，請先取消一課再加入。');return}$('#parent-status').textContent='';draw()})
 };
 $('#parent-retry').onclick=()=>{if(!busy)confirmCampaignReset({book:book.id,lessons:[...selected]},true,draw)};$('#parent-reset-all').onclick=()=>{if(!busy)confirmCampaignReset({book:book.id,lessons:[...selected]},false,draw)};
 const change=()=>{if(busy)return;book=window.QUEST_CATALOG.books.find(b=>b.publisher===$('#parent-publisher').value&&b.grade===+$('#parent-grade').value);selected=[];$('#parent-status').textContent='';draw()};$('#parent-publisher').onchange=change;$('#parent-grade').onchange=change;$('#parent-clear').onclick=()=>{if(!busy){selected=[];draw()}};$('#parent-first').onclick=()=>{if(!busy){selected=book.lessons.slice(0,6).map(l=>l.id);draw()}};
 if($('#parent-cancel'))$('#parent-cancel').onclick=()=>{if(!busy){++parentGeneration;renderMap()}};
 $('#parent-start').onclick=async()=>{
 const plan=canonicalPlan({book:book.id,lessons:selected});if(!plan||busy)return;busy=true;document.querySelectorAll('.parent-setup button,.parent-setup select').forEach(b=>b.disabled=true);$('#parent-status').textContent='正在準備生字與筆順…';$('#parent-start').textContent=$('#parent-start-mobile').textContent='準備字庫中…';
 try{
 let data;if(campaignKey(plan)==='rune-quest-v1')data=BASE_QUEST;else{let pack=packCache.get(book.id);if(!pack){const response=await fetch(book.file+'?v='+window.QUEST_CATALOG.snapshot);if(!response.ok)throw Error('字庫下載失敗');pack=await response.json();packCache.set(book.id,pack)}const lessons=plan.lessons.map((id,i)=>{const l=pack.lessons.find(l=>l.id===id);if(!l||Q.required(l).length<5||l.chars.some(c=>!pack.tracks[c.char]?.length||!pack.outlines[c.char]))throw Error('課程筆順資料不完整');return {...l,sourceId:l.id,id:i+1}});data={...pack,lessons}}
 if(generation!==parentGeneration||screen!=='parent')return;
 const candidate={...data,label:book.publisherName+'・'+book.grade+' 年級上學期',plan};
 // Persist configuration before switching; failure leaves the existing adventure intact.
 localStorage.setItem(PARENT_KEY,JSON.stringify(plan));D=candidate;KEY=campaignKey(plan);loadAdventure();adventureReady=true;viewLesson=0;reviewKind='s';equipmentPreview=null;renderMap();
 }catch(e){if(generation!==parentGeneration||screen!=='parent')return;busy=false;document.querySelectorAll('.parent-setup button,.parent-setup select').forEach(b=>b.disabled=false);draw();$('#parent-status').textContent='無法準備這組課程，請檢查網路及瀏覽器儲存空間後重試。原有進度仍保留。'}
 };$('#parent-start-mobile').onclick=()=>$('#parent-start').onclick();draw();
}

function confirmCampaignReset(rawPlan,keepEquipment,refresh){
 const plan=canonicalPlan(rawPlan);if(!plan||screen!=='parent')return;
 const key=campaignKey(plan),book=window.QUEST_CATALOG.books.find(b=>b.id===plan.book);let snapshot,previous;
 try{snapshot=localStorage.getItem(key);previous=JSON.parse(snapshot||'null');if(!previous||previous.version!==1||!Array.isArray(previous.progress))throw Error()}catch(e){$('#parent-status').textContent='無法讀取這組選課的進度，尚未變更任何資料。';return}
 const next=defaults();next.campaignId=key;next.sound=previous.sound!==false;next.ghost=previous.ghost!==false;
 if(keepEquipment){next.coins=Number.isFinite(previous.coins)?Math.max(0,previous.coins):0;next.owned=['ember',...(Array.isArray(previous.owned)?previous.owned.filter(x=>['forest','night'].includes(x)):[])];next.equipped=next.owned.includes(previous.equipped)?previous.equipped:'ember';normalizeGear(next,previous);normalizeItems(next,previous);next.retryLimits={}}
 let applied=false;const generation=parentGeneration;
 modal(`<h2>${keepEquipment?'重新挑戰這六課？':'完整重置這六課？'}</h2><p class="reset-scope"><strong>${escaped(book.publisherName)} · ${book.id==='bopomofo'?(plan.mode==='challenge'?'挑戰模式':'初學模式'):book.grade+' 年級上學期'}</strong><br>${plan.lessons.map(id=>escaped(book.lessons.find(l=>l.id===id).title)).join('、')}</p><p>將清除這六課的關卡進度、水晶、解謎、生字熟練與錯誤紀錄，以及魔龍決戰進度。</p><p>${keepEquipment?'保留 '+next.coins+' 金幣、背包道具、已擁有與穿戴中的裝備。':'金幣與背包道具歸零，裝備回到初始狀態。'}<br>其他選課的進度不受影響。此操作無法復原。</p><label class="reset-confirm-label"><input type="checkbox" id="reset-understood">我確認要重置以上六課</label><p id="reset-error" role="status"></p><div class="modal-actions"><button class="subtle" id="reset-cancel">取消</button><button class="primary" id="reset-confirm" disabled>確認${keepEquipment?'重新挑戰':'完整重置'}</button></div>`,{'reset-cancel':closeModal});
 $('#reset-understood').onchange=()=>{$('#reset-confirm').disabled=!$('#reset-understood').checked};
 $('#reset-confirm').onclick=()=>{
 if(applied||!$('#reset-understood').checked||screen!=='parent'||generation!==parentGeneration)return;
 try{if(localStorage.getItem(key)!==snapshot){$('#reset-error').textContent='進度已在其他地方變更，請取消並重新開啟確認視窗。';return}localStorage.setItem(key,JSON.stringify(next))}catch(e){$('#reset-error').textContent='無法儲存重置結果，原有進度未變更，請檢查瀏覽器儲存空間後重試。';return}
 applied=true;if(KEY===key){loadAdventure();equipmentPreview=null;viewLesson=0;if($('#coins'))$('#coins').textContent=state.coins}
 closeModal();refresh();$('#parent-status').textContent=keepEquipment?'這六課已重新開始，金幣與裝備已保留。按「接續這組冒險」即可出發。':'這六課已完整重置。按「接續這組冒險」即可重新出發。';$('#parent-start').focus();
 };
}
