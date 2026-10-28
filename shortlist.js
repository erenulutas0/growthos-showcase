// Shared bilingual view; untrusted text is rendered using text nodes only.
const creativeShortlistBase=new URL('.',document.currentScript.src);
window.renderCreativeShortlist=(data,en=false)=>{
 const lang=en?'en':'tr',s=data.shortlist;
 const metrics={reader_qualified_session:en?'Qualified reading session':'Nitelikli okuma oturumu',writer_first_publication:en?'First published work':'İlk eser yayını',viewer_qualified_watch:en?'Qualified viewing session':'Nitelikli izleme oturumu'};
 const el=(tag,text)=>{const n=document.createElement(tag);if(text)n.textContent=text;return n;};
 const root=el('section'),h=el('h1',en?'Three angles to review':'İncelenecek üç reklam açısı');root.append(h);
 root.append(el('p',en?'Editorial selection, not proven winners. No campaign is ready to launch.':'Editoryal seçim; kanıtlanmış kazananlar değil. Hiçbiri yayın onayı değildir.'));
 root.append(el('p',(en?'Source date: ':'Kaynak günü: ')+s.sourceDay+' · '+(en?'Age at package date (days): ':'Paket tarihindeki yaş (gün): ')+(s.ageDays??'?')));
 root.append(el('p',s.freshness==='RECHECK_REQUIRED'?(en?'Recheck sources before deciding.':'Karar öncesi kaynaklar yeniden kontrol edilmeli.'):s.freshness==='UNKNOWN'?(en?'Freshness unknown.':'Güncellik bilinmiyor.'):(en?'Recorded snapshot; not a live trend feed.':'Kayıtlı gözlem; canlı trend akışı değildir.')));
 for(const entry of s.entries){
  const c=el('article');c.className='card';c.append(el('h2',entry.title[lang]),el('p',entry.reason[lang]),el('p',entry.limit[lang]));
  c.append(el('blockquote',entry.draft[lang]));
  c.append(el('p',(en?'Proposed metric: ':'Önerilen ölçüm: ')+(metrics[entry.metric]??(en?'Undefined':'Tanımsız'))));
  const plan=entry.testPlan;
  if(plan){
   c.append(el('h3',en?'Two openings to compare':'Karşılaştırılacak iki açılış'));
   for(const v of plan.variants)c.append(el('p',v.id.toUpperCase()+' · '+v.copy[lang]));
   c.append(el('p',(en?'Next step: ':'Sıradaki adım: ')+plan.nextAction[lang]));
   const measurement=el('details');measurement.append(el('summary',en?'Proposed experiment and measurement':'Önerilen deney ve ölçüm'));
   measurement.append(el('p',plan.singleChange[lang]),el('p',plan.fixed[lang]),el('p',plan.qualifiedDefinition[lang]));
   measurement.append(el('p',en?'Denominator: attributed landing-page visits. The event and denominator must use the same agreed counting unit.':'Payda: varyanta bağlanabilen açılış sayfası ziyaretleri. Olay ve payda aynı, ekipçe kararlaştırılmış sayım birimini kullanmalı.'),el('p',plan.interpretation[lang]));
   measurement.append(el('p',en?'Not registered or instrumented. Landing page, channel, budget, sample size and dates are unset.':'Deney kaydedilmedi, ölçüm kurulmadı. Açılış adresi, kanal, bütçe, örneklem ve tarihler belirlenmedi.'));
   c.append(measurement);
  }
  const details=el('details');details.append(el('summary',en?'Evidence and test requirements':'Kanıtlar ve test gereksinimleri'));
  if(!entry.evidence.length)details.append(el('p',en?'Direct source link missing; verify before using this hypothesis.':'Doğrudan kaynak bağlantısı eksik; hipotez kullanılmadan doğrulanmalı.'));
  for(const e of entry.evidence){const a=el('a',e.advertiser+' · '+(e.adId??''));a.href=e.sourceUrl;a.target='_blank';a.rel='noopener noreferrer';const p=el('p');p.append(a);details.append(p);if(!en)details.append(el('p',e.fact));}
  details.append(el('p',en?'Before a test: authorized work/scene, approved product wording, landing page, defined qualified-use event and a reviewed experiment plan.':'Test öncesi: izinli eser/sahne, doğrulanmış ürün metni, açılış adresi, nitelikli kullanım olayı ve incelenmiş deney planı.'));
  if(entry.blockers.length)details.append(el('p',(en?'Open experiment checks: ':'Açık deney kontrolleri: ')+entry.blockers.join(', ')));
  c.append(details);root.append(c);
 }
 const quality=data.sourceQuality;
 if(quality){
  const box=el('details');box.className='card';box.append(el('summary',en?'Daily-source record quality':'Günlük kaynak kayıtlarının kalitesi'));
  box.append(el('p',en?`${quality.counts.records} source/view records · ${quality.counts.incomplete} incomplete · ${quality.counts.duplicates} exact duplicates`:`${quality.counts.records} kaynak/görünüm kaydı · ${quality.counts.incomplete} eksik kayıt · ${quality.counts.duplicates} birebir tekrar`));
  box.append(el('p',en?'Scope: recorded daily-brief sources only, not all competitor ads. Completeness does not verify permission, accuracy or business impact.':'Kapsam yalnız kayıtlı günlük brifing kaynaklarıdır; tüm rakip reklamları değil. Alanların dolu olması izin, doğruluk veya ticari etkiyi doğrulamaz.'));
  const labels={METHOD_NOT_RECORDED:en?'Collection method not recorded':'Toplama yöntemi kayıtlı değil',SAMPLING_NOT_RECORDED:en?'Sampling not recorded':'Örnekleme kayıtlı değil',SOURCE_URL_MISSING_OR_UNSAFE:en?'Source URL missing or unsafe':'Kaynak bağlantısı eksik veya uygun değil',OBSERVATION_DATE_INVALID:en?'Observation date invalid':'Gözlem tarihi geçersiz',DUPLICATE_OBSERVATION:en?'Duplicate observation':'Tekrar gözlem'};
  const contexts={'trending-screen':en?'X · Trending screen':'X · Gündem ekranı','global-first20':en?'X · Global topics':'X · Dünya gündemi','movies-first12':en?'X · Movies and TV':'X · Film ve dizi','tiktok-creative-center':en?'TikTok · Creative Center hashtags':'TikTok · Creative Center etiketleri','tiktok-search-review':en?'TikTok · Search cards':'TikTok · Arama kartları','google-related-queries':en?'Google · Related searches':'Google · İlgili aramalar'};
  for(const row of quality.entries){
   box.append(el('h3',contexts[row.context]??(en?'Recorded source':'Kayıtlı kaynak')),el('p',row.observedAt?new Date(row.observedAt).toLocaleString(en?'en-GB':'tr-TR',{timeZone:'Europe/Istanbul'}):(en?'Unknown observation date':'Gözlem tarihi bilinmiyor')));
   if(row.sourceUrl){const a=el('a',en?'Recorded source ↗':'Kayıtlı kaynak ↗');a.href=row.sourceUrl;a.rel='noopener noreferrer';a.target='_blank';box.append(a);}
   box.append(el('p',row.issues.length?row.issues.map(i=>labels[i]??i).join(' · '):(en?'Required provenance fields present.':'Gerekli kaynak alanları kayıtlı.')));
  }
  root.append(box);
 }
 const packet=el('a',en?'Open team-review JSON packet':'Ekip inceleme JSON paketini aç');packet.href=new URL('review-packets.json',creativeShortlistBase).href;packet.rel='noopener noreferrer';root.append(packet);
 root.append(el('p',en?'Review-only handoff; not a validated n8n import or executable workflow.':'Yalnız inceleme aktarımı; doğrulanmış n8n içe aktarımı veya çalıştırılabilir akış değildir.'));
 return root;
};
