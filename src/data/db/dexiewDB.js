//From https://raw.githubusercontent.com/dfahlander/Dexie.js/master/samples/full-text-search/FullTextSearch.js

/*
    This example is a simple implementation of full-text search based on multi-valued indexes and Dexie hooks.
    NOTE: Multi-valued indexes are only supported in Opera, Firefox and Chrome. Does not work with IE so far.
    To see an example that works with IE, see FullTextSearch2.js.
*/
import Dexie from 'dexie'
import { getTrigrams, getTrigramsCount } from './tokenizationUtils';
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
                        }else{
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

export const addData = (data) => {
    return db.transaction('rw', db[DATA_SCHEMA], () => {
        data.forEach(d => db[DATA_SCHEMA].add(d));
    })
}

export const search = async (query) => {

    const terms = getTrigrams(query)
    if (terms.length === 0) {
        return Dexie.Promise.resolve([])
    }
    const docKeys = await Dexie.Promise.all(terms.map(term => {
        return db[DATA_SCHEMA].where("contentWords").equals(term).distinct().primaryKeys()
    }))
    if (docKeys.length === 0) {
        return Dexie.Promise.resolve([])
    }
    const allMatch = docKeys.reduce((a, b) => {
        const set = new Set(b);
        return a.filter(k => set.has(k));
    });
    return db[DATA_SCHEMA].where("id").anyOf(allMatch).primaryKeys()
        .then(matchingDocumentIds => {
            const queryCacheObject = {
                "id": hash(query),
                docIds: matchingDocumentIds
            }
            db[QUERY_SCHEMA].add(queryCacheObject)
            return matchingDocumentIds
        })

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
    return db[DATA_SCHEMA].update(exampleId, { human_label: className, has_class: true })
}

