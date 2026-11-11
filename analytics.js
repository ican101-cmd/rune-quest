/* Basic GA4 usage counts only. No handwriting, mistakes, curriculum or user IDs. */
(function(){
 'use strict';
 const ID='G-XLCR3Q82P8',PREF='rune-quest-analytics-disabled';
 let disabled=false,started=new Set();
 try{disabled=localStorage.getItem(PREF)==='1'}catch(e){}
 const production=location.hostname==='ican101-cmd.github.io'&&location.pathname.startsWith('/rune-quest/');
 window.questAnalytics={enabled:!disabled,setEnabled(value){try{localStorage.setItem(PREF,value?'0':'1')}catch(e){return false}window['ga-disable-'+ID]=!value;location.reload();return true}};
 window.trackQuestEvent=function(name,details){
  if(!production||disabled||!['level_start','level_end'].includes(name))return;
  const level=Number(details?.level_id),type=details?.adventure_type,mode=details?.play_mode;
  if(!Number.isInteger(level)||level<1||level>7||!['chinese','bopomofo'].includes(type)||!['story','replay','final'].includes(mode))return;
  const params={adventure_type:type,level_id:level,play_mode:mode};
  if(name==='level_end')params.success=true;
  if(name==='level_start'){
   const key='rune-quest-analytics-start-'+type;let seen=started.has(type);
   try{seen=seen||sessionStorage.getItem(key)==='1';sessionStorage.setItem(key,'1')}catch(e){}
   started.add(type);if(!seen)gtag('event','game_start',{adventure_type:type});
  }
  gtag('event',name,params);
 };
 if(!production||disabled)return;
 window.dataLayer=window.dataLayer||[];
 function gtag(){window.dataLayer.push(arguments)}
 window.gtag=gtag;
 gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'granted'});
 gtag('js',new Date());
 gtag('config',ID,{allow_google_signals:false,allow_ad_personalization_signals:false,cookie_path:'/rune-quest/',cookie_expires:2592000,page_location:'https://ican101-cmd.github.io/rune-quest/',page_referrer:'',page_title:'字之勇者',send_page_view:true});
 const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+ID;document.head.appendChild(script);
})();
