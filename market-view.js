const marketAssetBase=new URL('.',document.currentScript.src);
window.renderMarketHistory=(data,en=false)=>{
 const history=data.marketHistory,el=(tag,text)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;return n;};
 const root=el('section');root.append(el('h1',en?'Markets and recorded history':'Ülkeler ve kayıtlı gündem'));
 root.append(el('p',en?'Sampled observations, not full timelines. Country labels, languages and ad reach are different evidence.':'Örneklenen gözlemler; tüm timeline değil. Ülke etiketi, içerik dili ve reklam erişimi farklı kanıtlardır.'));
 const controls=el('div');controls.className='en-controls';
 const select=(label,options)=>{const l=el('label',label+' '),s=el('select');s.setAttribute('aria-label',label);for(const [value,text] of options){const o=el('option',text);o.value=value;s.append(o);}l.append(s);controls.append(l);return s;};
 const platform=select(en?'Platform':'Platform',[['all','X + TikTok'],['x','X'],['tiktok','TikTok']]);
 const planned=history.markets??[{code:'TR',tr:'Türkiye',en:'Türkiye'}];
 const flagTitle=(tag,text,code)=>{const n=el(tag);n.className='market-flag-title';if(['TR','US','AT','DE','AZ'].includes(code)){const img=el('img');img.src=new URL('flags/'+code.toLowerCase()+'.svg',marketAssetBase).href;img.alt='';img.className='market-flag';n.append(img);}n.append(document.createTextNode(text));return n;};
 const region=select(en?'Market':'Ülke',[['all',en?'All scopes':'Tüm kapsamlar'],['GLOBAL',en?'Global':'Global'],...planned.map(m=>[m.code,en?m.en:m.tr]),['OTHER',en?'Other countries (outside Türkiye)':'Diğer ülkeler (Türkiye dışı)'],['UNKNOWN',en?'Country unknown':'Ülke belirsiz'],...[...new Set(history.records.map(r=>r.region))].filter(r=>!planned.some(m=>m.code===r)&&/^[A-Z]{2}$/.test(r)).map(r=>[r,r])]);
 const period=select(en?'Period':'Dönem',[[1,en?'1 day':'1 gün'],[3,en?'3 days':'3 gün'],[7,en?'7 days':'7 gün'],[14,en?'2 weeks':'2 hafta'],[30,en?'30 days':'30 gün'],[365,en?'365 days':'365 gün']]);period.value='7';
 const label=el('label',en?'Ending on ':'Bitiş günü '),date=el('input');date.type='date';date.value=history.latestDay??'';date.setAttribute('aria-label',en?'Ending on':'Bitiş günü');label.append(date);controls.append(label);root.append(controls);
 const flagBar=el('div');flagBar.className='market-flags';flagBar.setAttribute('role','group');flagBar.setAttribute('aria-label',en?'Quick market selection':'Hızlı ülke seçimi');
 const buttons=[];for(const m of [{code:'GLOBAL',tr:'🌐 Global',en:'🌐 Global'},...planned,{code:'UNKNOWN',tr:'? Belirsiz',en:'? Unknown'}]){const b=flagTitle('button',en?m.en:m.tr,m.code);b.type='button';b.onclick=()=>{region.value=m.code;render();};buttons.push([b,m.code]);flagBar.append(b);}root.append(flagBar);
 const result=el('div');root.append(result);
 function render(){
  result.replaceChildren();let report;try{report=window.compareMarketPeriod(history,{endDay:date.value,days:Number(period.value),platform:platform.value,region:region.value});}catch{result.append(el('p',en?'Choose a valid date.':'Geçerli bir tarih seç.'));return;}
  for(const [button,code] of buttons)button.setAttribute('aria-pressed',String(code===region.value));
  result.append(el('h2',report.startDay+' → '+report.endDay),el('p',en?`${report.observedDays}/${report.days} days observed · ${report.records} sampled topic records`:`${report.observedDays}/${report.days} gün gözlem var · ${report.records} örnek konu kaydı`));
  result.append(el('p',en?'An unobserved day is missing data, not zero interest. The latest record is '+history.latestDay+'.':'Gözlem olmayan gün eksik veridir; sıfır ilgi değildir. En son kayıt: '+history.latestDay+'.'));
  result.append(el('p',report.conclusion==='INSUFFICIENT_HISTORY'?(en?'Insufficient history for change analysis.':'Değişim analizi için yeterli günlük geçmiş yok.'):(en?'Descriptive comparison only; sampling differences prevent volume or growth claims.':'Yalnız betimleyici karşılaştırma; farklı örneklem büyüklükleri hacim veya büyüme kanıtı değildir.')));
  const outcomes=(history.readOutcomes??[]).filter(r=>r.day>=report.startDay&&r.day<=report.endDay&&(platform.value==='all'||platform.value==='tiktok')&&(region.value==='all'||(region.value==='OTHER'?r.country!=='TR':r.country===region.value)));
  if(outcomes.length){result.append(el('h2',en?'Latest country checks':'Son ülke kontrolleri'));for(const r of outcomes){
   const c=el('article');c.className='card';const market=planned.find(m=>m.code===r.country);
   c.append(flagTitle('h3',(market?(en?market.en:market.tr):r.country)+' · '+(r.status==='FILTER_CONFIRMED'?(en?'Sample recorded':'Örnek kaydedildi'):(en?'Country filter not applied':'Ülke filtresi uygulanmadı')),r.country));
   c.append(el('p',en?r.noteEn:r.noteTr));
   for(const row of r.rows)c.append(el('p',row.title+' · '+row.metric));
   if(r.editorialReview)c.append(el('p',(en?'Researcher assessment: ':'Araştırmacı yorumu: ')+(en?r.editorialReview.en:r.editorialReview.tr)));
   const a=el('a',en?'Observed source ↗':'Gözlem kaynağı ↗');a.href=r.sourceUrl;a.rel='noopener noreferrer';a.target='_blank';c.append(a);result.append(c);
  }}
  const coverage=el('details');coverage.append(el('summary',en?'Daily coverage':'Günlük veri kapsamı'));for(const row of report.counts)coverage.append(el('p',row.day+' · '+(row.records??(en?'No observation':'Gözlem yok'))));result.append(coverage);
  const recurring=el('details');recurring.append(el('summary',en?'Recurring topics':'Tekrar görülen konular'));if(!report.recurring.length)recurring.append(el('p',en?'No repeated-day topic established in this selection.':'Bu seçimde farklı günlerde tekrar görülen konu saptanmadı.'));for(const r of report.recurring)recurring.append(el('p',`${r.platform.toUpperCase()} · ${r.region} · ${r.title} · ${r.days.length} ${en?'observed days':'gözlem günü'}`));result.append(recurring);
  const cross=el('details');cross.append(el('summary',en?'Cross-platform research leads':'Platformlar arası araştırma ipuçları'));cross.append(el('p',en?'Exact normalized title matches within the same declared market only. Matches are not ad recommendations or proof of shared audiences.':'Yalnız aynı kayıtlı ülke/kapsamda normalize edilmiş birebir başlık eşleşmeleri. Eşleşme, reklam önerisi veya ortak kitle kanıtı değildir.'));if(!report.cross.length)cross.append(el('p',en?'No exact cross-platform match in this selection.':'Bu seçimde platformlar arası birebir eşleşme yok.'));for(const r of report.cross)cross.append(el('p',r.region+' · '+r.title));result.append(cross);
  result.append(el('h2',en?'Competitor ads by target-country filter':'Hedef ülke filtresine göre rakip reklamları'));
  const reads=history.countryAds.filter(r=>(region.value==='all'||(region.value==='OTHER'?r.country!=='TR':r.country===region.value))&&(platform.value==='all'||platform.value===r.library)&&r.day>=report.startDay&&r.day<=report.endDay);
  result.append(el('p',en?'Ad-library observations are separate from social topic counts. A zero is a recorded filter result; an unchecked country is unknown. No spend or conversion data.':'Reklam kütüphanesi gözlemleri gündem sayımlarından ayrıdır. Sıfır, kontrol edilen filtrenin sonucudur; kontrol edilmeyen ülke bilinmiyor. Harcama ve dönüşüm verisi yok.'));
  if(!reads.length)result.append(el('p',en?'No country-specific ad-library observation for this selection.':'Bu seçim için ülke bazlı reklam kütüphanesi gözlemi yok.'));
  for(const r of reads){const c=el('article');c.className='card';const p=data.competitors.profiles.find(p=>p.id===r.competitorId);c.append(flagTitle('h3',(p?.name??r.competitorId)+' · '+r.country,r.country),el('p',en?`${r.library} · ${r.totalResults??'?'} filter results · ${r.sampledAds} sampled ad records`:`${r.library} · ${r.totalResults??'?'} filtre sonucu · ${r.sampledAds} örnek reklam kaydı`));if(r.sourceUrl){const a=el('a',en?'Source ↗':'Kaynak ↗');a.href=r.sourceUrl;a.target='_blank';a.rel='noopener noreferrer';c.append(a);}result.append(c);}
 }
 for(const control of [platform,region,period,date])control.onchange=render;render();return root;
};
