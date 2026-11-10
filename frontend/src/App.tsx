import { useEffect, useState } from 'react';
import { Activity, ArrowDownUp, Clock3, Github, RotateCcw, Sparkles } from 'lucide-react';
import { calculate, type Operation } from './api';

type HistoryItem = { expression:string; result:string; time:string };
const operations: {label:string; op:Operation; symbol:string}[] = [
  {label:'Add',op:'add',symbol:'+'},{label:'Subtract',op:'subtract',symbol:'−'},
  {label:'Multiply',op:'multiply',symbol:'×'},{label:'Divide',op:'divide',symbol:'÷'},
  {label:'Power',op:'power',symbol:'xʸ'},{label:'Square root',op:'sqrt',symbol:'√'},{label:'Percent',op:'percent',symbol:'%'}
];
const pretty = (n:number) => Number.isInteger(n) ? String(n) : String(Number(n.toFixed(8)));
export default function App(){
  const [first,setFirst]=useState(''); const [second,setSecond]=useState('');
  const [operation,setOperation]=useState<Operation>('add'); const [result,setResult]=useState<string>('0');
  const [expression,setExpression]=useState('Ready when you are'); const [error,setError]=useState('');
  const [busy,setBusy]=useState(false); const [history,setHistory]=useState<HistoryItem[]>([]);
  const unary=operation==='sqrt';
  const symbol=operations.find(x=>x.op===operation)?.symbol ?? '+';
  const clear=()=>{setFirst('');setSecond('');setResult('0');setExpression('Ready when you are');setError('');};
  const run=async()=>{
    const a=Number(first), b=Number(second);
    if(first.trim()==='' || !Number.isFinite(a) || (!unary && (second.trim()==='' || !Number.isFinite(b)))){setError('Please enter valid number(s) first.');return;}
    setBusy(true);setError('');
    try { const value=await calculate(operation,a,b); const shown=pretty(value); const expr=unary?`√ ${pretty(a)}`:`${pretty(a)} ${symbol} ${pretty(b)}`; setResult(shown);setExpression(expr);setHistory(h=>[{expression:expr,result:shown,time:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})},...h].slice(0,6)); }
    catch(e){setError(e instanceof Error?e.message:'Unable to calculate.');}
    finally{setBusy(false);}
  };
  useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape'){clear();return;} if(e.key==='Enter'){void run();}};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey);});
  return <main className="page-shell"><div className="ambient ambient-one"/><div className="ambient ambient-two"/>
    <header className="topbar"><a className="brand" href="#top"><span className="brand-mark"><Sparkles size={19}/></span><span>sunny<span className="brand-dot">.</span></span></a><div className="topbar-right"><span className="live-dot"/> API connected <span className="topbar-divider"/> <span className="version">GO + REACT</span></div></header>
    <section className="hero" id="top"><div className="eyebrow"><span className="eyebrow-star">✳</span> YOUR LITTLE MOMENT OF CLARITY</div><h1>Make numbers<br/><span>feel sunny.</span></h1><p>A little math, a lot less friction. Your everyday calculations, made delightful.</p></section>
    <section className="workspace"><div className="calculator-card">
      <div className="card-top"><div><span className="card-kicker">THE CALCULATOR</span><h2>Let’s work it out<span>.</span></h2></div><button className="icon-button" onClick={clear} aria-label="Clear calculator"><RotateCcw size={17}/></button></div>
      <div className="display"><div className="display-label">{expression}</div><div className="display-result" aria-live="polite">{result}<span className="cursor">_</span></div><div className="display-bottom"><span><Activity size={13}/> LIVE RESULT</span><span>↗ PRECISION MODE</span></div></div>
      <div className="input-grid"><label>FIRST NUMBER<input data-field="first" inputMode="decimal" value={first} onChange={e=>{setFirst(e.target.value);setError('');}} placeholder="e.g. 128"/></label><label>{unary?'NOT NEEDED':'SECOND NUMBER'}<input data-field="second" inputMode="decimal" value={second} onChange={e=>{setSecond(e.target.value);setError('');}} placeholder={unary?'Square root uses one number':'e.g. 24'} disabled={unary}/></label></div>
      <div className="operation-heading"><span>CHOOSE AN OPERATION</span><span>7 AVAILABLE</span></div><div className="operations">{operations.map(item=><button key={item.op} className={`operation ${operation===item.op?'selected':''}`} onClick={()=>{setOperation(item.op);setError('');}} aria-pressed={operation===item.op}><span className="op-symbol">{item.symbol}</span><span>{item.label}</span></button>)}</div>
      {error&&<div className="error-message" role="alert"><span>!</span>{error}</div>}
      <button className="calculate-button" onClick={()=>void run()} disabled={busy}><span>{busy?'Calculating...':'Calculate result'}</span><span className="button-arrow">↗</span></button>
      <div className="keyboard-hint"><span>↵</span> Press enter to calculate <span className="hint-separator">·</span> <span>esc</span> to clear</div>
    </div>
    <aside className="side-column"><div className="history-card"><div className="side-heading"><div><span className="card-kicker">THE RECAP</span><h3>Recent activity</h3></div><Clock3 size={18}/></div>{history.length===0?<div className="empty-history"><div className="empty-icon"><ArrowDownUp size={20}/></div><strong>Your history lives here.</strong><p>Run your first calculation and it’ll show up right here.</p></div>:<div className="history-list">{history.map((item,i)=><button className="history-item" key={`${item.time}-${i}`} onClick={()=>{setExpression(item.expression);setResult(item.result);}}><span><strong>{item.expression}</strong><small>{item.time}</small></span><b>{item.result}</b></button>)}</div>}</div>
      <div className="tip-card"><div className="tip-icon"><Sparkles size={18}/></div><div><span className="card-kicker">A LITTLE TIP</span><p>Good things happen when you make room for <strong>curiosity.</strong> Keep calculating.</p></div><span className="tip-sun">☼</span></div>
      <div className="api-note"><span className="api-pulse"/><div><strong>Powered by a Go API</strong><small>Every result is calculated server-side.</small></div><span className="api-tag">REST</span></div>
    </aside></section>
    <footer><span>© 2026 SUNNY CALCULATOR</span><span>MADE FOR THE LOVE OF LOGIC <span className="footer-heart">♥</span></span><a href="https://github.com/" target="_blank" rel="noreferrer"><Github size={14}/> GITHUB</a></footer>
  </main>;
}
