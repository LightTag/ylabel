import Dexie from 'dexie';
import { readFileAsync } from '../components/input/fileInput';
const DBNAME = 'INDEX12'
const db = new Dexie(DBNAME);

// Declare tables, IDs and indexes
db.version(1).stores({
    elastic: 'id,content'
});

const saveIndex = async (index,id=1)=>{
    var blob = new Blob([JSON.stringify(index, null, 2)], {type : 'application/json'});
    const result = await db.elastic.add({id,index:blob})
    return result
}

const doUpdateIndex = async (index,id=1)=>{
    var blob = new Blob([JSON.stringify(index,)], {type : 'application/json'});
    const result = await db.elastic.update(id,{index:blob})
    return result
}


export const getIndex = async (props)=>{
    const index = await db.elastic.get(1);
    if(index!=undefined){
    debugger;

        const data = await readFileAsync(index.index);
        return JSON.parse(data)
    }
    

}



export const updateIndex = async (index)=>{
    let result 
    debugger;
    if (await db.elastic.get(1)){
        result = await doUpdateIndex(index);
    }else{
        result =await saveIndex(index)
    }

    return result;
}

export const resetIndex = async (props)=>{
    await db.elastic.delete(1);
    window.location.reload()
}