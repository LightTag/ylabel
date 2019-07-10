//From https://raw.githubusercontent.com/dfahlander/Dexie.js/master/samples/full-text-search/FullTextSearch.js

/*
    This example is a simple implementation of full-text search based on multi-valued indexes and Dexie hooks.
    NOTE: Multi-valued indexes are only supported in Opera, Firefox and Chrome. Does not work with IE so far.
    To see an example that works with IE, see FullTextSearch2.js.
*/
import Dexie from 'dexie'
import { getTrigrams, getTrigramsCount } from './tokenizationUtils';
import { searchForTrigrams } from './queryFunctions';
import { LABEL_FILTER_OPTIONS } from '../searchContext';
import { updateDFTableAfterInsert, addDocsToStore, enqueTermsToBePosted, moveNewTermsFromPostingsQueueToPostingsTable, appendDocsFromQueueToExistingPostingsItems } from './insertionUtils';
var hash = require('object-hash');

const DBNAME = 'DATA'
export const DATA_SCHEMA = 'data'
export const POSTINGS_SCHEMA = 'positings'
export const DF_SCHEMA = 'document_frequency'; // Stores how many documents each trigram appeared in 
export const POSTING_QUEUE_SCHEMA = 'postings_queue'
const CLASS_SCHEMA = 'schema'
const QUERY_SCHEMA = 'query'
var db = new Dexie(DBNAME);
const stores = {}
stores[POSTINGS_SCHEMA] = "trigram" // term,doc_id, maps each token to an object of (docId:freq)

stores[DATA_SCHEMA] = "id,human_label,model_label,[has_label+id]" // and content,class
stores[CLASS_SCHEMA] = "++id,name"
stores[QUERY_SCHEMA] = "++id,*docIds"
stores[DF_SCHEMA] = "trigram,[trigram+freq]" // compund index lets us filter and sort for least frequent df
stores[POSTING_QUEUE_SCHEMA] ="trigram,added,newTerm" // Maps each trigram to doc ids that need to be added to the postings list




const initializeDB = () => {
    db.version(1).stores(stores);
    const initializeDataDB = () => {

        // Open database to allow application code using it.
        db.open();

    }
    initializeDataDB()


}

initializeDB()
// Add hooks that will index "content" for full-text search:

export const dataTable = db[DATA_SCHEMA]
export const postingsTable = db[POSTINGS_SCHEMA];
export const dfTable = db[DF_SCHEMA];
export const postingsQueueTable = db[POSTING_QUEUE_SCHEMA];

export const addData = async (data)=>{
    await db.transaction('rw',[DATA_SCHEMA,DF_SCHEMA,POSTING_QUEUE_SCHEMA,POSTINGS_SCHEMA],async tx=>{

        //First we enque all the terms to be added to the posting list
        await enqueTermsToBePosted(data);
        const step = 10000
        for (let i=0; i<data.length; i+=step){
            await addDocsToStore(data.slice(i, i+step))
        
        }
        // Now we can add the actual data

        //Now we update the DF table
        // return updateDFTableAfterInsert();

        //And then move the queed terms into the postings table
    });

    //Now a new transaction to move the data into the postings and df table
        let t1 = new Date()
        await moveNewTermsFromPostingsQueueToPostingsTable(db)
        let t2 = new Date ()
        console.log(`Moved from que to postings table in ${t2-t1} ms`)
        t1 = new Date()
        await appendDocsFromQueueToExistingPostingsItems(db);
        t2 = new Date ()
        console.log(`Appeneded docs to posting from queue in ${t2-t1} ms`)
}


export const search = async (query, params) => {
    let candidateDocIds
    if (query === undefined || query === null || query.length === 0) {
        candidateDocIds = await dataTable.toCollection().primaryKeys()
    } else {
        const terms = Object.keys(getTrigramsCount(query));
        candidateDocIds = await searchForTrigrams(terms);
    }
    let result
    switch (params.labelFilter) {
        case LABEL_FILTER_OPTIONS.ALL:
            result = dataTable.where("id").anyOf(candidateDocIds)
            break;
        case LABEL_FILTER_OPTIONS.LABELED:
            result = dataTable.where('[has_label+id]').anyOf(candidateDocIds.map(id => [1, id]))
            break;
        case LABEL_FILTER_OPTIONS.UNLABELED:

            const idsToExclude = new Set(await dataTable.where('[has_label+id]').anyOf(candidateDocIds.map(id => [1, id])).primaryKeys())
            const idsToGet = candidateDocIds.filter(x => !idsToExclude.has(x))
            result = dataTable.where("id").anyOf(idsToGet)
            break

        default:
            throw new Error(params.labelFilter)
    }

    if (query && query.length > 0) {
        return result.filter(x => x.content.search(query) != -1).primaryKeys()
    } else {
        return result.primaryKeys()
    }

    // Finnaly, filter to find the exact query


}

export const regexSearch = (pattern) => {

    try {
        //temp try catch block to avoid execptions when partial pattern is sent


        const regex = new RegExp(pattern)
        return db[DATA_SCHEMA].filter(doc => regex.test(doc.content)).primaryKeys()
            .then(matchingDocumentIds => {
                const queryCacheObject = {
                    "id": hash(pattern),
                    docIds: matchingDocumentIds
                }
                db[QUERY_SCHEMA].add(queryCacheObject)
                return matchingDocumentIds
            })
    }
    catch (e) {
        return Dexie.Promise.resolve([])
    }

}

export const first = (n = 20) => {
    return db[DATA_SCHEMA].limit(100).primaryKeys()
}
export const resetAll = () => {
    return Dexie.Promise.all([
        db[DATA_SCHEMA].clear(),
        db[CLASS_SCHEMA].clear()
    ])
}

export const getDocById = (id) => {
    return db[DATA_SCHEMA].get(id)
}
export const addSchemaClass = (name, color, ) => {

    return db[CLASS_SCHEMA].add({ name, color })
}

export const getSchemaClasses = () => {
    return db[CLASS_SCHEMA].toArray()
}

export const applyClassToExample = (exampleId, className) => {
    return db[DATA_SCHEMA].update(exampleId, { human_label: className, has_label: 1 })
}

export const getExampleCount = () => dataTable.count()