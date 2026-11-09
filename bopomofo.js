'use strict';
const BOPOMOFO_GROUPS=['ㄅㄆㄇㄈㄉㄊ','ㄋㄌㄍㄎㄏㄐ','ㄑㄒㄓㄔㄕㄖ','ㄗㄘㄙㄧㄨㄩ','ㄚㄛㄜㄝㄞㄟ','ㄠㄡㄢㄣㄤㄥㄦ'];
window.QUEST_CATALOG.books.push({id:'bopomofo',publisher:'z',publisherName:'注音冒險',grade:1,file:'curricula/bopomofo.json',lessons:BOPOMOFO_GROUPS.map((g,i)=>({id:i+1,title:'注音第 '+(i+1)+' 組',count:g.length,preview:g}))});
function renderBopomofoParent(){
 cleanup();active=null;screen='parent';setNav('');const generation=++parentGeneration;
 let mode=savedPlan()?.mode==='challenge'?'challenge':'beginner',busy=false;
 const plan=()=>({book:'bopomofo',lessons:[1,2,3,4,5,6],mode});
 APP.innerHTML=`<section class="parent-setup bopomofo-setup"><div class="parent-welcome"><span class="tag">一年級入門 · 共用注音題庫</span><h1>注音冒險</h1><p>37 個符號，六個關卡。每個符號練兩輪：<br>第一輪跟著提示寫，第二輪自己試試看。寫完就能攻擊怪物！</p></div><div class="parent-layout"><section class="card parent-picker"><label class="bopomofo-mode-label" for="bopomofo-mode">選擇練習模式</label><select id="bopomofo-mode"><option value="beginner" ${mode==='beginner'?'selected':''}>初學模式 · 寫錯先提示，不扣 HP</option><option value="challenge" ${mode==='challenge'?'selected':''}>挑戰模式 · 寫錯一筆扣 20 HP</option></select><p class="parent-instruction">兩種模式分開保存進度，可以先安心練習，再挑戰自己。</p><div class="bopomofo-groups">${BOPOMOFO_GROUPS.map((g,i)=>`<div class="bopomofo-group"><span>第 ${i+1} 關 · ${regions[i]}</span><strong>${[...g].join(' ')}</strong><small>${g.length} 個符號 × 2 輪，共 ${g.length*2} 次書寫</small></div>`).join('')}</div></section><aside class="card parent-plan"><h2>準備出發</h2><p>共 37 個符號、74 次書寫。<br>解謎不需要聲音，答錯可以重試。</p><p>收齊水晶後，魔龍會優先考曾寫錯的符號，至少考 10 個。</p><button class="primary" id="parent-start">開始注音冒險 →</button><p id="parent-status" role="status"></p><button class="subtle" id="bopomofo-back">改選國語生字題庫</button>${adventureReady?'<button class="subtle" id="parent-cancel">返回目前冒險</button>':''}<details class="parent-reset"><summary>重新挑戰與重置</summary><p>只影響目前選擇的注音模式，國語生字冒險會保留。</p><button class="subtle" id="parent-retry">重玩注音・保留金幣與物品</button><button class="subtle reset-danger" id="parent-reset-all">完整重置注音冒險</button></details></aside></div><div class="parent-mobile-actions"><span>37 個符號 · 六關</span><button class="primary" id="parent-start-mobile">開始注音冒險 →</button></div></section>`;
 const draw=()=>{let saved=null;try{saved=JSON.parse(localStorage.getItem(campaignKey(plan()))||'null')}catch(e){}const hasSave=!!saved?.progress;$('#parent-start').textContent=$('#parent-start-mobile').textContent=hasSave?'接續注音冒險 →':'開始注音冒險 →';$('#parent-retry').disabled=$('#parent-reset-all').disabled=!hasSave;$('#parent-status').textContent=hasSave?'已完成 '+saved.progress.reduce((a,b)=>a+b,0)+' / 74 次書寫。':'將建立新的注音冒險，其他題庫進度會保留。'};
 $('#bopomofo-mode').onchange=e=>{if(!busy){mode=e.target.value;draw()}};
 $('#bopomofo-back').onclick=()=>{if(!busy)renderParent(true)};
 if($('#parent-cancel'))$('#parent-cancel').onclick=()=>{if(!busy){++parentGeneration;renderMap()}};
 $('#parent-retry').onclick=()=>{if(!busy)confirmCampaignReset(plan(),true,draw)};
 $('#parent-reset-all').onclick=()=>{if(!busy)confirmCampaignReset(plan(),false,draw)};
 $('#parent-start').onclick=async()=>{
  if(busy)return;busy=true;document.querySelectorAll('.parent-setup button,.parent-setup select').forEach(b=>b.disabled=true);$('#parent-status').textContent='正在準備注音筆順…';
  try{let pack=packCache.get('bopomofo');if(!pack){const response=await fetch('curricula/bopomofo.json?v=1');if(!response.ok)throw Error('注音下載失敗');pack=await response.json();if(pack.lessons.length!==6||pack.lessons.some(l=>l.chars.some(c=>!pack.tracks[c.char]?.length||!pack.outlines[c.char])))throw Error('注音筆順不完整');packCache.set('bopomofo',pack)}
   if(generation!==parentGeneration||screen!=='parent')return;
   const selected=canonicalPlan(plan());localStorage.setItem(PARENT_KEY,JSON.stringify(selected));D={...pack,plan:selected,label:'注音冒險・'+(mode==='beginner'?'初學模式':'挑戰模式')};KEY=campaignKey(selected);loadAdventure();adventureReady=true;viewLesson=0;reviewKind='s';equipmentPreview=null;renderMap();
  }catch(e){if(generation!==parentGeneration||screen!=='parent')return;busy=false;document.querySelectorAll('.parent-setup button,.parent-setup select').forEach(b=>b.disabled=false);draw();$('#parent-status').textContent='無法準備注音題庫，請檢查網路或儲存空間後再試。原有進度仍保留。'}
 };$('#parent-start-mobile').onclick=()=>$('#parent-start').onclick();draw();
}
