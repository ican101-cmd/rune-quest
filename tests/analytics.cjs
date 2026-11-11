const vm=require('vm'),fs=require('fs'),assert=require('assert');
const source=fs.readFileSync(require('path').join(__dirname,'../analytics.js'),'utf8');
function setup({host='ican101-cmd.github.io',disabled=false}={}){const added=[],prefs=new Map(disabled?[['rune-quest-analytics-disabled','1']]:[]),session=new Map();const c={window:{},location:{hostname:host,pathname:'/rune-quest/',reload(){}},localStorage:{getItem:k=>prefs.get(k),setItem:(k,v)=>prefs.set(k,v)},sessionStorage:{getItem:k=>session.get(k),setItem:(k,v)=>session.set(k,v)},document:{head:{appendChild:x=>added.push(x)},createElement:()=>({})}};vm.runInNewContext(source,c);return {c,added,prefs,events:()=>Array.from(c.window.dataLayer||[],x=>Array.from(x)).filter(x=>x[0]==='event')}}
const x=setup();assert.equal(x.added.length,1);assert(x.added[0].src.endsWith('G-XLCR3Q82P8'));
const config=Array.from(x.c.window.dataLayer).find(x=>x[0]==='config')[2];assert.equal(config.allow_google_signals,false);assert.equal(config.allow_ad_personalization_signals,false);assert.equal(config.page_referrer,'');
const send=x.c.window.trackQuestEvent;
send('level_start',{adventure_type:'chinese',level_id:1,play_mode:'story',word:'敏感字',name:'姓名'});send('level_start',{adventure_type:'chinese',level_id:2,play_mode:'story'});send('level_end',{adventure_type:'chinese',level_id:2,play_mode:'story'});send('level_start',{adventure_type:'bopomofo',level_id:1,play_mode:'replay'});
assert.equal(x.events().filter(e=>e[1]==='game_start').length,2);assert.equal(x.events().filter(e=>e[1]==='level_end').length,1);assert(!JSON.stringify(x.events()).includes('敏感字'));assert(!JSON.stringify(x.events()).includes('姓名'));
const before=x.events().length;send('private_event',{});send('level_end',{adventure_type:'chinese',level_id:99,play_mode:'story'});assert.equal(x.events().length,before);
for(const options of [{host:'localhost'},{disabled:true}]){const y=setup(options);y.c.window.trackQuestEvent('level_start',{adventure_type:'chinese',level_id:1,play_mode:'story'});assert.equal(y.added.length,0);assert.equal(y.events().length,0)}
x.c.window.questAnalytics.setEnabled(false);assert.equal(x.prefs.get('rune-quest-analytics-disabled'),'1');assert(x.c.window['ga-disable-G-XLCR3Q82P8']);
console.log('PASS: GA ID/config, no ad signals, basic event allowlist, one start per type/tab, no custom private fields, local/disabled exclusion');
