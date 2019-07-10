/*
    This file contains the logic for adding data to the DB and building out a postings list. 
    It makes more sense if you know the problems we're working around so here goes: 

    We need to maintain a map from tokens to document ids
    We need to maintain another map from tokens to their document frequency
    We want to do this in a transaction, so that if it fails the user isn't in some undefined state
    
    But
    If you do one transaction that is very big, the browser crashes.
    Depending on the size of the file, it can get pretty slow pretty fast, so the user is likely to leave
    We want it to be as fast as possible or at least unslow. 

    We need to be able to support new documents, that is update the postings list and df table

    So here's what we do when new documents come in
    1.1. We insert all of them into the data table in one transaction
    1.2. Within the same transaction, we calculate all of the trigrams in the set of documents and which docs they map to
    1.3. We then insert that into the postings_que table. This is done in a series of bulk inserts but within one transaction. 
    1.4. we mark all the items in the postings queue as new
    1.5. We search the postings table for any of the terms, those that exist in it are marked as existing in the postings queue table

    End of first transaction. Now we need to update the df and postings table
    This has two parts, inserting new tokens into the df and postings table, and then updating existing tokens 
    This part is slow, so we do it in chunks, isolating each chunk in a transaction. Then we can pick up where we left off. 
    It goes like this

    2.1         Scan the postings queue table for new terms. 
    2.1.1       Split the terms into chunks
    2.1.2       for each chunk
    2.1.2.1        open a new transaction
    2.1.2.2        Insert the terms in the chunk  into the postings table and df table
    2.1.2.3        delete the terms in the chunk  them from the postings queue table 
    2.1.2.4        end of transaction

    2.2         Scan the postings queue table for existing terms (at this point it should be all that remains there)
    2.2.1       Split the terms into chunks
    2.2.2       for each chunk
    2.2.2.1         open a new transaction
    2.2.2.2             Update the postings table (in practice we do this we a where clause and modify function) 
    2.2.2.2.1           for each term in the chunk, find it in the postings table
    2.2.2.2.2               append the docs in the term to the docs already set in the postings table
    2.2.2.3                 update the df table (in practice we do this we a where clause and modify function) 
    2.2.2.3.1           for each term in the chunk, find it in the df table
    2.2.2.3.2               set the freq of the item in the df table to be itself + the doc freq of the item in the chunk
    2.2.2.4             delete the items in the chunk from the postings queue table
    2.2.2.5         end of transaction


    
*/

import { dfTable, postingsTable, dataTable, postingsQueueTable, POSTING_QUEUE_SCHEMA, POSTINGS_SCHEMA, DF_SCHEMA } from "./dexiewDB";
import Dexie from "dexie";
import { getTrigramsCount } from "./tokenizationUtils";
/*
    We need to update the document frequency table when a user adds data. 
    Doing this naively is super slow, so instead, after a file has been uploaded, we'll do an update and then an inserton the df tabke
*/


