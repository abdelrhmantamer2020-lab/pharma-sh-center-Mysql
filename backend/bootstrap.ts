import {rows,decode, type Database, type Collection} from './db';
export async function revisions(db:Database,tables:Collection[]){
  if(!tables.length)return {};
  const result=await rows(db,tables.map(t=>`SELECT '${t}' AS name,COUNT(*) AS n,COALESCE(SUM(version),0) AS v,COALESCE(CAST(MAX(updated_at) AS CHAR),'') AS stamp FROM \`${t}\``).join(' UNION ALL '));
  return Object.fromEntries(result.map(r=>[r.name,`${r.n}:${r.v}:${r.stamp}`]));
}
export async function readCollections(db:Database,tables:Collection[]){
  const result:Record<string,any[]>={};for(const t of tables)result[t]=[];if(!tables.length)return result;
  const sql=tables.map(t=>`SELECT '${t}' AS _collection,id,payload,version,updated_at,${t==='medicines'?'quantity,price,CAST(expiry_date AS CHAR) AS expiry_date,is_controlled':'NULL AS quantity,NULL AS price,NULL AS expiry_date,NULL AS is_controlled'} FROM \`${t}\``).join(' UNION ALL ')+' ORDER BY updated_at DESC,id';
  for(const row of await rows(db,sql)){
    const table=row._collection;delete row._collection;
    if(table!=='medicines'){delete row.quantity;delete row.price;delete row.expiry_date;delete row.is_controlled;}
    result[table].push(decode(row));
  }return result;
}
