"""Build educational Bopomofo pack from g0v/zh-stroke-data (MOE stroke data).
See curricula/BOPOMOFO-SOURCES.md for attribution and use conditions.
"""
import json, urllib.request, concurrent.futures
from pathlib import Path
GROUPS=['ㄅㄆㄇㄈㄉㄊ','ㄋㄌㄍㄎㄏㄐ','ㄑㄒㄓㄔㄕㄖ','ㄗㄘㄙㄧㄨㄩ','ㄚㄛㄜㄝㄞㄟ','ㄠㄡㄢㄣㄤㄥㄦ']
REVISION='26f12d65063cc97d2773b7777232277bfca5f563'
CONFUSABLES={c:[x for x in group if x!=c] for group in ['ㄅㄆ','ㄉㄌ','ㄇㄈ','ㄋㄎ','ㄐㄩ','ㄓㄗ','ㄔㄘ','ㄕㄙ','ㄛㄜ','ㄝㄟ','ㄞㄢ','ㄠㄙ','ㄡㄆ','ㄣㄥ'] for c in group}
ROOT=Path(__file__).resolve().parents[1]
def base36(n):
 s='';n=round(n)
 while n:s='0123456789abcdefghijklmnopqrstuvwxyz'[n%36]+s;n//=36
 return (s or '0').zfill(2)
def pair(p):return base36(p['x']/2)+base36(p['y']/2)
def fetch(c):
 url=f'https://raw.githubusercontent.com/g0v/zh-stroke-data/{REVISION}/json/{ord(c):04x}.json'
 raw=json.load(urllib.request.urlopen(url))
 tracks=[[[round(p['x']/8,2),round(p['y']/8,2)] for p in stroke['track']] for stroke in raw]
 outlines=[]
 for stroke in raw:
  parts=[]
  for p in stroke['outline']:
   t=p['type'];parts.append(t)
   if t in ['M','L']:parts.append(pair(p))
   elif t=='Q':parts.extend([pair(p['begin']),pair(p['end'])])
   elif t=='C':parts.extend([pair(p['begin']),pair(p['mid']),pair(p['end'])])
   elif t!='Z':raise ValueError(t)
  outlines.append(''.join(parts))
 return c,tracks,','.join(outlines)
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex: data=list(ex.map(fetch,''.join(GROUPS)))
tracks={c:t for c,t,o in data};outlines={c:o for c,t,o in data}
lessons=[{'id':i+1,'title':f'注音第{i+1}組：'+ ' '.join(g),'chars':[{'char':c,'zhuyin':'','count':len(tracks[c]),'kind':'s','confusables':CONFUSABLES.get(c,[])} for c in g]} for i,g in enumerate(GROUPS)]
pack={'sourceRevision':REVISION,'type':'bopomofo','rounds':2,'lessons':lessons,'tracks':tracks,'outlines':outlines}
(ROOT/'curricula/bopomofo.json').write_text(json.dumps(pack,ensure_ascii=False,separators=(',',':')))
print('37 symbols:',[(c,len(t)) for c,t,o in data])
