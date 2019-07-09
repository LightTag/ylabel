export const getTrigrams =(text)=>{
    let trigrams = new Set()
    for (let end=2; end <text.length; end++){
        trigrams.add(text.slice(end-2,end+1))
    }
    return Array.from(trigrams)

}

export const getTrigramsCount =(text)=>{
    if(!text){
        return {}
    }
    let trigrams = {}
    text = text.toLowerCase().replace(/[\s+./:,<>']/g, '')
    if (!text){
        return trigrams
    }
    for (let end=2; end <text.length; end++){
        const key = text.slice(end-2,end+1)
        trigrams[key] = trigrams[key] ? trigrams[key] +1 : 1
    }
    return trigrams

}
