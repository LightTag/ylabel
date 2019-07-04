//From https://raw.githubusercontent.com/dfahlander/Dexie.js/master/samples/full-text-search/FullTextSearch.js

/*
    This example is a simple implementation of full-text search based on multi-valued indexes and Dexie hooks.
    NOTE: Multi-valued indexes are only supported in Opera, Firefox and Chrome. Does not work with IE so far.
    To see an example that works with IE, see FullTextSearch2.js.
*/
import Dexie from 'dexie'
const DBNAME = 'DATA'
const DATA_SCHEMA = 'data'
const CLASS_SCHEMA= 'schema'

var db = new Dexie(DBNAME);
const stores = {}
stores[DATA_SCHEMA] ="++id,human_label,model_label,*contentWords"
stores[CLASS_SCHEMA]="++id,name"

const getTrigrams =(text)=>{
    let trigrams = new Set()
    for (let end=2; end <text.length; end++){
        trigrams.add(text.slice(end-2,end+1))
    }
    return Array.from(trigrams)

}
const getTrigramsForQuery =(text)=>{
    //To query we don't need all the trigrams, we can take them sequentially
    
    let trigrams = new Set()
    for (let end=2; end <text.length+1; end+=3){
        const tg = text.slice(end-2,end+1)
        trigrams.add(tg)
    }
    debugger;
    return Array.from(trigrams)

}
function getAllWords(text) {
    /// <param name="text" type="String"></param>
    var allWordsIncludingDups = text.split(' ');
    var wordSet = allWordsIncludingDups.reduce(function (prev, current) {
        prev[current] = true;
        return prev;
    }, {});
    return Object.keys(wordSet);
}

const initializeDB =() =>{
    db.version(1).stores(stores);
    const initializeDataDB = ()  =>{
        db[DATA_SCHEMA].hook("creating", function (primKey, obj, trans) {
            debugger;
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
    const docKeys = await Dexie.Promise.all(terms.map(term=>{
        return db[DATA_SCHEMA].where("contentWords").equals(term).distinct().primaryKeys()
    }))
    const allMatch = docKeys.reduce((a, b) => {
        const set = new Set(b);
        return a.filter(k => set.has(k));
    });
    debugger;
    let result = db[DATA_SCHEMA].where("id").anyOf(allMatch).toArray().then(arr=>{
        return  arr.filter(doc=>doc.content.search(query) !==-1)
    });
    // Finnaly, filter to find the exact query
    
    return result
}

export const first =(n=20)=>{
    return db[DATA_SCHEMA].limit(n).toArray()
}
export const reset = ()=>{
    return db[DATA_SCHEMA].clear()
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

