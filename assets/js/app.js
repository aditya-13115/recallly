const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],KEY='recallly-v1',today=()=>new Date().toISOString().slice(0,10),add=(d,n)=>{let x=new Date(`${d}T12:00`);x.setDate(x.getDate()+n);return x.toISOString().slice(0,10)};
let db=JSON.parse(localStorage.getItem(KEY)||'{"profiles":[{"id":"me","name":"My study space","topics":[]}],"active":"me","theme":"light"}'),view='dashboard',query='',tag='',urgency='',selected=new Set();
const save=()=>localStorage.setItem(KEY,JSON.stringify(db)),me=()=>db.profiles.find(x=>x.id===db.active),esc=x=>String(x||'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])),diff=t=>Math.round((new Date(`${t.nextReview}T12:00`)-new Date(`${today()}T12:00`))/86400000),fmt=d=>d?new Date(`${d}T12:00`).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}):'Not reviewed',status=t=>diff(t)<0?`${-diff(t)} day${diff(t)===-1?'':'s'} overdue`:diff(t)===0?'Due today':diff(t)===1?'Tomorrow':fmt(t.nextReview);
function toast(s){$('#toast').textContent=s;$('#toast').classList.add('show');setTimeout(()=>$('#toast').classList.remove('show'),2800)}function cls(t){return diff(t)<0?'due':diff(t)===0?'today':'muted'}
function row(t){let state=diff(t)<0?'Overdue':diff(t)===0?'Due today':'Upcoming';return `<article class="topic-row"><span><input class="select-row" type="checkbox" data-select="${t.id}" ${selected.has(t.id)?'checked':''}></span><div class="topic-title"><span class="tag">${esc(t.tag||'General')}</span><div><button data-edit="${t.id}">${esc(t.title)}</button>${t.notes?`<small>${esc(t.notes)}</small>`:''}</div><button class="edit" data-edit="${t.id}">✎</button></div><div class="date">${fmt(t.lastReviewed)}</div><div class="${cls(t)}">${status(t)}</div><div class="rep-control"><button data-rep="${t.id}" data-change="-1">−</button><b>${t.repetitions}</b><button data-rep="${t.id}" data-change="1">+</button></div><div class="status ${cls(t)}">${state}</div><div><span class="pill ${t.urgency.toLowerCase().replace(' ','-')}">${esc(t.urgency)}</span></div><button class="check" data-review="${t.id}" title="Reviewed today">✓</button></article>`}
function calendar(ts){let now=new Date(),year=now.getFullYear(),month=now.getMonth(),first=new Date(year,month,1).getDay(),days=new Date(year,month+1,0).getDate(),map={};ts.forEach(t=>{if(t.nextReview){map[t.nextReview]??=[];map[t.nextReview].push(t)}});let cells=Array(first).fill('<div class="day empty-day"></div>');for(let n=1;n<=days;n++){let d=`${year}-${String(month+1).padStart(2,'0')}-${String(n).padStart(2,'0')}`,items=(map[d]||[]).map(t=>`<div class="cal-item ${diff(t)<0?'overdue-item':''}" title="${esc(t.title)}">${esc(t.title)}</div>`).join('');cells.push(`<div class="day ${d===today()?'today-cell':''}"><b>${n}</b>${items}</div>`)}return `<p class="eyebrow">REVIEW SCHEDULE</p><h2>${now.toLocaleString(undefined,{month:'long',year:'numeric'})}</h2><div class="calendar-grid">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(x=>`<div class="weekday">${x}</div>`).join('')}${cells.join('')}</div>`}
function heat(ts){let a=[];for(let i=59;i>=0;i--){let d=add(today(),-i),count=ts.reduce((n,t)=>n+(t.history||[]).filter(x=>x===d).length+(t.lastReviewed===d?1:0),0);a.push(`<span class="heat ${count?count===1?'l1':count===2?'l2':count===3?'l3':'l4':''}" title="${d}: ${count} review${count===1?'':'s'}"></span>`)}return `<p class="eyebrow">LAST 60 DAYS</p><h2>Monthly review heatmap</h2><div class="heatmap">${a.join('')}</div><div class="legend">Less <span></span><span class="l1"></span><span class="l2"></span><span class="l3"></span><span class="l4"></span> More</div><p class="sync-note">Each completed review is added to your history.</p>`}
function render(){let p=me(),ts=p.topics||[],due=ts.filter(t=>diff(t)===0),late=ts.filter(t=>diff(t)<0),set=[...new Set(ts.map(t=>t.tag).filter(Boolean))];$('#profileName').textContent=p.name;$('#avatar').textContent=p.name[0].toUpperCase();$('#allCount').textContent=ts.length;$('#todayCount').textContent=due.length;$('#overdueCount').textContent=late.length;$('#tagFilter').innerHTML='<option value="">All subjects</option>'+set.map(x=>`<option ${x===tag?'selected':''}>${esc(x)}</option>`).join('');$('#tagSuggestions').innerHTML=set.map(x=>`<option value="${esc(x)}">`).join('');let pool=view==='today'?due:view==='overdue'?late:ts,shown=pool.filter(t=>(!query||`${t.title} ${t.notes} ${t.tag}`.toLowerCase().includes(query))&&(!tag||t.tag===tag)&&(!urgency||t.urgency===urgency)).sort((a,b)=>diff(a)-diff(b)),labels={dashboard:['Today’s dashboard','Your focused study plan for today.'],all:['All topics','Your complete study database.'],today:['Due today','Complete these reviews to stay on track.'],overdue:['Overdue topics','Pick one and get back into the rhythm.'],calendar:['Calendar','See your scheduled reviews this month.'],heatmap:['Review heatmap','Your recent consistency, at a glance.']};$('#heading').textContent=labels[view][0];$('#subheading').textContent=labels[view][1];$('#summary').innerHTML=`<div class="stat"><p>Due today</p><b>${due.length}</b></div><div class="stat"><p>Overdue</p><b>${late.length}</b></div><div class="stat"><p>Total repetitions</p><b>${ts.reduce((a,t)=>a+t.repetitions,0)}</b></div>`;let dash=view==='dashboard',vis=['calendar','heatmap'].includes(view);$('#dashboard').classList.toggle('hidden',!dash);$('#visual').classList.toggle('hidden',!vis);$('#table').classList.toggle('hidden',dash||vis);$('#bulkBar').classList.toggle('hidden',selected.size===0||dash||vis);if(dash){let tasks=[...late,...due];$('#dashboard').innerHTML=`<div class="dashboard-card"><p class="eyebrow">REVIEW QUEUE</p><h2>${tasks.length?`${tasks.length} item${tasks.length===1?'':'s'} to strengthen today`:'Your review queue is clear'}</h2>${tasks.map(t=>`<div class="dashboard-task"><button class="check" data-review="${t.id}">✓</button><div><b>${esc(t.title)}</b><small>${status(t)} · ${esc(t.tag||'General')}</small></div></div>`).join('')||'<p class="muted">Add a topic or return tomorrow for your next review.</p>'}</div><div class="dashboard-card"><p class="eyebrow">DAILY PROGRESS</p><h2>${tasks.length} review${tasks.length===1?'':'s'} remaining</h2><p class="muted">Complete each checkbox to advance the Ebbinghaus schedule.</p></div>`}else if(vis){$('#visual').innerHTML=view==='calendar'?calendar(ts):heat(ts)}else{$('#topicList').innerHTML=shown.map(row).join('');$('#empty').classList.toggle('hidden',shown.length>0);$('#selectAll').checked=shown.length>0&&shown.every(t=>selected.has(t.id))}$('#selectedCount').textContent=`${selected.size} selected`;$$('.nav').forEach(b=>b.classList.toggle('active',b.dataset.view===view));save()}
function open(t){$('#topicForm').reset();$('#topicId').value=t?.id||'';$('#dialogTitle').textContent=t?'Edit topic':'New topic';for(let k of ['title','notes','tag','urgency','lastReviewed','nextReview','repetitions'])$('#'+k).value=t?.[k]??(k==='urgency'?'Moderate':k==='nextReview'?today():k==='repetitions'?0:'');$('#deleteButton').classList.toggle('hidden',!t);$('#topicDialog').showModal()}function review(id){let t=me().topics.find(t=>t.id===id),i=[1,3,7,30][Math.min(t.repetitions,3)];t.lastReviewed=today();t.nextReview=add(today(),i);t.repetitions++;t.history=[...(t.history||[]),today()];save();render();toast(`Reviewed. Next session: ${i===1?'tomorrow':`in ${i} days`}.`);cloudSyncTopic(t)}
$('#newButton').onclick=()=>open();$('#topicList').onclick=e=>{let b=e.target.closest('[data-review],[data-edit],[data-rep],[data-select]');if(!b)return;if(b.dataset.review)review(b.dataset.review);else if(b.dataset.edit)open(me().topics.find(t=>t.id===b.dataset.edit));else if(b.dataset.rep){let t=me().topics.find(t=>t.id===b.dataset.rep);t.repetitions=Math.max(0,t.repetitions+(+b.dataset.change));save();render();cloudSyncTopic(t)}else if(b.dataset.select){b.checked?selected.add(b.dataset.select):selected.delete(b.dataset.select);render()}};$('#dashboard').onclick=e=>{let b=e.target.closest('[data-review]');if(b)review(b.dataset.review)};$('#selectAll').onchange=e=>{let ts=me().topics||[];if(e.target.checked)ts.forEach(t=>selected.add(t.id));else selected.clear();render()};$('#bulkDelete').onclick=()=>{if(confirm(`Delete ${selected.size} selected topic${selected.size===1?'':'s'}? This cannot be undone.`)){let ids=[...selected];me().topics=me().topics.filter(t=>!selected.has(t.id));selected.clear();render();toast('Selected topics deleted.');cloudDeleteTopics(ids)}};$('#clearSelected').onclick=()=>{selected.clear();render()};
$('#topicForm').onsubmit=e=>{if(e.submitter?.value==='cancel')return;e.preventDefault();let id=$('#topicId').value,t=me().topics.find(t=>t.id===id),x={title:$('#title').value.trim(),notes:$('#notes').value.trim(),tag:$('#tag').value.trim(),urgency:$('#urgency').value,lastReviewed:$('#lastReviewed').value,nextReview:$('#nextReview').value,repetitions:+$('#repetitions').value||0};if(!x.title)return;let isNew=!t;if(t)Object.assign(t,x);else{t={id:crypto.randomUUID(),...x,history:[]};me().topics.push(t)}$('#topicDialog').close();render();toast(isNew?'Topic added.':'Changes saved.');isNew?cloudInsertTopic(t):cloudSyncTopic(t)};$('#deleteButton').onclick=()=>{let id=$('#topicId').value;me().topics=me().topics.filter(t=>t.id!==id);$('#topicDialog').close();render();toast('Topic deleted.');cloudDeleteTopics([id])};$$('.nav').forEach(b=>b.onclick=()=>{view=b.dataset.view;selected.clear();render()});$('#search').oninput=e=>{query=e.target.value.toLowerCase();render()};$('#tagFilter').onchange=e=>{tag=e.target.value;render()};$('#urgencyFilter').onchange=e=>{urgency=e.target.value;render()};$('#clearFilters').onclick=()=>{query=tag=urgency='';$('#search').value='';$('#urgencyFilter').value='';render()};
$('#themeButton').onclick=()=>{db.theme=db.theme==='dark'?'light':'dark';apply();save()};function apply(){document.body.classList.toggle('dark',db.theme==='dark');$('#themeButton').textContent=db.theme==='dark'?'☀ Light appearance':'☾ Dark appearance'}$('#notifyButton').onclick=async()=>{if(!('Notification'in window))return toast('Use a published HTTPS site for reminders.');let r=await Notification.requestPermission();if(r==='granted'){let n=me().topics.filter(t=>diff(t)<=0);if(n.length)new Notification('Recallly',{body:`${n.length} topic${n.length===1?' is':'s are'} ready for review.`});toast('Browser reminders enabled when Recallly is open.')}else toast('Reminder permission was not granted.')};$('#profileButton').onclick=()=>{let p=me();$('#profileList').innerHTML=db.profiles.map(x=>`<div class="profile-choice ${x.id===p.id?'active':''}" data-profile="${x.id}"><span class="avatar">${esc(x.name[0])}</span><span><b>${esc(x.name)}</b><small>${x.topics.length} topics</small></span></div>`).join('');$('#profileDialog').showModal()};$('#profileList').onclick=e=>{let x=e.target.closest('[data-profile]');if(x){db.active=x.dataset.profile;$('#profileDialog').close();render()}};$('#addProfile').onclick=()=>{let n=$('#newProfileName').value.trim();if(!n)return;let p={id:crypto.randomUUID(),name:n,topics:[]};db.profiles.push(p);db.active=p.id;$('#profileDialog').close();render()};if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');$('#todayLabel').textContent=new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'}).toUpperCase();apply();render();

/* ======================================================================= */
/* Supabase cloud layer — layered on top of the app above.                 */
/* Nothing above this line was changed: db/me()/save()/render() still work */
/* exactly as before and keep the localStorage copy as an offline cache.   */
/* ======================================================================= */
const MIGRATION_KEY='recallly-migrated';
let cloudUser=null,cloudReady=false;

/* --- field-name mapping: app.js uses camelCase, Supabase uses snake_case --- */
const toRow=t=>({id:t.id,title:t.title,notes:t.notes,tag:t.tag,urgency:t.urgency,last_reviewed:t.lastReviewed||null,next_review:t.nextReview||null,repetitions:t.repetitions||0,history:t.history||[]});
const fromRow=r=>({id:r.id,title:r.title,notes:r.notes||'',tag:r.tag||'',urgency:r.urgency||'Moderate',lastReviewed:r.last_reviewed||'',nextReview:r.next_review||today(),repetitions:r.repetitions||0,history:r.history||[]});

/* --- per-mutation sync helpers, called after the existing local update --- */
async function cloudSyncTopic(t){if(!cloudUser)return;try{let{id,user_id,...patch}=toRow(t);await updateTopic(t.id,patch)}catch(err){console.error(err);toast('Topic sync failed. Changes are saved on this device.')}}
async function cloudInsertTopic(t){if(!cloudUser)return;try{await insertTopic(cloudUser.id,toRow(t))}catch(err){console.error(err);toast('Topic sync failed. Changes are saved on this device.')}}
async function cloudDeleteTopics(ids){if(!cloudUser||!ids.length)return;try{ids.length===1?await deleteTopic(ids[0]):await deleteTopics(ids)}catch(err){console.error(err);toast('Topic sync failed. Changes are saved on this device.')}}

/* --- migrate any existing localStorage topics into Supabase, once --- */
async function migrateLocalTopics(user,existingRows){
  if(existingRows.length>0||localStorage.getItem(MIGRATION_KEY)===user.id)return existingRows;
  let local=me().topics||[];
  if(!local.length){localStorage.setItem(MIGRATION_KEY,user.id);return existingRows}
  try{
    let uploaded=await bulkInsertTopics(user.id,local.map(toRow));
    localStorage.setItem(MIGRATION_KEY,user.id);
    toast('Your local topics were uploaded to your account.');
    return uploaded;
  }catch(err){console.error(err);toast('Migration failed. Your local topics are safe on this device.');return existingRows}
}

/* --- load profile + topics for a signed-in user, then render --- */
async function loadCloudData(user){
  try{
    let profile=await fetchProfile(user.id);
    if(!profile)profile=await upsertProfile(user.id,user.email);
    let rows=await fetchTopics(user.id);
    rows=await migrateLocalTopics(user,rows);
    let existing=db.profiles.find(p=>p.id==='me');
    existing.name=profile.display_name||user.email;
    existing.topics=rows.map(fromRow);
    db.active='me';
    cloudReady=true;
    render();
    toast('Cloud sync complete.');
  }catch(err){
    console.error(err);
    toast('Supabase offline. Showing the data saved on this device.');
  }
}

function showAuthDialog(message){
  $('#authNote').textContent=message||'Your topics and review history sync securely across every device you sign in on.';
  if(!$('#authDialog').open)$('#authDialog').showModal();
}
function hideAuthDialog(){if($('#authDialog').open)$('#authDialog').close()}

$('#authLoginButton').onclick=async()=>{
  let email=$('#authEmail').value.trim(),password=$('#authPassword').value;
  if(!email||!password)return toast('Enter an email and password.');
  try{await login(email,password);toast('Welcome back.')}
  catch(err){console.error(err);toast(err.message||'Login failed.')}
};
$('#authSignupButton').onclick=async()=>{
  let email=$('#authEmail').value.trim(),password=$('#authPassword').value;
  if(!email||!password)return toast('Enter an email and password.');
  if(password.length<6)return toast('Password must be at least 6 characters.');
  try{await signup(email,password);toast('Account created. Check your email to confirm, then log in.')}
  catch(err){console.error(err);toast(err.message||'Signup failed.')}
};
$('#authForgotButton').onclick=async()=>{
  let email=$('#authEmail').value.trim();
  if(!email)return toast('Enter your email first.');
  try{await forgotPassword(email);toast('Password reset email sent.')}
  catch(err){console.error(err);toast(err.message||'Could not send reset email.')}
};
$('#logoutButton').onclick=async()=>{
  try{await logout();cloudReady=false;cloudUser=null;showAuthDialog('Signed out. Log in to sync your topics again.')}
  catch(err){console.error(err);toast('Logout failed.')}
};

if(navigator.onLine===false)toast('No internet connection. Showing data saved on this device.');

supabase.auth.onAuthStateChange((event,session)=>{
  if(session&&session.user){
    cloudUser=session.user;
    hideAuthDialog();
    loadCloudData(cloudUser);
  }else{
    cloudUser=null;
    showAuthDialog();
  }
});

requireLogin().then(user=>{
  if(user){cloudUser=user;loadCloudData(user)}
  else showAuthDialog();
}).catch(err=>{console.error(err);toast('Supabase offline. Showing the data saved on this device.')});
