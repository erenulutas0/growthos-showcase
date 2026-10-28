// Daily ad-idea brief page. Text nodes only (strict CSP); data from /api/daily-brief.
const token=document.querySelector('meta[name="growthos-token"]').content;const root=document.getElementById('brief');let data=null,brand='all';
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
const link=(label,url)=>{const a=el('a',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;};
const pill=(text,cls='')=>el('span',text,'pill '+cls);
const TIER={REVIEW_TODAY:['Bugün incele','accent'],WATCH:['İzle','info'],ARCHIVE:['Arşiv','']};
const PATTERN={LONG_RUNNING_HOOK:'Uzun yaşayan kanca',AUDIENCE:'Kitle',ONE_STORY_MANY_CUTS:'Tek hikâye, çok kesim',WRITER_GAP:'Boşluk'};
const REASON={POLITICS:'Siyaset',TRAGEDY_OR_DISASTER:'Felaket/trajedi',RELIGION:'Din',ADVOCACY_OR_GOVERNMENT_CAMPAIGN:'Kampanya/kamu',SPORT:'Spor',REAL_PERSON:'Gerçek kişi',POSSIBLE_NEWS_EVENT:'Olası haber olayı',NO_COMMERCIAL_DAY:'Ticari olmayan gün',NO_CONTEXT:'Bağlam yok',PLACE_NO_CONTEXT:'Yer adı, olay bilinmiyor',ENTERTAINMENT_NO_CONTEXT:'Eğlence, bağlam yok',THIRD_PARTY_BRAND_OR_PLATFORM:'Başka marka/platform',TV_SERIES_SCHEDULE:'Dizi yayın duyurusu',RESEARCHER_CONTEXT_REVIEW:'Araştırmacı: bağlam',RESEARCHER_ADJACENT_CONTEXT:'Araştırmacı: komşu konu',RESEARCHER_LANGUAGE_CHECK:'Araştırmacı: dil kontrolü'};
const PART={fit:'uyum',crossPlatform:'çok platform',timing:'zamanlama',momentum:'ivme',novelty:'yenilik',ipOnly:'yalnız başka eser'};
const keep=x=>brand==='all'||x.brand===brand;
function brandChip(b){const c=el('span',null,'brand-chip');const img=el('img',null,b==='kami'?'k':'s');img.src=b==='kami'?'/growthos-showcase/brand-kami.png':'/growthos-showcase/brand-surreel.png';img.alt='';c.append(img,document.createTextNode(b==='kami'?'Kami':'Surreel'));return c;}
const line=(label,text)=>{const p=el('p',null,'meta-line');p.append(el('b',label+': '),document.createTextNode(text));return p;};
const ab=x=>x?.variants?x.variants.map(v=>v.id.toUpperCase()+' = '+v.label).join(' · '):null;

function trendIdea(i){const c=el('article',null,'card idea');const top=el('div',null,'top');const [t,cls]=TIER[i.tier];top.append(pill(t,cls),brandChip(i.brand),el('span','puan '+i.score,'score'));
 c.append(top,el('h3',i.title),el('blockquote',i.hookDraft,'quote'),line('Format',i.format));
 if(i.audience)c.append(line('Kitle hipotezi',i.audience.label));if(i.experiment)c.append(line('Deney',ab(i.experiment)));
 const d=el('details');d.append(el('summary','Neden bugün, kanıt ve dikkat'));const ul=el('ul');for(const w of i.whyNow)ul.append(el('li',w));d.append(ul);
 if(i.competitorNote)d.append(el('p',i.competitorNote,'muted small'));for(const e of i.competitorEvidence??[]){const p=el('p',e.advertiser+' · '+e.fact+' ','muted small');if(e.sourceUrl)p.append(link('kaynak ↗',e.sourceUrl));d.append(p);}
 if(i.audience?.basis)d.append(el('p','Kitle dayanağı: '+i.audience.basis,'muted small'));
 d.append(el('p','Puan: '+(Object.entries(i.scoreParts).filter(([,v])=>v).map(([k,v])=>`${PART[k]??k} ${v>0?'+':''}${v}`).join(' · ')||'0'),'muted small'));
 const cu=el('ul',null,'cautions');for(const w of i.cautions)cu.append(el('li',w));d.append(cu);c.append(d);return c;}

function competitorIdea(i){const c=el('article',null,'card idea');const top=el('div',null,'top');top.append(pill(PATTERN[i.pattern]??i.pattern,'violet'),brandChip(i.brand),el('span','güç: '+i.strength,'score'));
 c.append(top,el('h3',i.title),el('blockquote',i.hookDraft,'quote'),line('Format',i.format),line('Kitle hipotezi',i.audience.label),line('Deney',ab(i.experiment)),el('p',i.why,'muted small'));
 const d=el('details');d.append(el('summary','Rakip kanıtı ve başlatmak için gerekenler'));for(const e of i.evidence){const p=el('p',e.advertiser+' · '+e.fact+' ','muted small');if(e.sourceUrl)p.append(link('kaynak ↗',e.sourceUrl));d.append(p);}
 if(i.audience.basis)d.append(el('p','Kitle dayanağı: '+i.audience.basis,'muted small'));d.append(el('p','Güç notu: '+i.strengthNote,'muted small'));
 const ul=el('ul');for(const x of i.experiment.needs)ul.append(el('li',x));d.append(el('div','Deneyi başlatmak için','section-title'),ul);const cu=el('ul',null,'cautions');for(const x of i.cautions)cu.append(el('li',x));d.append(cu);c.append(d);return c;}

function section(title,count,note){const h=el('div',null,'section-h');h.append(el('h2',title),el('span',String(count),'count'),...(note?[el('span',note,'muted small')]:[]));return h;}

function render(){if(!data)return;const b=data;for(const x of document.querySelectorAll('[data-brand]'))x.setAttribute('aria-pressed',String(x.dataset.brand===brand));
 const ideas=b.ideas.filter(keep),cmp=(b.competitorIdeas??[]).filter(keep);
 const k=document.getElementById('kpis');k.replaceChildren();for(const [v,t] of [[ideas.filter(i=>i.tier!=='ARCHIVE').length,'gündem fikri'],[ideas.filter(i=>i.tier==='REVIEW_TODAY').length,'bugün incelenecek'],[cmp.length,'rakipten öğrenilen fikir'],[b.counts.excluded,'riskli sinyal elendi']]){const c=el('div',null,'kpi');c.append(el('b',String(v)),el('span',t));k.append(c);}
 root.replaceChildren();
 if(b.calendar.length){const cal=el('div',null,'cal');for(const d of b.calendar){const c=el('div',null,'cal-day '+(d.mode==='NO_COMMERCIAL'?'stop':''));c.append(el('b',d.name),el('span',`${d.daysUntil} gün sonra · ${d.date}`),el('small',d.tone));cal.append(c);}root.append(cal);}
 for(const tier of ['REVIEW_TODAY','WATCH']){const list=ideas.filter(i=>i.tier===tier);if(!list.length)continue;root.append(section(TIER[tier][0],list.length,tier==='WATCH'?'zamanlaması ve uyumu iyi; ek sinyal bekler':null));const g=el('div',null,'grid g2');for(const i of list)g.append(trendIdea(i));root.append(g);}
 if(cmp.length){root.append(section('Rakipten öğrenilen fikirler',cmp.length,`${b.competitorBasis.ads} rakip reklamından; yalnız yapı alınır, hikâye kopyalanmaz`));const g=el('div',null,'grid g2');for(const i of cmp)g.append(competitorIdea(i));root.append(g);}
 const more=el('div',null,'grid g2 more');
 const arch=ideas.filter(i=>i.tier==='ARCHIVE');if(arch.length){const d=el('details',null,'card');d.append(el('summary',`Arşiv · ${arch.length} zayıf fikir`));for(const i of arch)d.append(el('p',`${i.title} — puan ${i.score}`,'muted small'));more.append(d);}
 const ctx=el('details',null,'card');ctx.append(el('summary',`Bağlam bekleyen başlıklar · ${b.contextReview.length}`));const cl=el('ul');for(const c of b.contextReview)cl.append(el('li',`${c.title} (${c.platform}) · ${REASON[c.reason]??c.reason}${c.researcherNote?' · '+c.researcherNote:''}`));ctx.append(cl);more.append(ctx);
 const ex=el('details',null,'card');ex.append(el('summary',`Elenenler · ${b.counts.excluded}`));const xl=el('ul');for(const [r,v] of Object.entries(b.excluded.byReason))xl.append(el('li',`${REASON[r]??r}: ${v}`));ex.append(xl,el('p','Bu konular reklam fikrine dönüştürülmez.','muted small'));more.append(ex);
 const lim=el('details',null,'card');lim.append(el('summary','Kaynaklar ve sınırlar'));const sl=el('ul');for(const s of b.sources){const li=el('li',`${s.file} · ${s.signals} sinyal `);for(const u of s.sourceUrls)li.append(link('↗',u),document.createTextNode(' '));sl.append(li);}for(const l of b.limitations)sl.append(el('li',l));lim.append(sl);more.append(lim);
 root.append(section('Ayrıntılar',4),more);
 document.getElementById('meta').textContent=`${b.day} · ${b.counts.signals} sinyal · ${b.rulesVersion} · ${b.novelty==='NO_HISTORY_FIRST_BRIEF'?'ilk brifing':'önceki günlerle karşılaştırıldı'} · model çalıştırılmadı`;}
for(const x of document.querySelectorAll('[data-brand]'))x.onclick=()=>{brand=x.dataset.brand;render();};
fetch('/growthos-showcase/api/daily-brief',{headers:{'X-GrowthOS-Token':token}}).then(async r=>{const b=await r.json();if(!r.ok)throw new Error(b.error?.message||'Brifing okunamadı');data=b;render();}).catch(e=>{root.replaceChildren(el('p',e.message,'error'));});
