import { dataTable, postingsTable } from "./dexiewDB";
import { getTrigrams, getTrigramsCount } from "./tokenizationUtils";


dataTable.hook("creating", function (primKey, obj, trans) {
    // Must wait till we have the auto-incremented key.
    trans._lock(); // Lock transaction until we got primary key and added all mappings. App code trying to read from dataTable the line after having added an email must then wait until we are done writing the mappings.
    this.onsuccess =  (docId) => {
        // Add mappings for all words.
        const trigramCounts = getTrigramsCount(obj.content)
        Object.entries(trigramCounts).forEach(([trigram,freq])=>{
            postingsTable.add({ trigram,docId,freq });
        })
        trans._unlock();
    }
    this.onerror = function () {
        trans._unlock();
    }
});



