import React,{useEffect,useMemo,useState}from 'react'

const teams=['MEX','RSA','KOR','CZE','CAN','BIH','QAT','SUI','HAI','SCO','BRA','MAR','USA','PAR','AUS','TUR','CIV','ECU','GER','CUW','NED','JPN','SWE','TUN','IRN','NZL','BEL','EGY','KSA','URU','ESP','CPV','FRA','SEN','IRQ','NOR','ARG','ALG','AUT','JOR','POR','COD','UZB','COL','GHA','PAN','ENG','CRO','FWC']
const STORAGE='panini-tracker'
const PER=20
const chars='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_'

function encode(arr){
 let out=''
 for(let i=0;i<arr.length;i+=3){
  const a=arr[i]||0,b=arr[i+1]||0,c=arr[i+2]||0
  out+=chars[a+b*4+c*16]
 }
 return out.replace(/0+$/,'')||'0'
}

function decode(str,total){
 const out=[]
 for(const ch of str){
  const n=Math.max(0,chars.indexOf(ch))
  out.push(n%4,Math.floor(n/4)%4,Math.floor(n/16)%4)
 }
 return out.slice(0,total)
}

export default function App(){
 const total=teams.length*PER
 const [data,setData]=useState(()=>JSON.parse(localStorage.getItem(STORAGE)||'{}'))
 const [view,setView]=useState('all')
 const [search,setSearch]=useState('')
 const [backup,setBackup]=useState('')

 useEffect(()=>localStorage.setItem(STORAGE,JSON.stringify(data)),[data])

 function tap(id){
  setData(v=>{
   const n={...v}
   n[id]=(n[id]||0)+1
   if(n[id]>3) delete n[id]
   return n
  })
 }

 function exportBackup(){
  const arr=[]
  for(let i=1;i<=total;i++) arr.push(data[i]||0)
  setBackup(encode(arr))
 }

 function importBackup(){
  const arr=decode(backup,total)
  const next={}
  arr.forEach((v,i)=>{if(v>0)next[i+1]=v})
  setData(next)
 }

 const owned=Object.values(data).filter(v=>v>0).length
 const dup=Object.values(data).reduce((a,b)=>a+Math.max(0,b-1),0)

 return <div className='min-h-screen bg-slate-950 text-white p-2'>
  <h1 className='text-2xl font-black text-center mb-2'>Panini Tracker</h1>

  <div className='flex flex-wrap justify-center gap-2 mb-3 text-xs font-bold'>
   <span className='bg-white/10 px-3 py-1 rounded-full'>Owned {owned}</span>
   <span className='bg-white/10 px-3 py-1 rounded-full'>Dup {dup}</span>
  </div>

  <div className='bg-white/10 rounded-2xl p-3 mb-3'>
   <textarea value={backup} onChange={e=>setBackup(e.target.value)} className='w-full h-16 bg-black/30 rounded-xl p-2 text-xs'/>
   <div className='flex gap-2 justify-center mt-2 text-xs font-black'>
    <button onClick={exportBackup} className='bg-white text-black px-3 py-2 rounded-full'>Export</button>
    <button onClick={()=>navigator.clipboard.writeText(backup)} className='bg-white/10 px-3 py-2 rounded-full'>Copy</button>
    <button onClick={importBackup} className='bg-white/10 px-3 py-2 rounded-full'>Import</button>
   </div>
  </div>

  <div className='flex gap-2 justify-center mb-3 text-xs font-black flex-wrap'>
   {['all','owned','duplicates','missing'].map(v=><button key={v} onClick={()=>setView(v)} className={`px-3 py-2 rounded-full ${view===v?'bg-white text-black':'bg-white/10'}`}>{v}</button>)}
  </div>

  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Search country' className='w-full max-w-sm block mx-auto mb-3 bg-black/30 rounded-xl p-2 text-sm'/>

  <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
   {teams.filter(t=>t.toLowerCase().includes(search.toLowerCase())).map((team,t)=>{
    const nums=[...Array(PER)].map((_,i)=>i+1).filter(n=>{
      const c=data[t*PER+n]||0
      if(view==='owned') return c>0
      if(view==='duplicates') return c>1
      if(view==='missing') return c===0
      return true
    })

    if(!nums.length) return null

    return <div key={team} className='bg-white/10 rounded-2xl p-2'>
      <div className='flex justify-between mb-2'>
       <h2 className='text-lg font-black'>{team}</h2>
      </div>
      <div className='grid grid-cols-10 gap-1'>
       {nums.map(n=>{
        const id=t*PER+n
        const c=data[id]||0
        return <button key={n} onClick={()=>tap(id)} className={`aspect-square rounded-md text-[10px] font-black relative ${c>1?'bg-yellow-300 text-black':c===1?'bg-white text-black':'bg-black/25 text-white/60'}`}>
         {n}
         {c>1&&<span className='absolute -top-1 -right-1 text-[8px] bg-black text-white rounded-full px-1'>{c}</span>}
        </button>
       })}
      </div>
    </div>
   })}
  </div>
 </div>
}
