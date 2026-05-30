import React,{useEffect,useState}from 'react'

const countries=[
 {code:'MEX',name:'Mexico'},{code:'RSA',name:'South Africa'},{code:'KOR',name:'Korea Republic'},{code:'CZE',name:'Czechia'},
 {code:'CAN',name:'Canada'},{code:'BIH',name:'Bosnia and Herzegovina'},{code:'QAT',name:'Qatar'},{code:'SUI',name:'Switzerland'},
 {code:'BRA',name:'Brazil'},{code:'MAR',name:'Morocco'},{code:'HAI',name:'Haiti'},{code:'SCO',name:'Scotland'},
 {code:'USA',name:'USA'},{code:'PAR',name:'Paraguay'},{code:'AUS',name:'Australia'},{code:'TUR',name:'Turkiye'},
 {code:'GER',name:'Germany'},{code:'CUW',name:'Curacao'},{code:'CIV',name:'Cote d Ivoire'},{code:'ECU',name:'Ecuador'},
 {code:'NED',name:'Netherlands'},{code:'JPN',name:'Japan'},{code:'SWE',name:'Sweden'},{code:'TUN',name:'Tunisia'},
 {code:'BEL',name:'Belgium'},{code:'EGY',name:'Egypt'},{code:'IRN',name:'IR Iran'},{code:'NZL',name:'New Zealand'},
 {code:'ESP',name:'Spain'},{code:'CPV',name:'Cabo Verde'},{code:'KSA',name:'Saudi Arabia'},{code:'URU',name:'Uruguay'},
 {code:'FRA',name:'France'},{code:'SEN',name:'Senegal'},{code:'IRQ',name:'Iraq'},{code:'NOR',name:'Norway'},
 {code:'ARG',name:'Argentina'},{code:'ALG',name:'Algeria'},{code:'AUT',name:'Austria'},{code:'JOR',name:'Jordan'},
 {code:'POR',name:'Portugal'},{code:'COD',name:'Congo DR'},{code:'UZB',name:'Uzbekistan'},{code:'COL',name:'Colombia'},
 {code:'ENG',name:'England'},{code:'CRO',name:'Croatia'},{code:'GHA',name:'Ghana'},{code:'PAN',name:'Panama'},
 {code:'FWC',name:'World Cup 26 Specials'}
]

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
  const n=chars.indexOf(ch)
  if(n<0) continue
  out.push(n%4,Math.floor(n/4)%4,Math.floor(n/16)%4)
 }
 return out.slice(0,total)
}

export default function App(){
 const total=countries.length*PER
 const [data,setData]=useState(()=>JSON.parse(localStorage.getItem(STORAGE)||'{}'))
 const [view,setView]=useState('all')
 const [search,setSearch]=useState('')
 const [backup,setBackup]=useState('')

 useEffect(()=>localStorage.setItem(STORAGE,JSON.stringify(data)),[data])

 function stickerId(countryIndex,number){
  return countryIndex*PER+number
 }

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
 const need=total-owned
 const q=search.trim().toLowerCase()
 const visibleCountries=countries
  .map((country,index)=>({...country,index}))
  .filter(country=>!q||country.code.toLowerCase().includes(q)||country.name.toLowerCase().includes(q))

 return <div className='min-h-screen bg-slate-950 text-white p-2'>
  <h1 className='text-2xl font-black text-center mb-2'>Panini Tracker</h1>

  <div className='flex flex-wrap justify-center gap-2 mb-3 text-xs font-bold'>
   <span className='bg-white/10 px-3 py-1 rounded-full'>Owned {owned}</span>
   <span className='bg-white/10 px-3 py-1 rounded-full'>Dup {dup}</span>
   <span className='bg-white/10 px-3 py-1 rounded-full'>Need {need}</span>
  </div>

  <div className='bg-white/10 rounded-2xl p-3 mb-3'>
   <textarea value={backup} onChange={e=>setBackup(e.target.value)} placeholder='Backup code' className='w-full h-16 bg-black/30 rounded-xl p-2 text-xs'/>
   <div className='flex gap-2 justify-center mt-2 text-xs font-black flex-wrap'>
    <button onClick={exportBackup} className='bg-white text-black px-3 py-2 rounded-full'>Export</button>
    <button onClick={()=>navigator.clipboard.writeText(backup)} className='bg-white/10 px-3 py-2 rounded-full'>Copy</button>
    <button onClick={importBackup} className='bg-white/10 px-3 py-2 rounded-full'>Import</button>
   </div>
  </div>

  <div className='flex gap-2 justify-center mb-3 text-xs font-black flex-wrap'>
   {['all','owned','duplicates','missing'].map(v=><button key={v} onClick={()=>setView(v)} className={`px-3 py-2 rounded-full ${view===v?'bg-white text-black':'bg-white/10'}`}>{v}</button>)}
  </div>

  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Search MEX or Mexico' className='w-full max-w-sm block mx-auto mb-3 bg-black/30 rounded-xl p-2 text-sm'/>

  <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
   {visibleCountries.map(country=>{
    const nums=[...Array(PER)].map((_,i)=>i+1).filter(n=>{
      const c=data[stickerId(country.index,n)]||0
      if(view==='owned') return c>0
      if(view==='duplicates') return c>1
      if(view==='missing') return c===0
      return true
    })

    if(!nums.length) return null

    return <div key={country.code} className='bg-white/10 rounded-2xl p-2'>
      <div className='flex justify-between mb-2 items-center gap-2'>
       <div>
        <h2 className='text-lg font-black leading-none'>{country.code}</h2>
        <p className='text-[10px] text-white/60 font-bold'>{country.name}</p>
       </div>
      </div>
      <div className='grid grid-cols-10 gap-1'>
       {nums.map(n=>{
        const id=stickerId(country.index,n)
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
