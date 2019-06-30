//From https://raw.githubusercontent.com/dfahlander/Dexie.js/master/samples/full-text-search/FullTextSearch.js

/*
    This example is a simple implementation of full-text search based on multi-valued indexes and Dexie hooks.
    NOTE: Multi-valued indexes are only supported in Opera, Firefox and Chrome. Does not work with IE so far.
    To see an example that works with IE, see FullTextSearch2.js.
*/
import Dexie from 'dexie'
const DBNAME = 'DATA'
const SCHEMA_NAME = 'DATA'
var db = new Dexie(DBNAME);

db.version(1).stores({ data: "++id,human_label,model_label,*contentWords" });

// Add hooks that will index "content" for full-text search:
db.data.hook("creating", function (primKey, obj, trans) {
    debugger;
    if (typeof obj.content == 'string') 
        obj.contentWords = getTrigrams(obj.content);
});
db.data.hook("updating", function (mods, primKey, obj, trans) {
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

const getTrigrams =(text)=>{
    let end= 2;
    let trigrams = new Set()
    for (let end=2; end <text.length; end++){
        trigrams.add(text.slice(end-2,end))
    }
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

// Open database to allow application code using it.
db.open();


export const addData =  (data) => {
    return db.transaction('rw', db.data, () => {
        data.forEach(d=>db.data.add(d));
    })
}

export const search = async (query)=>{

    const terms = getTrigrams(query)
    const docKeys = await Dexie.Promise.all(terms.map(term=>{
        return db.data.where("contentWords").equals(term).distinct().primaryKeys()
    }))
    const allMatch = docKeys.reduce((a, b) => {
        const set = new Set(b);
        return a.filter(k => set.has(k));
    });
    debugger;
    const result = db.data.where("id").anyOf(allMatch).toArray();
    return result
}

export const first =(n=20)=>{
    return db.data.limit(n).toArray()
}
export const reset = ()=>{
    return db.data.clear().then(res=>{
        debugger;
    })
}
