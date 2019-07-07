import { postingsTable, dfTable } from "./dexiewDB";
import Dexie from "dexie";
/**
 * Searches the postings index for a trigram, possibly restricted to a set of document ids.  
 * @param  {} trigram The trigram we are searcging for
 * @param  {} docIds=[] Possible list of document ids to restrict the search to. 
 * @return {Promise<docIds>} a promise with the list of matching document ids
 */
export const searchForTrigram = async (trigram,docIds=[])=>{
    /*
        Given a trigram and 
    */
    let keys ;
    if (docIds.length===0){
        //If only a trigram was provided
        keys = await postingsTable.where(`[trigram+docId]`)
        .between(
            [trigram,Dexie.minKey],
            [trigram,Dexie.maxKey],
        ).primaryKeys()
    }else{
        keys = await postingsTable.where(`[trigram+docId]`)
        .anyOf(docIds.map(docId=>[trigram,docId]))
        .primaryKeys()
    }
    
    //Keys is an array of primary keys of the posting table. The PK is [term,docId]
    // Since we searched for one trigram, each docId is unique, so it's enough to reduce 
    return keys.reduce((docIds,[term,docId])=>{
        docIds.push(docId)
        return docIds
    },[]);

}
/**
 * @param  {} trigrams An array of trigrams
 * @returns  {Promise<dfs>} a promise with any trigrams in the index sorted by frequency in ascending orrder
 */
export const  sortTrigramsByDF =(trigrams)=>{
    return dfTable.where("trigram").anyOf(trigrams).sortBy("freq")

}

export const  searchForTrigrams = async (trigrams,depth=0,docIds=[]) =>{

    if (depth===0){
        //We just started, sort the trigrams by df
        const previousTrigramCount = trigrams.length
        trigrams = await sortTrigramsByDF(trigrams)
        if (trigrams.length < previousTrigramCount){
            // In this case, one or more of the trigrams was not in the index, so return [] without searching
            return []
        }
    }
    do {
        // Keep narrowing down the list until we are out of trigrams or the list of document ids is empty (which means there is no match)
        const trigram = trigrams.shift();
        docIds = await searchForTrigram(trigram,docIds)
    } while (docIds.length>0 && trigrams.length >0)
    
    return docIds;
    



}