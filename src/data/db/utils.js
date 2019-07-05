import { getTrigrams } from "./dexiewDB";

const onDocumentInsert = (primKey, obj, trans) =>{
    if (typeof obj.content == 'string') {
        const trigrams = getTrigrams(obj.content);
        
    }
}
