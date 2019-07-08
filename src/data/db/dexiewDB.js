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
var hash = require('object-hash');

const DBNAME = 'DATA'
export const DATA_SCHEMA = 'data'
export const POSTINGS_SCHEMA = 'positings'
export const DF_SCHEMA = 'document_frequency'; // Stores how many documents each trigram appeared in 
const CLASS_SCHEMA = 'schema'
const QUERY_SCHEMA = 'query'
var db = new Dexie(DBNAME);
const stores = {}
stores[POSTINGS_SCHEMA] = "[trigram+docId]" // term,doc_id, frequency

stores[DATA_SCHEMA] = "++id,human_label,model_label,[has_label+id]" // and content,class

stores[CLASS_SCHEMA] = "++id,name"
stores[QUERY_SCHEMA] = "++id,*docIds"
stores[DF_SCHEMA] ="trigram,[trigram+freq]" // compund index lets us filter and sort for least frequent df




const initializeDB = () => {
    db.version(1).stores(stores);
    const initializeDataDB = () => {

        db._createTransaction = Dexie.override(db._createTransaction, function (createTransaction) {
            // Override db._createTransaction() to make sure to add postings schema  table to any transaction being modified
            // If not doing this, error will occur in the hooks unless the application code has included postings schema in the transaction when modifying data table.
            return function (mode, storeNames, dbSchema) {
                if (mode === "readwrite" && storeNames.indexOf(POSTINGS_SCHEMA) == -1) {
                    storeNames = storeNames.slice(0); // Clone storeNames before mippling with it.
                    storeNames.push(POSTINGS_SCHEMA);
                    storeNames.push(DF_SCHEMA);
                }
                return createTransaction.call(this, mode, storeNames, dbSchema);
            }
        });

        db[DATA_SCHEMA].hook("creating", function (primKey, obj, trans) {
            // Must wait till we have the auto-incremented key.
            trans._lock(); // Lock transaction until we got primary key and added all mappings. App code trying to read from dataTable the line after having added an email must then wait until we are done writing the mappings.
            this.onsuccess = (docId) => {
                // Add mappings for all words.
                const trigramCounts = getTrigramsCount(obj.content)
                Object.entries(trigramCounts).forEach(([trigram, freq]) => {
                    db[POSTINGS_SCHEMA].add({ trigram, docId, freq });
                    db[DF_SCHEMA].get(trigram)
                    .then(item=>{
                        // If not found
                        if (item===undefined){
                            
                                db[DF_SCHEMA].add({trigram,freq:1})
                                .catch(e=>{
                                    if (e instanceof Dexie.ConstraintError){
                                        //This is a race condition. The object was created in another transaction.
                                        // We made make more errors because of this and the count won't be perfect.
                                        //Anyway, we just do the same thing again, this time it will definetly be there
                                        db[DF_SCHEMA].get(trigram)
                                        .then(item=>{db[DF_SCHEMA].update(trigram,{freq:item.freq+1})})
                                        }
                                })
                            }
                            
                        else{
                            //Increment the document frequency by 1
                            db[DF_SCHEMA].update(trigram,{freq:item.freq+1})
                        }


                    })
                })
                trans._unlock();
            }
            this.onerror = function () {
                trans._unlock();
            }
        });





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

export const addData = async (data,index=0) => {
    const step =5
    if (data.length <=0){
        return;
    }
    const slice = data.slice(0,step);
    const remaining =data.slice(step,data.length);

    return   db[DATA_SCHEMA].bulkAdd(slice,)
        .then((res)=>{
            console.log(slice);
            return addData(remaining,index+step);
        })
    }


export const search = async (query,params) => {
    let candidateDocIds
    if (query===undefined || query===null || query.length===0){
         candidateDocIds = await dataTable.toCollection().primaryKeys()
    }else{
        const   terms = getTrigrams(query)
         candidateDocIds = await searchForTrigrams(terms);
    }
    let result
    switch (params.labelFilter){
        case LABEL_FILTER_OPTIONS.ALL:
        result= dataTable.where("id").anyOf(candidateDocIds)
        break;
        case LABEL_FILTER_OPTIONS.LABELED:
        result= dataTable.where('[has_label+id]').anyOf(candidateDocIds.map(id=>[1,id]))
        break;
        case LABEL_FILTER_OPTIONS.UNLABELED:
            
            const idsToExclude =  new Set(await dataTable.where('[has_label+id]').anyOf(candidateDocIds.map(id=>[1,id])).primaryKeys())
            debugger;
            const idsToGet = candidateDocIds.filter(x=>!idsToExclude.has(x))
            result= dataTable.where("id").anyOf(idsToGet)
            break

        default: 
            throw new Error(params.labelFilter)
    }

    if (query && query.length>0){
        return result.filter(x=>x.content.search(query) !=-1).primaryKeys()
    }else{
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

export const getExampleCount = () =>dataTable.count()