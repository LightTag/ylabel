//From https://raw.githubusercontent.com/dfahlander/Dexie.js/master/samples/full-text-search/FullTextSearch.js

/*
    This example is a simple implementation of full-text search based on multi-valued indexes and Dexie hooks.
    NOTE: Multi-valued indexes are only supported in Opera, Firefox and Chrome. Does not work with IE so far.
    To see an example that works with IE, see FullTextSearch2.js.
*/
import Dexie from 'dexie'
var hash = require('object-hash');

const DBNAME = 'DATA'
const DATA_SCHEMA = 'data'
const CLASS_SCHEMA= 'schema'
const QUERY_SCHEMA = 'query'
var db = new Dexie(DBNAME);
const stores = {}
stores[DATA_SCHEMA] ="++id,human_label,model_label,*contentWords"
stores[CLASS_SCHEMA]="++id,name"
stores[QUERY_SCHEMA]="++id,*docIds"

export const getTrigrams =(text)=>{
    let trigrams = new Set()
    for (let end=2; end <text.length; end++){
        trigrams.add(text.slice(end-2,end+1))
    }
    return Array.from(trigrams)

}

const initializeDB =() =>{
    db.version(1).stores(stores);
    const initializeDataDB = ()  =>{
        db[DATA_SCHEMA].hook("creating", function (primKey, obj, trans) {
            if (typeof obj.content == 'string') 
                obj.contentWords = getTrigrams(obj.content);
        });
        db[DATA_SCHEMA].hook("updating", function (mods, primKey, obj, trans) {
            if (mods.hasOwnProperty("content")) {
                // "content" property is being updated
                if (typeof mods.content == 'string')
                    // "content" property was updated to another valid value. Re-index contentWords:
                    return { contentWords: getTrigrams(mods.content) };
                else
                    // "content" property was deleted (typeof mods.content === 'undefined') or changed to an unknown type. Remove indexes:
                    return { contentWords: [] };
            }
        
        });
        
        
        // Open database to allow application code using it.
        db.open();
        
    }
    initializeDataDB()


}

initializeDB()
// Add hooks that will index "content" for full-text search:



export const addData =  (data) => {
    return db.transaction('rw', db[DATA_SCHEMA], () => {
        data.forEach(d=>db[DATA_SCHEMA].add(d));
    })
}

export const search = async (query)=>{

    const terms = getTrigrams(query)
    if (terms.length===0){
        return Dexie.Promise.resolve([])
    }
    const docKeys = await Dexie.Promise.all(terms.map(term=>{
        return db[DATA_SCHEMA].where("contentWords").equals(term).distinct().primaryKeys()
    }))
    if (docKeys.length===0){
        return Dexie.Promise.resolve([])
    }
    const allMatch = docKeys.reduce((a, b) => {
        const set = new Set(b);
        return a.filter(k => set.has(k));
    });
    return db[DATA_SCHEMA].where("id").anyOf(allMatch).primaryKeys()
        .then(matchingDocumentIds=>{
            const queryCacheObject = {
                "id":hash(query),
                docIds:matchingDocumentIds
            }
            db[QUERY_SCHEMA].add(queryCacheObject)
            return matchingDocumentIds
        })
    
    // Finnaly, filter to find the exact query
    
    
}

export const regexSearch =(pattern)=>{
    
    try{
        //temp try catch block to avoid execptions when partial pattern is sent
        

    const regex = new RegExp(pattern)
    return db[DATA_SCHEMA].filter(doc=>regex.test(doc.content)).primaryKeys()
    .then(matchingDocumentIds=>{
        const queryCacheObject = {
            "id":hash(pattern),
            docIds:matchingDocumentIds
        }
        db[QUERY_SCHEMA].add(queryCacheObject)
        return matchingDocumentIds
        })
    }
catch (e){
    return Dexie.Promise.resolve([])
}
    
}

export const first =(n=20)=>{
    return db[DATA_SCHEMA].limit(100).primaryKeys()
}
export const resetAll = ()=>{
    return Dexie.Promise.all([
        db[DATA_SCHEMA].clear(),
        db[CLASS_SCHEMA].clear()
    ])
}

export const getDocById=(id)=>{
    return db[DATA_SCHEMA].get(id)
}
export const addSchemaClass =(name,color,)=>{
    
        return db[CLASS_SCHEMA].add({name,color})
}

export const getSchemaClasses =()=>{
    return db[CLASS_SCHEMA].toArray()
}

export const applyClassToExample =(exampleId,className)=>{
    return db[DATA_SCHEMA].update(exampleId,{human_label:className})
}

