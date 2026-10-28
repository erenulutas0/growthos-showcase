// Competitor analysis page. Text nodes only (strict CSP, untrusted research text); widths via CSSOM.
const token=document.querySelector('meta[name="growthos-token"]').content;
const panel=document.getElementById('panel');let data=null,brand='all',tab=(location.hash.slice(1)||'insights'),adFilter='all';
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
const link=(label,url)=>{const a=el('a',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;};
const pill=(text,cls='')=>el('span',text,'pill '+cls);
const HOOK={STORY_EXCERPT:'Hikâyeden parça',STORY_CONFLICT_SUMMARY:'Çatışma özeti',GENRE_DISCOVERY:'Tür keşfi',POSTER_TITLE_CARD:'Afiş / başlık kartı',LONG_FORM_EPISODE:'Uzun video / bölüm',PRODUCT_FEATURE:'Ürün özelliği',OFFER_PRICE:'Fiyat / teklif',CREATOR_OR_REACTION:'Creator / tepki',WRITER_RECRUITMENT:'Yazar daveti',UNKNOWN:'Bilinmiyor'};
const OFFER={FREE_ACCESS:'Ücretsiz erişim',DAILY_NEW_CHAPTERS:'Her gün yeni bölüm',DISCOUNT:'İndirim',COINS_OR_BONUS:'Jeton / bonus',WRITER_EARNINGS:'Yazar kazancı',NONE_VISIBLE:'Görünür teklif yok'};
const STATUS={OBSERVED:['Reklam gözlendi','ok'],CHECKED_NO_MATCH:['Filtrede eşleşme yok','warn'],NOT_CHECKED:['Kontrol edilmedi','']};
const EVENT_CLS={LONG_RUNNING:'ok',LOCALIZED_VARIANT:'violet',LAUNCH_BURST:'warn',NEW_ADS:'accent',NEW_LANGUAGE:'info',NEW_HOOK:'info',LEFT_ACTIVE_LIST:'warn',CHECK_NO_MATCH:'',FIRST_READ:'',NOT_SEEN_IN_SAMPLE:''};
const KIND={AUDIENCE:'Kitle (AB)',MARKET_PRESENCE:'Pazar varlığı',LONG_RUNNING:'Uzun yaşayan reklam',LOCALIZED_VARIANT:'Yerelleştirme',LAUNCH_BURST:'Toplu başlangıç',GAP:'Boşluk'};
const CHECK={NO_MATCH_IN_CHECKED_FILTER:'kontrol edilen filtrede eşleşme yok',NO_VERIFIED_ADVERTISER_IN_KEYWORD_SAMPLE:'anahtar kelime örneğinde doğrulanmış reklamveren yok',NAME_USED_BY_THIRD_PARTIES:'ad başka sayfalarca kullanılıyor',PRODUCT_PAGES_ONLY:'reklamlar ürün sayfalarından'};
const GTR={ALL:'tüm cinsiyetler',WOMEN:'kadınlar',MEN:'erkekler'};
function audienceBox(x){const box=el('div',null,'aud');const tot=Object.values(x.byGender).reduce((a,b)=>a+b,0)||1;box.append(el('div',`AB kitlesi · ${x.euReach.toLocaleString('tr-TR')} hesap · %${Math.round((x.byGender.female??0)/tot*100)} kadın`,'aud-title'),el('div',`Hedefleme: ${GTR[x.targeting.gender]??x.targeting.gender}, ${x.targeting.ageRange}, ${x.targeting.location}`,'muted small'));const ages=Object.entries(x.byAge),max=Math.max(1,...ages.map(e=>e[1])),atot=ages.reduce((a,e)=>a+e[1],0)||1;const b=el('div',null,'bars');for(const [k,v] of ages){const r=el('div',null,'bar');const t=el('div',null,'track'),f=el('div',null,'fill');f.style.width=`${Math.round(v/max*100)}%`;t.append(f);r.append(el('span',k),t,el('span',`%${Math.round(v/atot*100)}`));b.append(r);}box.append(b,el('div','Ülkeler: '+x.topCountries.map(c=>`${c.country} ${c.n.toLocaleString('tr-TR')}`).join(' · '),'muted small'));return box;}
const brandName=b=>b==='kami'?'Kami':b==='surreel'?'Surreel':'—';
const lang=l=>({en:'İngilizce',pt:'Portekizce',tr:'Türkçe',es:'İspanyolca',de:'Almanca',fr:'Fransızca',ar:'Arapça'}[l]??l);
const dur=s=>s==null?null:s<60?`${s} sn`:`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')} dk`;
const keep=x=>brand==='all'||x.brand===brand;
function brandChip(b){if(b!=='kami'&&b!=='surreel')return pill('—');const c=el('span',null,'brand-chip');const img=el('img',null,b==='kami'?'k':'s');img.src=b==='kami'?'/growthos-showcase/brand-kami.png':'/growthos-showcase/brand-surreel.png';img.alt='';c.append(img,document.createTextNode(b==='kami'?'Kami':'Surreel'));return c;}

function kpis(){const k=document.getElementById('kpis');k.replaceChildren();const p=data.profiles.filter(keep),a=data.ads.filter(keep);
 for(const [v,t] of [[p.length,'takip edilen rakip'],[p.filter(x=>x.status==='OBSERVED').length,'rakibin reklamı gözlendi'],[a.length,'kayıtlı reklam (örneklem)'],[p.filter(x=>x.overdue).length,'haftalık kontrol bekliyor']]){const c=el('div',null,'kpi');c.append(el('b',String(v)),el('span',t));k.append(c);}}

function tabs(){const t=document.getElementById('tabs');t.replaceChildren();
 const list=[['insights','Öne çıkanlar',data.insights.filter(i=>!i.competitorId||keep(data.profiles.find(p=>p.id===i.competitorId)??{})).length],['ads','Reklamlar',data.ads.filter(keep).length],['activity','Etkinlik',data.events.filter(keep).length],['competitors','Rakipler',data.profiles.filter(keep).length],['patterns','Kalıplar',null],['how','Nasıl çalışır',null]];
 for(const [id,label,n] of list){const b=el('button',label);b.type='button';b.setAttribute('role','tab');b.setAttribute('aria-selected',String(tab===id));if(n!=null)b.append(el('span',String(n),'count'));b.onclick=()=>{tab=id;history.replaceState(null,'','#'+id);render();};t.append(b);}}

function insights(){const items=data.insights.filter(i=>!i.competitorId||keep(data.profiles.find(p=>p.id===i.competitorId)??{}));
 if(!items.length)return panel.append(el('p','Bu marka için öne çıkan bulgu yok.','empty'));
 panel.append(el('p','Kurallarla çıkarılan okumalar. Her biri hipotezdir; gücü ve örneklem büyüklüğü kartta yazar.','muted small'));
 const g=el('div',null,'grid g2');for(const i of items){const c=el('article',null,'card insight k-'+i.kind);const top=el('div',null,'spread');top.append(pill(KIND[i.kind]??i.kind),el('span','Güç: '+i.strength,'muted small'));c.append(top,el('h3',i.title),el('p',i.reading,'muted'));const a=el('div',null,'action');a.append(el('b','Ne yapabiliriz'),document.createTextNode(i.action));c.append(a);
  if(i.evidence.length){const r=el('p',null,'small');const b=el('button','Reklamı gör →');b.type='button';b.className='link';b.onclick=()=>{tab='ads';adFilter=i.competitorId;history.replaceState(null,'','#ads');render();};r.append(b);c.append(r);}g.append(c);}
 panel.append(g);}

function ads(){const list=data.ads.filter(keep).filter(a=>adFilter==='all'||a.competitorId===adFilter).sort((a,b)=>(b.runDaysAtLastSeen??-1)-(a.runDaysAtLastSeen??-1));
 const bar=el('div',null,'toolbar');const s=el('select');s.setAttribute('aria-label','Rakip');const o=el('option','Tüm rakipler');o.value='all';s.append(o);for(const p of data.profiles.filter(keep).filter(p=>p.adsObserved)){const x=el('option',`${p.name} (${p.adsObserved})`);x.value=p.id;s.append(x);}s.value=adFilter;s.onchange=()=>{adFilter=s.value;render();};bar.append(s,el('span','En uzun süredir yayında olan önce. Görseller saklanmaz; kaynağa gidip bakabilirsin.','muted small'));panel.append(bar);
 if(!list.length)return panel.append(el('p','Kayıtlı reklam yok.','empty'));
 const max=Math.max(90,...list.map(a=>a.runDaysAtLastSeen??0));const g=el('div',null,'grid g3');
 for(const a of list){const c=el('article',null,'card');const top=el('div',null,'spread');top.append(el('strong',a.advertiser),pill(a.library==='meta'?'Meta':'TikTok'));c.append(top);
  c.append(el('div',null,'chips'));c.lastChild.append(pill(HOOK[a.hook]??a.hook,'accent'),brandChip(a.brand));
  c.append(el('h3',a.note??(a.library==='tiktok'?'Kreatif açılmadı (yalnız kütüphane özeti)':'Not yok')));c.append(el('p',[a.format==='unknown'?'biçim bilinmiyor':a.format,dur(a.durationSeconds),a.language?lang(a.language):null].filter(Boolean).join(' · '),'ad-meta'));
  if(a.runDaysAtLastSeen!=null){const r=el('div',null,'run');const t=el('div',null,'track'),f=el('div',null,'fill');f.style.width=`${Math.min(100,Math.round(a.runDaysAtLastSeen/max*100))}%`;t.append(f);r.append(t,el('small',a.lastShownOn?`${a.runDaysAtLastSeen} gün gösterildi (son gösterim ${a.lastShownOn})`:`${a.runDaysAtLastSeen} gündür yayında (son görülme ${a.lastSeen})`));c.append(r);}
  if(a.reachRange){const ch=el('div',null,'chips');ch.append(pill('Tekil kullanıcı: '+a.reachRange,'violet'));if(a.objective)ch.append(pill({APP_PROMOTION:'Hedef: uygulama',SALES:'Hedef: satış',TRAFFIC:'Hedef: trafik',AWARENESS:'Hedef: bilinirlik'}[a.objective]??a.objective));c.append(ch);}
  if(a.offers.length){const ch=el('div',null,'chips');for(const x of a.offers)ch.append(pill(OFFER[x]??x,'info'));c.append(ch);}
  if(a.audience)c.append(audienceBox(a.audience));
  const foot=el('div',null,'ad-foot');foot.append(el('span',`Başlangıç ${a.startedOn??'?'} · kimlik ${a.adId}`),link('Kaynak ↗',a.sourceUrl));c.append(foot);g.append(c);}
 panel.append(g);}

function activity(){const list=data.events.filter(keep);if(!list.length)return panel.append(el('p','Etkinlik yok.','empty'));
 panel.append(el('p','Okumalar arasındaki değişimlerden üretilen olaylar; en yenisi önce.','muted small'));const t=el('div',null,'timeline');
 for(const e of list){const r=el('article',null,'event');r.append(el('time',e.day));const b=el('div');const h=el('div',null,'row');h.append(pill(e.label,EVENT_CLS[e.type]??''),el('strong',e.name),el('span',`${brandName(e.brand)} · ${e.library==='meta'?'Meta':'TikTok'}`,'muted small'));b.append(h);if(e.detail)b.append(el('h3',e.detail));b.append(el('p',e.reading,'muted'),el('p','→ '+e.action,'small'));r.append(b);t.append(r);}
 panel.append(t);}

function competitors(){const list=data.profiles.filter(keep).sort((a,b)=>({OBSERVED:0,CHECKED_NO_MATCH:1,NOT_CHECKED:2}[a.status]-{OBSERVED:0,CHECKED_NO_MATCH:1,NOT_CHECKED:2}[b.status])||a.name.localeCompare(b.name));
 const tbl=el('table');const head=el('tr');for(const h of ['Rakip','Marka','Durum','Reklam','Son okuma','Sonraki kontrol',''])head.append(el('th',h));const th=el('thead');th.append(head);const tb=el('tbody');
 for(const p of list){const tr=el('tr',null,p.status==='NOT_CHECKED'?'dim':'');const name=el('td');name.append(el('strong',p.name));if(!p.inWatchlist)name.append(el('div','izleme listesi dışında','muted small'));name.append(el('div',p.role,'muted small hide-sm'));
  const st=el('td');st.append(pill(...STATUS[p.status]));const bc=el('td');bc.append(brandChip(p.brand));tr.append(name,bc,st,el('td',String(p.adsObserved)),el('td',p.lastObserved??'—'),el('td',p.overdue?'şimdi':p.nextCheckDue));
  const btn=el('button','Ayrıntı');btn.type='button';btn.className='link';const bt=el('td');bt.append(btn);tr.append(bt);tb.append(tr);
  const d=el('tr',null,'detail');d.hidden=true;const td=el('td');td.colSpan=7;
  td.append(el('p','Doğrulanacak: '+(p.verify??'—')),el('p','Pazar: '+((p.region_focus??[]).join(', ')||'—')),el('p','Kanca karışımı: '+(Object.entries(p.hooks).map(([k,v])=>`${HOOK[k]??k} ${v}`).join(' · ')||'—')),p.audience.status==='COLLECTED'?el('p',`AB kitlesi (${p.audience.ads} reklam, ${p.audience.euReach.toLocaleString('tr-TR')} hesap): %${p.audience.femaleShare} kadın · 35 yaş altı %${p.audience.under35Share} · en büyük yaş grubu ${p.audience.topAgeBand} · hedefleme ${p.audience.targeting.join('; ')}`):el('p','AB yaş/cinsiyet erişimi: henüz toplanmadı','muted'));
  for(const m of (data.marketPresence??[]).filter(m=>m.competitorId===p.id))td.append(el('p',`${m.library==='tiktok'?'TikTok':'Meta'} · ${m.country==='TR'?'Türkiye':m.country} hedefli reklam (son 30 gün): ${m.totalResults.toLocaleString('tr-TR')}${m.topReach?' · en geniş erişim '+m.topReach:''}`));
  for(const c of p.checks)td.append(el('p',`${c.name}: ${CHECK[c.result]??c.result} — ${c.note}`,'muted small'));if(p.website){const r=el('p');r.append(link('Resmî site ↗',p.website));td.append(r);}
  d.append(td);tb.append(d);btn.onclick=()=>{d.hidden=!d.hidden;btn.textContent=d.hidden?'Ayrıntı':'Kapat';};}
 tbl.append(th,tb);panel.append(tbl);}

function bars(title,obj,names){const w=el('div');w.append(el('div',title,'section-title'));const entries=Object.entries(obj).sort((a,b)=>b[1]-a[1]);if(!entries.length){w.append(el('p','—','muted'));return w;}const max=Math.max(...entries.map(e=>e[1]));const b=el('div',null,'bars');
 for(const [k,v] of entries){const r=el('div',null,'bar');const t=el('div',null,'track'),f=el('div',null,'fill');f.style.width=`${Math.round(v/max*100)}%`;t.append(f);r.append(el('span',names?.[k]??k),t,el('span',String(v)));b.append(r);}w.append(b);return w;}
function patterns(){const g=el('div',null,'grid g2');for(const b of data.brands.filter(b=>brand==='all'||b.brand===brand)){const c=el('article',null,'card');c.append(el('h3',`${brandName(b.brand)} rakipleri · n=${b.n} reklam, ${b.competitorsWithAds} rakip`));
  c.append(bars('Kanca',b.hooks,HOOK),bars('Teklif',b.offers,OFFER),bars('Süre',b.durations),bars('Dil',b.languages,Object.fromEntries(Object.keys(b.languages).map(k=>[k,lang(k)]))));
  c.append(el('div','Örneklemde görülmeyen kancalar','section-title'));const ch=el('div',null,'chips');for(const h of b.notObserved)ch.append(pill(HOOK[h]??h));c.append(ch,el('p','Görülmemesi bir test fikridir; rakiplerin bunu hiç kullanmadığını göstermez.','note'));g.append(c);}
 panel.append(g);}

function how(){const c=el('article',null,'card');c.append(el('h3','Haftalık okuma ve rapor'));const ol=el('ol',null,'steps');
 for(const t of ['Rakibin aktif reklamlarını resmî kütüphanede aç: Meta Ad Library veya TikTok Commercial Content Library.','Şablonu doldur: docs/templates/ad-library-paste.example.txt — kimlik, başlangıç, biçim, süre, dil, kanca, teklif, kısa not.','İçe aktar: npm run competitor:import -- --file okuma.txt (önce --dry-run).','Tüm aktif listeyi yazdıysan coverage: ALL_VISIBLE_ACTIVE; ancak o zaman “listeden çıktı” olayı üretilir.','Rapor: npm run competitor:report → output/competitors/<gün>.md'])ol.append(el('li',t));c.append(ol);
 const l=el('article',null,'card');l.append(el('h3','Sınırlar ve kaynaklar'));const ul=el('ul');for(const x of data.caveats)ul.append(el('li',x));for(const s of data.sources)ul.append(el('li','Kaynak dosya: '+s,'muted small'));l.append(ul);const g=el('div',null,'grid g2');g.append(c,l);panel.append(g);}

function render(){if(!data)return;for(const b of document.querySelectorAll('[data-brand]'))b.setAttribute('aria-pressed',String(b.dataset.brand===brand));kpis();tabs();panel.replaceChildren();({insights,ads,activity,competitors,patterns,how}[tab]??insights)();}
window.addEventListener('hashchange',()=>{tab=location.hash.slice(1)||'insights';render();});
for(const b of document.querySelectorAll('[data-brand]'))b.onclick=()=>{brand=b.dataset.brand;adFilter='all';render();};
fetch('/growthos-showcase/api/competitor-analysis',{headers:{'X-GrowthOS-Token':token}}).then(async r=>{const b=await r.json();if(!r.ok)throw new Error(b.error?.message||'Analiz okunamadı');data=b;document.getElementById('meta').textContent=`${b.version} · ${b.today}`;render();}).catch(e=>{panel.replaceChildren(el('p',e.message,'error'));});
