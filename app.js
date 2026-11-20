const $=s=>document.querySelector(s), esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const monthOrder = [...new Set(works.map(work => work.period))].reverse();
const periodLabel = period => period.slice(0, 4) + ' 年 ' + Number(period.slice(5)) + ' 月';
let month = '';
const selected = [
  { id: 37, titlePhrases: ['8.0|我通关了，', '但我好像只玩了三分之一？', '《红色沙漠》评测 【UCG】'] },
  { personalUrl: 'https://www.bilibili.com/video/BV1WJJpzqETV/', cover: 'covers/BV1WJJpzqETV.jpg' },
  { id: 47, title: '新月的回忆珍藏于此!《新月同行美术设定集》' },
  { id: 64, title: '不出正作的《恶魔城》，日子居然越来越好了？' },
  { id: 55, title: '《刺客信条：黑旗 记忆重置》制作人采访' },
  { id: 75, title: '《游戏机实用技术》开箱' }
];
const number=n=>Number(n).toLocaleString('zh-CN');
function sourceFor(w){return w.links.map(url=>workMetadata[url]).find(m=>m?.status==='ok'&&m.kind==='video')||w.links.map(url=>workMetadata[url]).find(m=>m?.status==='ok')}
function videoRowsFor(work) {
  return videoSheetData.rows.filter(row => row.workIds.includes(work.id));
}

function videoSheetPanel(work) {
  return videoRowsFor(work).map(row => {
    const metrics = [['view','播放'], ['reply','评论'], ['share','分享或转发'], ['impressions','展示'], ['interactions','互动']];
    const columns = metrics.filter(([key]) => row.platforms.some(platform => platform.stats[key] != null));
    const header = columns.map(([, label]) => '<th scope="col">' + label + '</th>').join('');
    const rows = row.platforms.map(({name, stats}) => {
      const cells = columns.map(([key]) => '<td>' + (stats[key] == null ? '—' : number(stats[key])) + '</td>').join('');
      return '<tr><th scope="row">' + esc(name) + '</th>' + cells + '</tr>';
    }).join('');
    return '<section class="source-data shortvideo-section"><h3>视频平台数据</h3><div class="shortvideo-record"><h4>' + esc(row.title) + '</h4>' +
      '<div class="platform-table-wrap"><table class="platform-table"><thead><tr><th scope="col">平台</th>' + header + '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<p class="data-time">来源：' + esc(videoSheetData.source) + ' · ' + esc(videoSheetData.sheet) + '第 ' + row.row + ' 行。发布于 ' + row.publishedDate +
      '。— 表示未提供。' + (row.workIds.length > 1 ? '两条工作记录共用本视频数据，汇总只计一次。' : '') + '</p></div></section>';
  }).join('');
}