export const enqueTermsToBePosted = async (docs) => {
    // This needs to be run on all docs at the start of a transction. 
    // Then we insert the docs themselves in smaller batches
    // We can be smart here, and mark anything in the postings table that has been touched as needing an update; 
    let termsToBePosted = {};
    let t1 = new Date()
    let t2 = new Date()

    docs.forEach(doc => { //This is super flow and inefficent. 
        const trigramCounts = getTrigramsCount(doc.content)
        Object.entries(trigramCounts).forEach(([trigram, freq]) => {
            termsToBePosted[trigram] = termsToBePosted[trigram] || [] // if it doesn't exist make an empty array
            termsToBePosted[trigram].push({ id: doc.id, freq });


        })
    })
    t2 = new Date()
    console.log(`It tokk ${t2 - t1} to make a postings list`);
    //Now we reshape it into a form that we can insert

    const termsToBePostedArray = Object.entries(termsToBePosted).map(([trigram, docs]) => ({ trigram, docs, newTerm: 1 })); // Mark all as a new term
    const startTime = new Date();
    const step = 10000;
    let r1;
    for (let i = 0; i <= termsToBePostedArray.length; i += step) {
        t1 = new Date()
        r1 = await postingsQueueTable.bulkAdd(termsToBePostedArray.slice(i, i + step))
        t2 = new Date()
        console.log(`Inserted ${step} postings in ${t2 - t1} ms. ${termsToBePostedArray.length - i} remaining`)
    }

    const existingTerms = await postingsTable.where("trigram").anyOf(Object.keys(termsToBePosted)).primaryKeys() // Will only return terms that are in the postings table
    // Now mark the que table with terms that are not new
    await postingsQueueTable.where("trigram").anyOf(existingTerms).modify({ newTerm: 0 });


}
export const addDocsToStore = async (docs) => {
    let t1 = new Date()
    await dataTable.bulkAdd(docs);
    let t2 = new Date()

    const insertDUration = t2 - t1;
    console.log(`It took ${insertDUration} to insert ${docs.length} docs`)
    t1 = new Date()



    const endTime = new Date();
    // console.log(`Added ${termsToBePosted.length}  in ${endTime-startTime} ms for doc ${docs.length}`)
    return null;

}

export const moveNewTermsFromPostingsQueueToPostingsTable = async (db) => {
    const step = 1000;
    let collection = postingsQueueTable.where("newTerm").equals(1).limit(step)
    let terms = await collection.toArray()
    debugger;

    while (terms.length > 0) {
        await db.transaction('rw', [DF_SCHEMA, POSTING_QUEUE_SCHEMA, POSTINGS_SCHEMA], async tx => {
            let t1 = new Date()
            const insertResults = await postingsTable.bulkAdd(terms)
            await dfTable.bulkAdd(terms.map(x => ({ trigram: x.trigram, freq: x.docs.length })))
            await collection.delete()
            collection = postingsQueueTable.where("newTerm").equals(1).limit(step)
            terms = await collection.toArray()
            let t2 = new Date()
            console.log(`moved ${terms.length} items from postings que`)

        })
    }
}
const getTermsMap = (terms) => terms.reduce((map, termObj) => {
    map[termObj.trigram] = termObj
    return map
}, {})

const appendIngLogic = async (db)=>{

}
export const appendDocsFromQueueToExistingPostingsItems = async (db) => {
    //Get the terms that need to be updated
    const step = 400; //This is low because larger values give an IPC error
    let collection = postingsQueueTable.where("newTerm").equals(0).limit(step);

    let terms = await collection.toArray()
    debugger;
    console.log(`Got ${terms.length} terms to update in postings table`)
    let termsMap = getTermsMap(terms)

    let termKeys = Object.keys(termsMap);

    console.log(`Term map built`)
    do {
        let t1 = new Date()
            await db.transaction('rw', [DF_SCHEMA, POSTING_QUEUE_SCHEMA, POSTINGS_SCHEMA], async tx => {
            let collection = postingsQueueTable.where("newTerm").equals(0).limit(step);
            let terms = await collection.toArray()
            if (terms.length ===0){
            }
            else{

// Linter warns us about something potentially quite bad https://eslint.org/docs/rules/no-loop-func
            await postingsTable.where("trigram").anyOf(termKeys).modify(posting => {
                const newDocIds = termsMap[posting.trigram].docs
                posting.docs = posting.docs.concat(newDocIds);
            })
            await dfTable.where("trigram").anyOf(termKeys).modify(df => {

                df.freq = df.freq + termsMap[df.trigram].docs.length
            })

            await collection.delete()
         

            }
        })
        let t2 = new Date();
        console.log(`Updated ${step} terms in postings table in ${t2 - t1} ms`)
    } while( (await postingsQueueTable.where("newTerm").equals(0).count() ) >0)

}