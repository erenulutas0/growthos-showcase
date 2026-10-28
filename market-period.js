// Pure period comparison, shared with Node tests. Missing days are not zeros.
((host)=>{
const key=t=>t.normalize('NFKC').toLocaleLowerCase('tr').replace(/^#/,'').trim();
function compareMarketPeriod(history,{endDay,days=7,platform='all',region='all'}={}){
 if(![1,3,7,14,30,365].includes(days)||!/^\d{4}-\d{2}-\d{2}$/.test(endDay??''))throw Error('INVALID_PERIOD');
 const end=Date.parse(endDay+'T00:00:00Z');if(!Number.isFinite(end)||new Date(end).toISOString().slice(0,10)!==endDay)throw Error('INVALID_PERIOD');
 const calendar=Array.from({length:days},(_,i)=>new Date(end-(days-1-i)*86400000).toISOString().slice(0,10));
 const matches=r=>(platform==='all'||r.platform===platform)&&(region==='all'||(region==='OTHER'?/^[A-Z]{2}$/.test(r.region)&&r.region!=='TR':r.region===region));
 const rows=history.records.filter(r=>calendar.includes(r.day)&&matches(r));
 const seen=new Set(),dedup=rows.filter(r=>{const k=[r.day,r.platform,r.surface,r.region,key(r.title)].join('|');if(seen.has(k))return false;seen.add(k);return true;});
 const counts=calendar.map(day=>({day,records:dedup.some(r=>r.day===day)?dedup.filter(r=>r.day===day).length:null}));
 const groups=new Map();for(const r of dedup){const k=[r.platform,r.region,r.surface,r.method??'LEGACY_UNSPECIFIED',r.samplingPlanId??'LEGACY_UNSPECIFIED',key(r.title)].join('|');if(!groups.has(k))groups.set(k,{title:r.title,platform:r.platform,region:r.region,days:new Set()});groups.get(k).days.add(r.day);}
 const recurring=[...groups.values()].filter(g=>g.days.size>1).map(g=>({...g,days:[...g.days].sort()}));
 const cross=new Map();for(const r of dedup){if(r.region==='UNKNOWN')continue;const k=r.region+'|'+key(r.title);if(!cross.has(k))cross.set(k,{title:r.title,region:r.region,platforms:new Set(),days:new Set()});cross.get(k).platforms.add(r.platform);cross.get(k).days.add(r.day);}
 return {startDay:calendar[0],endDay,days,records:dedup.length,observedDays:counts.filter(d=>d.records!==null).length,counts,recurring,
  cross:[...cross.values()].filter(g=>g.platforms.size>1).map(g=>({...g,platforms:[...g.platforms],days:[...g.days]})),
  conclusion:counts.filter(d=>d.records!==null).length<2?'INSUFFICIENT_HISTORY':'DESCRIPTIVE_ONLY'};
}
host.compareMarketPeriod=compareMarketPeriod;
})(typeof window==='undefined'?globalThis:window);