function shortStats(w){const m=sourceFor(w);if(!m){
  const plays = videoRowsFor(w).flatMap(row => row.platforms).find(platform => platform.name === 'B站')?.stats.view;
  if (plays != null) return number(plays) + ' B站播放';
  const rows = articlesFor(w);
  return rows.length ? number(articleReads(rows)) + ' 阅读' : '';
}const v=m.stats?.view;return [v!=null?number(v)+(m.kind==='video'?' 播放':' 阅读'):m.readLabel,m.stats?.like!=null?number(m.stats.like)+' 赞':null].filter(Boolean).join(' · ')}
function statMarkup(m){const labels={view:m.kind==='video'?'播放':'阅读',like:'点赞',coin:'投币',favorite:'收藏',reply:'评论',danmaku:'弹幕',share:'分享'};return Object.entries(labels).filter(([k])=>m.stats?.[k]!=null).map(([k,label])=>`<div><strong>${number(m.stats[k])}</strong><span>${label}</span></div>`).join('')}
function douyinFor(w){return douyinWorks.filter(d=>d.workIds.includes(w.id))}
function douyinButtons(w){return douyinFor(w).map(d=>`<div class="douyin-links"><a href="${esc(d.url)}" target="_blank" rel="noopener noreferrer">在抖音观看 ↗<small>抖音 · 新标签页打开</small></a></div>`).join('')}
function shortVideosFor(w){return shortVideoData.rows.filter(r=>r.workIds.includes(w.id))}
function shortVideoPanel(w){const rows=shortVideosFor(w);if(!rows.length)return '';return `<section class="source-data shortvideo-section"><h3>短视频平台数据</h3>${rows.map(r=>`<div class="shortvideo-record"><h4>${esc(r.title)}</h4><div class="platform-table-wrap"><table class="platform-table"><thead><tr><th scope="col">平台</th><th scope="col">播放</th><th scope="col">点赞</th><th scope="col">评论</th><th scope="col">转发</th></tr></thead><tbody>${r.platforms.map(p=>`<tr><th scope="row">${esc(p.name)}</th>${['view','like','reply','share'].map(k=>`<td>${p.stats[k]!=null?number(p.stats[k]):k==='view'&&p.viewNote?esc(p.viewNote):'—'}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="data-time">来源：${esc(shortVideoData.source)} · ${esc(shortVideoData.sheet)}第 ${r.row} 行。— 表示未提供。</p></div>`).join('')}<p class="data-time">表内未注明统计截止日期；不同平台分别统计，同一作品的多项分工不重复累计。</p></section>`}
function douyinPanel(w){return douyinFor(w).map(d=>`<section class="source-data"><a href="${esc(d.url)}" target="_blank" rel="noopener noreferrer">抖音 · ${esc(d.title)} ↗</a><p class="source-byline">${esc(d.author)}</p><div class="metric-grid">${statMarkup({kind:'video',stats:d.stats})}</div><p class="data-time">采集于 ${new Date(d.capturedAt).toLocaleString('zh-CN',{timeZone:'Asia/Hong_Kong',hour12:false})}（香港时间） · 播放量未公开，未计入累计播放。</p></section>`).join('')}
function metadataPanel(w){return w.links.map(url=>{const m=workMetadata[url];if(!m||m.status!=='ok')return '<p class="note">此链接的公开数据暂时无法读取，可通过上方入口查看作品。</p>';const time=new Date(m.fetchedAt).toLocaleString('zh-CN',{timeZone:'Asia/Hong_Kong',hour12:false});const published=m.publishedAt?new Date(m.publishedAt*1000).toLocaleDateString('zh-CN',{timeZone:'Asia/Hong_Kong'}):'';return `<section class="source-data"><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">B站 · ${m.kind==='video'?'视频':'图文'} · ${esc(m.title||w.title)} ↗</a><p class="source-byline">${esc(m.author||'')}${published?' · 发布于 '+published:''}${m.duration?' · '+Math.floor(m.duration/60)+':'+String(m.duration%60).padStart(2,'0'):''}</p><div class="metric-grid">${statMarkup(m)}</div>${m.stats?.view==null&&m.readLabel?'<p class="note">平台显示：'+esc(m.readLabel)+'</p>':''}<p class="data-time">采集于 ${time}（香港时间） · 数据为采集时快照</p></section>`}).join('')}
const captured=Object.values(workMetadata).filter(m=>m.status==='ok'),videos=captured.filter(m=>m.kind==='video'&&m.stats?.view!=null),articles=captured.filter(m=>m.kind==='article'&&m.stats?.view!=null);
$('#data-summary').innerHTML=`<h3 class="summary-heading bili-heading">B站 · 播放与互动</h3><div class="summary-metrics bili-metrics"><div><strong>${number(videos.reduce((n,m)=>n+m.stats.view,0))}</strong><span>${videos.length} 个视频累计播放（B站）</span></div><div><strong>${number(videos.reduce((n,m)=>n+(m.stats.like??0),0))}</strong><span>视频累计点赞（B站）</span></div><div><strong>${number(videos.reduce((n,m)=>n+(m.stats.favorite??0),0))}</strong><span>视频累计收藏（B站）</span></div></div><p class="data-time">同一链接只计一次；统计为所参与作品的整体数据。采集日期：${captured.length?new Date(captured[0].fetchedAt).toLocaleDateString('zh-CN',{timeZone:'Asia/Hong_Kong'}):'—'}，非实时更新。</p><p class="data-time">已补充短视频表内 ${shortVideoData.rows.length} 个作品的数据，关联 ${new Set(shortVideoData.rows.flatMap(r=>r.workIds)).size} 项工作记录。</p>`;
const shortPlatforms=[...new Set(shortVideoData.rows.flatMap(r=>r.platforms.map(p=>p.name)))];
$('#data-summary').insertAdjacentHTML('beforeend',`<div class="short-summary"><h3 class="summary-heading">短视频侧 · 平台播放</h3><div class="short-summary-grid">${shortPlatforms.map(name=>{const sources=shortVideoData.rows.flatMap(r=>r.platforms.filter(p=>p.name===name&&p.stats.view!=null));return `<div><span>${esc(name)}</span><strong>${number(sources.reduce((n,p)=>n+p.stats.view,0))}</strong><small>${sources.length} 个作品有播放数据</small></div>`}).join('')}</div><p class="data-time">来源：短视频侧视频数据一览.xlsx，仅统计已匹配的参与作品；每条作品按平台分别计一次。表内未注明统计截止日期，与上方 B 站公开快照分开呈现。</p></div>`);
const newBiliPlays = videoSheetData.rows.flatMap(row => row.platforms)
  .filter(platform => platform.name === 'B站')
  .reduce((count, platform) => count + (platform.stats.view ?? 0), 0);
const biliTotal = videos.reduce((total, video) => total + video.stats.view, 0) + newBiliPlays;
const shortTotal=shortVideoData.rows.reduce((sum,r)=>sum+r.platforms.filter(p=>p.name!=='B站（表内）').reduce((n,p)=>n+(p.stats.view??0),0),0);
const totalBrowse=biliTotal+shortTotal+liveTotals(liveData.rows)[0]+articleReads(articleData.rows);
$('#data-summary').insertAdjacentHTML('afterbegin',`<div class="combined-summary"><h3 class="summary-heading">总浏览量</h3><strong>${number(totalBrowse)}</strong><p>B站视频 ${number(biliTotal)} ＋ 短视频侧 ${number(shortTotal)} ＋ 直播观看 ${number(liveTotals(liveData.rows)[0])} ＋ 文章阅读 ${number(articleReads(articleData.rows))}</p><small>视频播放、短视频播放、直播观看人次与文章阅读相加；同一作品的多项分工只计一次，文章阅读统一采用文章栏数据。弹幕不计入总浏览量，跨平台观众未去重。沿用各来源的静态数据。</small></div>`);
function shortSideStats(w){const rows=shortVideosFor(w);const count=rows.reduce((sum,r)=>sum+r.platforms.filter(p=>p.name!=='B站（表内）').reduce((n,p)=>n+(p.stats.view??0),0),0);return rows.length?number(count)+' 短视频播放':'—'}

function liveFor(w){return liveData.rows.filter(r=>r.workIds.includes(w.id))}
function liveTotals(rows){return ['viewers','danmaku'].map(k=>rows.flatMap(r=>r.platforms).reduce((n,p)=>n+(p.stats[k]??0),0))}
function liveStats(w){const rows=liveFor(w);if(!rows.length)return '';const [v,d]=liveTotals(rows);return number(v)+' 观看人次 · '+number(d)+' 弹幕'+(rows.some(r=>!r.platforms.some(p=>p.name==='B站'))?'（部分平台）':'')}
function liveTable(platforms){return '<div class="platform-table-wrap"><table class="platform-table"><thead><tr><th scope="col">平台</th><th scope="col">观看人数</th><th scope="col">弹幕数</th></tr></thead><tbody>'+platforms.map(p=>'<tr><th scope="row">'+esc(p.name)+'</th>'+['viewers','danmaku'].map(k=>'<td>'+(p.stats[k]!=null?number(p.stats[k]):'—')+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>'}
function livePanel(w){return liveFor(w).map(r=>'<section class="source-data live-panel"><h3>直播 · 观看与弹幕</h3>'+liveTable(['B站','视频号'].map(name=>r.platforms.find(p=>p.name===name)||{name,stats:{}}))+'<p class="data-time">来源：'+esc(r.source)+' · '+esc(r.sheet)+' 第 '+r.row+' 行。— 表示未提供。'+(r.workIds.length>1?'本场为“'+esc(r.title)+'”合并直播，两条作品共用本场数据，汇总仅计一次。':'')+'</p></section>').join('')}
const liveAggregate=liveTotals(liveData.rows);
$('#data-summary').insertAdjacentHTML('beforeend','<div class="live-summary"><h3 class="summary-heading">直播 · 观看与弹幕</h3><div class="live-summary-metrics"><div><strong>'+number(liveAggregate[0])+'</strong><span>累计观看人次</span></div><div><strong>'+number(liveAggregate[1])+'</strong><span>累计弹幕数</span></div></div><div class="live-platforms">'+['B站','视频号'].map(name=>{const ps=liveData.rows.flatMap(r=>r.platforms.filter(p=>p.name===name));return '<div><h4>'+name+'</h4>'+['viewers','danmaku'].map((k,i)=>{const values=ps.filter(p=>p.stats[k]!=null);return '<p><span>'+['观看人次','弹幕数'][i]+'</span><strong>'+(values.length?number(values.reduce((n,p)=>n+p.stats[k],0)):'—')+'</strong></p>'}).join('')+'</div>'}).join('')+'</div><p class="data-time">已匹配 38 项直播记录，对应 37 场直播。同场合并内容只计一次；观看人数按场次、平台累计，观众未跨场或跨平台去重。B站有 2 场未提供数据，— 表示未提供。</p><p class="data-time">来源：直播数据统计2025.xlsx、直播数据统计2026.xlsx，沿用表内静态数据。直播观看人次计入上方总浏览量，弹幕数单独展示。</p></div>');


function articlesFor(w){return articleData.rows.filter(r=>r.workIds.includes(w.id))}
function articleReads(rows){return rows.flatMap(r=>r.platforms).reduce((sum,p)=>sum+(p.read??0),0)}
function articlePanel(w){const rows=articlesFor(w);if(!rows.length)return '';return '<section class="source-data article-panel"><h3>文章 · 阅读数据</h3>'+rows.map(r=>'<h4>'+esc(r.title)+'</h4><div class="platform-table-wrap"><table class="platform-table"><thead><tr><th scope="col">平台</th><th scope="col">阅读数</th></tr></thead><tbody>'+r.platforms.map(p=>'<tr><th scope="row">'+(p.url?'<a href="'+esc(p.url)+'" target="_blank" rel="noopener noreferrer">'+esc(p.name)+' ↗</a>':esc(p.name))+'</th><td>'+(p.read!=null?number(p.read):'—')+'</td></tr>').join('')+'</tbody><tfoot><tr><th scope="row">合计</th><td>'+number(articleReads([r]))+'</td></tr></tfoot></table></div><p class="data-time">来源：'+(r.source?esc(r.source)+(r.publishedDate?' · 发布日期：'+esc(r.publishedDate):''):esc(articleData.source)+' · '+esc(articleData.sheet)+' 第 '+r.row+' 行')+'。'+(r.workIds.length>1?'同一文章关联多项分工，汇总只计一次。':'')+'</p>').join('')+'<p class="data-time">沿用表内静态阅读数；— 表示未提供。表内 B站数据与公开快照分别呈现，不重复相加。</p></section>'}
$('#data-summary').insertAdjacentHTML('beforeend','<div class="article-summary"><h3 class="summary-heading">文章 · 阅读数据</h3><div class="live-summary-metrics"><div><strong>'+number(articleReads(articleData.rows))+'</strong><span>跨平台累计阅读</span></div><div><strong>'+articleData.rows.length+'</strong><span>篇参与文章</span></div></div><div class="short-summary-grid">'+[...new Set(articleData.rows.flatMap(r=>r.platforms.map(p=>p.name)))].map(name=>{const ps=articleData.rows.flatMap(r=>r.platforms.filter(p=>p.name===name&&p.read!=null));return '<div><span>'+name+'</span><strong>'+number(ps.reduce((n,p)=>n+p.read,0))+'</strong><small>'+ps.length+' 篇文章有阅读数据</small></div>'}).join('')+'</div><p class="data-time">来源：'+esc(articleData.source)+'及作者补充数据。已匹配 '+articleData.rows.length+' 篇文章，关联 '+new Set(articleData.rows.flatMap(r=>r.workIds)).size+' 项工作记录；同篇文章多项分工只计一次，各平台阅读分别累计。沿用表内静态数据，未注明统计截止日期。</p><p class="data-time">文章阅读统一采用本栏的文章表及补充数据，并计入上方总浏览量；同篇文章的 B站公开快照不再重复累计。</p></div>');


// Keep the overview compact while retaining all platform details.
const summaryRoot=$('#data-summary');
const biliBody=document.createElement('div');
let biliNode=$('.bili-heading').nextElementSibling;
while(biliNode&&!biliNode.classList.contains('short-summary')){const next=biliNode.nextElementSibling;biliBody.append(biliNode);biliNode=next}
$('.bili-heading').remove();
biliBody.querySelector('.bili-metrics>div').remove();
biliBody.querySelectorAll('.data-time')[1]?.remove();
biliBody.insertAdjacentHTML('beforeend', '<p class="data-time">新增 ' + number(newBiliPlays) +
  ' 次 B站播放，来自 ' + videoSheetData.rows.length + ' 条视频的 UCG 视频统计表。新增视频的其他平台数据见作品详情。点赞与收藏沿用 B站公开快照。</p>');
$('.live-summary .live-summary-metrics>div').remove();
$('.article-summary .live-summary-metrics').remove();
const overviewSections=[['B站视频',biliTotal,biliBody],['短视频侧',shortTotal,$('.short-summary')],['直播观看',liveAggregate[0],$('.live-summary')],['文章阅读',articleReads(articleData.rows),$('.article-summary')]];
for(const [label,value,body] of overviewSections){
 body.querySelector('.summary-heading')?.remove();
 body.classList.add('overview-body');
 const details=document.createElement('details');details.className='overview-fold';
 details.innerHTML='<summary><span class="overview-label">'+label+'</span><strong>'+number(value)+'</strong><span class="overview-toggle" aria-hidden="true"><span class="fold-more">展开 ＋</span><span class="fold-less">收起 −</span></span></summary>';
 details.append(body);summaryRoot.append(details);
}
$('.combined-summary p').remove();
$('.combined-summary small').textContent='B站视频播放、短视频播放、直播观看与文章阅读合计。按作品及平台累计，同一作品多项分工只计一次。非独立访客数。';

$('#total').textContent=works.length;
function featureCard(item) {
  const work = works.find(entry => entry.id === item.id);
  const personal = item.personalUrl && personalAccount.videos.find(video => video.url === item.personalUrl);
  const cover = work ? sourceFor(work).localCover : item.cover;
  const title = item.titlePhrases
    ? item.titlePhrases.map(phrase => `<span class="title-phrase">${esc(phrase)}</span>`).join('')
    : esc(work ? item.title : personal.title);
  const content = `<div class="cover has-image"><img src="${esc(cover)}" alt="" loading="lazy"></div>
    <div class="feature-meta">${work ? esc(work.type) : '个人视频'}</div>
    <h3>${title}</h3>
    <p class="feature-credit">${work ? '<span>参与</span>' + esc(work.credit.replaceAll('/', ' · ')) : esc(personalAccount.name) + ' · B站个人账号 ↗'}</p>`;
  if (personal) return `<a class="feature" href="${esc(personal.url)}" target="_blank" rel="noopener noreferrer">${content}</a>`;
  return `<button class="feature" data-id="${work.id}">${content}</button>`;
}

$('#features').innerHTML = selected.map(featureCard).join('');
const typeCounts = new Map();
for (const work of works) {
  typeCounts.set(work.type, (typeCounts.get(work.type) || 0) + 1);
}
const contentsOrder = new Set(['评测与试玩', '采访', '视频', '图文', '直播', '策划与其他', ...typeCounts.keys()]);
$('#contents-list').innerHTML = [...contentsOrder].filter(type => typeCounts.has(type)).map(type =>
  `<li><a href="#catalog" data-contents-type="${esc(type)}"><span>${esc(type)}</span><span class="contents-count">${typeCounts.get(type)}</span><span class="contents-arrow" aria-hidden="true">↘</span></a></li>`
).join('');
$('#contents-list').addEventListener('click', event => {
  const link = event.target.closest('[data-contents-type]');
  if (!link) return;
  $('#reset').click();
  $('#type').value = link.dataset.contentsType;
  render();
  $('#type').focus({preventScroll:true});
});
for (const type of new Set(works.map(work => work.type))) {
  $('#type').add(new Option(type, type));
}

$('#month-select').add(new Option('全部月份', ''));
for (const period of monthOrder) {
  $('#month-select').add(new Option(periodLabel(period), period));
}
$('#months').innerHTML = '<button class="active" data-month="" aria-pressed="true">全部月份</button>' +
  monthOrder.map(period => `<button data-month="${period}" aria-pressed="false">${period.replace('-', '/')}</button>`).join('');
$('#month-select').addEventListener('change', event => {
  document.querySelector(`[data-month="${event.target.value}"]`).click();
});

function hasBiliData(work) {
  return work.links.some(url => new URL(url).hostname === 'www.bilibili.com') ||
    videoRowsFor(work).some(row => row.platforms.some(p => p.name === 'B站' && p.stats.view != null)) ||
    articlesFor(work).some(row => row.platforms.some(p => p.name === 'B站' && p.read != null));
}

function entryMarkup(work, platform) {
  const stats = platform === 'short' ? shortSideStats(work) :
    work.type === '直播' ? liveStats(work) : shortStats(work);
  const date = work.period + '-' + String(work.day).padStart(2, '0');
  return `<button class="entry" data-id="${work.id}">
    <time datetime="${date}">${date.slice(5).replace('-', '/')}</time>
    <div><h3>${esc(work.title)}${work.commercial ? '<span class="badge">商单</span>' : ''}</h3>
      <p class="entry-credit">${esc(work.credit.replaceAll('/', ' · '))}</p></div>
    <span class="entry-data"><span class="category">${esc(work.type)}</span><span class="entry-stats">${esc(stats || '—')}</span></span>
    <span class="entry-action"><span class="link-availability">查看记录</span><span class="arrow" aria-hidden="true">↗</span></span>
  </button>`;
}

function render() {
  const query = $('#search').value.trim().toLowerCase();
  const type = $('#type').value;
  const platform = $('#platform').value;
  const commercial = $('#commercial').value;
  const filtering = Boolean(month || query || type || platform || commercial);
  const matches = works.filter(work => {
    if (month && work.period !== month) return false;
    if (query && !(work.title + ' ' + work.credit).toLowerCase().includes(query)) return false;
    if (type && work.type !== type) return false;
    if (platform === 'short' && shortVideosFor(work).length === 0) return false;
    if (platform === 'bilibili' && !hasBiliData(work)) return false;
    return !commercial || work.commercial === (commercial === 'yes');
  });
  $('#month-select').value = month;
  $('#result-count').textContent = filtering ? `找到 ${matches.length} 项，共 ${works.length} 项` : `共 ${works.length} 项工作记录`;
  $('#reset').disabled = !filtering;
  const groups = monthOrder.map(period => ({
    period, records: matches.filter(work => work.period === period)
  })).filter(group => group.records.length);
  $('#entries').innerHTML = groups.map(({period, records}, index) => `
    <details class="archive-month" ${filtering || index === 0 ? 'open' : ''}>
      <summary class="month-heading">${periodLabel(period)} <span>${records.length} 项</span></summary>
      ${records.map(work => entryMarkup(work, platform)).join('')}
    </details>`).join('') || '<p class="empty">没有找到匹配的作品。试试其他关键词，或重置筛选。</p>';
}

function linkLabel(url,w){return url.includes('/opus/')?'阅读图文':w.type==='直播'?'观看直播回放':'观看视频'}
function linkAvailability(w){return w.links.length ? [...new Set(w.links.map(url=>url.includes('/opus/')?'图文':'视频'))].join(' / ')+' ↗' : '链接未收录'}
function topic(w){return /黑旗/.test(w.title)?'黑旗':/PUBG/.test(w.title)?'PUBG':/消光困兽/.test(w.title)?'消光困兽':/红色沙漠/.test(w.title)?'红色沙漠':/11bit/.test(w.title)?'11bit':/ARC GAMES/.test(w.title)?'ARC GAMES':null}
function detail(id){const w=works.find(w=>w.id===Number(id));if(!w)return;const key=topic(w),related=key?works.filter(x=>x.id!==w.id&&topic(x)===key):[];$('#detail-content').innerHTML=`<div class="detail-meta">${w.date} / ${esc(w.type)}${w.commercial?' / 商单':''}</div><h2 id="detail-title">${esc(w.title)}</h2><div class="work-links">${w.links.map(url=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${linkLabel(url,w)} <span aria-hidden="true">↗</span><small>哔哩哔哩 · 新标签页打开</small></a>`).join('')}</div>${douyinButtons(w)}<dl><dt>我的分工</dt><dd>${esc(w.credit.replaceAll('/',' · '))}</dd><dt>归档日期</dt><dd>${w.year} 年 ${w.month} 月 ${w.day} 日</dd></dl>${articlePanel(w)}${w.type==='直播'?livePanel(w):metadataPanel(w)+videoSheetPanel(w)}${shortVideosFor(w).length?shortVideoPanel(w):douyinPanel(w)}${related.length?`<div class="related"><h3>同一专题 · ${key}</h3>${related.map(x=>`<button data-id="${x.id}">${x.date} / ${esc(x.title)}<br><span>${esc(x.credit)}</span></button>`).join('')}</div>`:''}<p class="note">${w.links.length?'作品链接由档案作者提供。':(w.type==='直播'&&!liveFor(w).length?'此场直播暂未收录链接或统计数据。':'此项记录暂未收录作品链接。')}${w.title.includes('等待甲方')?'修改状态保留原清单记录。':''}</p>`;if(!$('#detail').open)$('#detail').showModal();$('#detail').scrollTop=0}
document.addEventListener('click',e=>{const work=e.target.closest('[data-id]');if(work)detail(work.dataset.id);const m=e.target.closest('[data-month]');if(m){month=m.dataset.month;document.querySelectorAll('[data-month]').forEach(b=>{b.classList.toggle('active',b===m);b.setAttribute('aria-pressed',String(b===m))});render()}});
$('#search').addEventListener('input',render);['type','platform','commercial'].forEach(id=>$('#'+id).addEventListener('change',render));$('#reset').addEventListener('click',()=>{$('#search').value='';['type','platform','commercial'].forEach(id=>$('#'+id).value='');document.querySelector('[data-month=""]').click()});$('#close').addEventListener('click',()=>$('#detail').close());$('#detail').addEventListener('click',e=>{if(e.target===$('#detail')){const r=$('#detail').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('#detail').close()}});render();

$('#about').insertAdjacentHTML('beforeend',`<div class="personal-account"><div class="personal-heading"><h3>磁带雨 · 个人账号</h3><a href="${esc(personalAccount.url)}" target="_blank" rel="noopener noreferrer">访问 B站主页 ↗</a></div><div class="personal-metrics"><div><strong>约 ${number(personalAccount.videos.reduce((n,v)=>n+v.viewApprox,0))}</strong><span>两条视频累计播放</span></div><div><strong>${number(personalAccount.followers)}</strong><span>粉丝</span></div><div><strong>${number(personalAccount.likes)}</strong><span>账号累计获赞</span></div><div><strong>${number(personalAccount.posts)}</strong><span>视频投稿</span></div></div><p class="data-time">个人账号公开数据 · 采集于 ${new Date(personalAccount.capturedAt).toLocaleDateString('zh-CN',{timeZone:'Asia/Hong_Kong'})}，非实时更新。为账号累计数据，不限本档案年度，未计入上方总浏览量。</p></div>`);

const personalLabels={danmaku:'弹幕',like:'点赞',coin:'硬币',favorite:'收藏',share:'分享'};
$('.personal-account').insertAdjacentHTML('beforeend',`<details class="personal-works overview-fold"><summary><span class="overview-label">个人作品 · ${personalAccount.videos.length} 条</span><span class="overview-toggle" aria-hidden="true"><span class="fold-more">展开 ＋</span><span class="fold-less">收起 −</span></span></summary><div class="overview-body"><div class="personal-video-grid">${personalAccount.videos.map(v=>`<article class="personal-video"><h4><a href="${esc(v.url)}" target="_blank" rel="noopener noreferrer">${esc(v.title)} ↗</a></h4><p class="personal-play">约 ${number(v.viewApprox)} <span>播放</span></p><dl>${Object.entries(personalLabels).map(([k,label])=>`<div><dt>${label}</dt><dd>${number(v[k])}</dd></div>`).join('')}</dl></article>`).join('')}</div><p class="data-time">作品数据由作者提供。播放量由 5.3万、4.7万换算，为约数；两条视频的互动数与账号累计获赞统计范围及采集时间不同，分别展示。</p></div></details>`);
const navLinks = [...document.querySelectorAll('.bar nav a')];
const navSections = navLinks.map(link => document.querySelector(link.hash));
let navFrame = 0;
function updateNav() {
  const top = document.querySelector('.masthead').offsetHeight + 28;
  const current = navSections.filter(section => section.getBoundingClientRect().top <= top).at(-1);
  navLinks.forEach(link => {
    if (current && link.hash === '#' + current.id) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  navFrame = 0;
}
function scheduleNav() {
  if (!navFrame) navFrame = requestAnimationFrame(updateNav);
}
window.addEventListener('scroll', scheduleNav, {passive:true});
window.addEventListener('resize', scheduleNav);
updateNav();
