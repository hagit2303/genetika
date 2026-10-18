// ניווט משותף לכל הגרסאות: חיצים, מקלדת, החלקה, פס התקדמות, תשובות נפתחות
(function(){
const S=[...document.querySelectorAll('.s')];let i=0;
const cnt=document.getElementById('cnt'),bar=document.getElementById('prog');
function go(n){i=Math.max(0,Math.min(S.length-1,n));S.forEach((s,k)=>s.classList.toggle('on',k===i));
 if(cnt)cnt.textContent=(i+1)+' / '+S.length;if(bar)bar.style.setProperty('--p',((i+1)/S.length*100)+'%');
 try{history.replaceState(null,'','#s'+(i+1))}catch(e){}}
const nx=document.getElementById('next'),pv=document.getElementById('prev');
if(nx)nx.onclick=()=>go(i+1);if(pv)pv.onclick=()=>go(i-1);
addEventListener('keydown',e=>{if(['ArrowLeft','PageDown',' '].includes(e.key)){e.preventDefault();go(i+1)}
 if(['ArrowRight','PageUp'].includes(e.key)){e.preventDefault();go(i-1)}});
let tx=null;addEventListener('touchstart',e=>tx=e.touches[0].clientX,{passive:true});
addEventListener('touchend',e=>{if(tx==null)return;const d=e.changedTouches[0].clientX-tx;if(Math.abs(d)>60)go(i+(d>0?1:-1));tx=null});
document.querySelectorAll('.rev').forEach(b=>b.onclick=()=>b.nextElementSibling.classList.toggle('show'));
document.querySelectorAll('.k-q').forEach(q=>q.querySelectorAll('.op').forEach(o=>o.onclick=()=>{
 o.classList.add(o.dataset.ok==='1'?'ok':'no');if(o.dataset.ok==='1'){const w=q.querySelector('.why');if(w)w.classList.add('show')}}));
window.goSlide=go;
const m=/#s(\d+)/.exec(location.hash);go(m?+m[1]-1:0);
})();
