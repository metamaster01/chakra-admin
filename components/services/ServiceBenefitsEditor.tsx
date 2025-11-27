"use client";

export default function ServiceBenefitsEditor({
  benefits, onChange
}:{ benefits:string[]; onChange:(b:string[])=>void }) {
  function update(i:number,v:string){
    onChange(benefits.map((x,idx)=>idx===i?v:x));
  }
  function add(){
    onChange([...benefits, ""]);
  }
  function remove(i:number){
    onChange(benefits.filter((_,idx)=>idx!==i));
  }

  return (
    <div className="bg-gray-50 border rounded-2xl p-4">
      <h4 className="font-semibold mb-2">Benefits</h4>
      <div className="space-y-2">
        {benefits.map((b,i)=>(
          <div key={i} className="flex gap-2">
            <input
              className="flex-1 border rounded-xl px-3 py-2 text-sm bg-white"
              placeholder={`Benefit ${i+1}`}
              value={b}
              onChange={(e)=>update(i,e.target.value)}
            />
            {benefits.length>1 && (
              <button onClick={()=>remove(i)} className="text-xs px-3 rounded-xl border bg-white">
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      <button onClick={add} className="mt-3 text-xs px-3 py-1.5 rounded-xl bg-white border">
        + Add benefit
      </button>
    </div>
  );
}
