import { dfTable, postingsTable, dataTable } from "./dexiewDB";
import Dexie from "dexie";
import { getTrigramsCount } from "./tokenizationUtils";
/*
    We need to update the document frequency table when a user adds data. 
    Doing this naively is super slow, so instead, after a file has been uploaded, we'll do an update and then an inserton the df tabke
*/

export const updateDFTableAfterInsert =async ()=>{
    debugger;
    const inTable = (await  dfTable.toCollection().primaryKeys());
    let notInTable = await postingsTable.where("trigram").noneOf(inTable).primaryKeys() //This is still super slow
    const step =1000;
    const dfToInsert = notInTable
    .reduce((toInsert,[trigram,docId])=>{
        toInsert[trigram] =  toInsert[trigram]? toInsert[trigram]+1 : 1;
        return toInsert
    },{}
    )
    const dfToInsertArray = Object.entries(dfToInsert).map(
        ([trigram,freq])=>{
            return {trigram,freq}
        }
        )
    for (let i =0; i<dfToInsertArray.length;i+=step){
        let t1= new Date()
        await dfTable.bulkAdd(dfToInsertArray.slice(i,i+step))
        let t2 = new (Date);
        console.log(`Inserted ${step} items to df table in ${t2-t1} ms. ${dfToInsertArray.length -i} terms remaining`)
    }
    
    console.log(`Inserting to df table`)
    return 

}

export const addDocsToStore = async (docs)=>{
    let t1  = new Date()
        await dataTable.bulkAdd(docs);
    let t2  = new Date()
    const insertDUration = t2-t1;
    console.log(`It took ${insertDUration} to insert ${docs.length} docs`)
    t1  = new Date()
    const postings = docs.flatMap(doc=>{
        const trigramCounts = getTrigramsCount(doc.content)
        const postings = Object.entries(trigramCounts).map(([trigram, freq]) => ({ trigram, docId:doc.id, freq }));
        return postings;
    })
    t2  = new Date()
    console.log(`It tokk ${t2-t1} to make ${postings.length} postings`);
    const startTime = new Date();
    const step =10000;
    let r1;
    for (let i=0;i<=postings.length;i+=step){
        t1  = new Date()
        r1 =  await postingsTable.bulkAdd(postings.slice(i,i+step))
        t2  = new Date()
        console.log(`Inserted ${step} postings in ${t2-t1} ms. ${postings.length-i} remaining`)
    }
    
    const endTime = new Date();
    console.log(`Added ${postings.length}  in ${endTime-startTime} ms for doc ${docs.length}`)
    return r1;

}