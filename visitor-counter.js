(function(){
 'use strict';
 const element=document.getElementById('visitor-counter');
 if(!element)return;
 const endpoint=window.QUEST_VISITOR_COUNTER_URL;
 if(typeof endpoint!=='string'||!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint))return;
 const KEY='rune-quest-public-visitors-v1',MAX_AGE=24*60*60*1000;
 function valid(data){const age=Date.now()-Date.parse(data?.updatedAt);return data?.version===1&&Number.isSafeInteger(data.totalUsers)&&data.totalUsers>=0&&Number.isFinite(age)&&age>=-300000&&age<=MAX_AGE}
 function display(data){
  if(!valid(data))return false;
  document.getElementById('visitor-count').textContent=data.totalUsers.toLocaleString('zh-TW');
  const when=new Date(data.updatedAt).toLocaleString('zh-TW',{timeZone:'Asia/Taipei'});
  element.title='GA4 估計使用者人數（非即時在線人數）；更新時間：'+when+'（台灣時間）';
  document.getElementById('visitor-update-note').textContent=Date.now()-Date.parse(data.updatedAt)>2*60*60*1000?'最近統計資料':'約每小時更新';
  element.hidden=false;return true;
 }
 try{display(JSON.parse(localStorage.getItem(KEY)||'null'))}catch(e){}
 const script=document.createElement('script');let finished=false;
 function cleanup(){finished=true;clearTimeout(timer);script.remove();window.runeQuestVisitorCount=()=>{}}
 window.runeQuestVisitorCount=data=>{if(finished)return;if(display(data)){try{localStorage.setItem(KEY,JSON.stringify(data))}catch(e){}}cleanup()};
 script.src=endpoint;script.async=true;script.referrerPolicy='no-referrer';script.onerror=cleanup;
 const timer=setTimeout(cleanup,8000);document.head.appendChild(script);
})();
