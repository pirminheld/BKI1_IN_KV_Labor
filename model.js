(function(root){
'use strict';
const vars=['A','B','C','D'];
function layout(n){const cols=n===2?[[1],[0]]:[[1,1],[1,0],[0,0],[0,1]],rows=n===4?[[1,1],[1,0],[0,0],[0,1]]:[[1],[0]];return {w:cols.length,h:rows.length,cells:rows.flatMap((r,y)=>cols.map((c,x)=>{const bits=n===2?[c[0],r[0]]:n===3?[c[0],r[0],c[1]]:[c[0],r[0],c[1],r[1]];return {bits,id:parseInt(bits.join(''),2),x,y};}))};}
function bits(id,n){return id.toString(2).padStart(n,'0').split('').map(Number);}
function describe(ids,n){if(!ids.length)return null;const b=ids.map(id=>bits(id,n));const fixed=vars.slice(0,n).map((name,i)=>({name,value:b.every(v=>v[i]===b[0][i])?b[0][i]:null}));const free=fixed.filter(x=>x.value===null);return {fixed,free,term:fixed.filter(x=>x.value!==null).map(x=>(x.value?'':'¬')+x.name).join(' ∧ ')||'1'};}
function validate(ids,values,n){ids=[...new Set(ids)];if(!ids.length)return {ok:false,reason:'Wähle zuerst mindestens ein Eins-Feld aus.'};if(ids.some(id=>values[id]!==1))return {ok:false,reason:'Eine Eins-Gruppe darf keine Null enthalten.'};if((ids.length&(ids.length-1))!==0)return {ok:false,reason:'Die Gruppengröße muss 1, 2, 4, 8 oder 16 sein. Drei oder sechs Felder sind keine gültige Gruppe.'};const info=describe(ids,n);if(2**info.free.length!==ids.length)return {ok:false,reason:'Diese Felder bilden keine rechteckige Nachbargruppe. Diagonal reicht nicht. Gegenüberliegende Ränder zählen dagegen als benachbart.'};return {ok:true,...info};}
function allGroups(values,n){const out=[];function rec(pattern){if(pattern.length===n){const ids=values.flatMap((v,id)=>v===1&&pattern.every((p,i)=>p===null||p===bits(id,n)[i])?[id]:[]);if(ids.length===2**pattern.filter(x=>x===null).length)out.push(ids);return;}for(const b of [0,1,null])rec([...pattern,b]);}rec([]);return out;}
function primes(values,n){const all=allGroups(values,n);return all.filter(a=>!all.some(b=>b.length>a.length&&a.every(x=>b.includes(x))));}
function solve(values,n){const ones=values.flatMap((v,id)=>v===1?[id]:[]);if(!ones.length)return [];const ps=primes(values,n).sort((a,b)=>b.length-a.length);let best=null,bestLit=Infinity;const seen=new Map();function go(groups,covered){const key=[...covered].sort((a,b)=>a-b).join(',');if(seen.has(key)&&seen.get(key)<groups.length)return;seen.set(key,groups.length);const missing=ones.find(id=>!covered.has(id));if(missing===undefined){const lit=groups.reduce((s,g)=>s+n-Math.log2(g.length),0);if(!best||groups.length<best.length||groups.length===best.length&&lit<bestLit){best=groups;bestLit=lit;}return;}if(best&&groups.length>=best.length)return;for(const g of ps.filter(g=>g.includes(missing)))go([...groups,g],new Set([...covered,...g]));}go([],new Set());return best||[];}
function equation(groups,n){return groups.length?groups.map(g=>'('+describe(g,n).term+')').join(' ∨ '):'0';}
const presets=[
{id:'start',label:'Einstieg · B bleibt gleich',n:2,fn:([a,b])=>b},
{id:'overlap',label:'Zwei Variablen · Überlappung',n:2,fn:([a,b])=>a||b},
{id:'diagonal',label:'Zwei Variablen · Diagonale',n:2,fn:([a,b])=>a===b},
{id:'enable',label:'Drei Variablen · Freigabe (Aufgabe 11)',n:3,fn:([a,b,c])=>!a&&b},
{id:'edge',label:'Drei Variablen · Randgruppe (Aufgabe 12)',n:3,fn:([a,b,c])=>c},
{id:'four',label:'Vier Variablen · Zwei Gruppen (Aufgabe 13)',n:4,fn:([a,b,c,d])=>a&&b||c&&d},
{id:'eight',label:'Vier Variablen · Achtergruppe',n:4,fn:([a,b,c,d])=>d},
{id:'corners',label:'Vier Variablen · Ecken und Mitte',n:4,fn:([a,b,c,d])=>c===d}
];
const api={layout,bits,describe,validate,allGroups,primes,solve,equation,presets,values:p=>Array.from({length:2**p.n},(_,id)=>Number(!!p.fn(bits(id,p.n))))};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.KV=api;
})(globalThis);
