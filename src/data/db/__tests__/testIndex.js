import { addData, getDocById, getTrigrams, dataTable, postingsTable, dfTable } from "../dexiewDB";
import { exportAllDeclaration } from "@babel/types";
import { getTrigramsCount } from "../tokenizationUtils";
import { searchForTrigram, sortTrigramsByDF } from "../queryFunctions";

describe ("Tests of indexing",()=>{
    const testString = "Hello I am Tal"
    it("Makes a posting list",async ()=>{
         const resp = await addData([{content:testString}])
         const doc  = await getDocById(1);
         expect(doc.content).toEqual(testString);

         for (const [trigram,freq] of Object.entries(getTrigramsCount(testString))){
            const results = await postingsTable.where("[trigram+docId]").equals([trigram,1]).distinct().primaryKeys();
            const [trgm,docId] = results[0];
            expect(docId).toEqual(1);

            const dfResult = await dfTable.get(trigram);
            expect(dfResult.freq).toEqual(1)
         }
    })

    it("Updates the DF table as expected",async ()=>{
        //Expect Tal  to appear in two documents and the rest to appear in 1
        const resp = await addData([{content:"TalTalTal"}])
        for (const [trigram,freq] of Object.entries(getTrigramsCount(testString))){
            const dfResult = await dfTable.get(trigram);
            expect(dfResult.freq).toEqual(trigram==="Tal" ? 2 :1)
        }
    })

    it("Can do a trigram search",async ()=>{
        let result = await searchForTrigram("Hel");
        expect(result).toEqual([1])
        // Test that things that aren't indexed return nothing
        result = await searchForTrigram("123");
        expect(result).toEqual([])

        result = await searchForTrigram("Tal"); // Appears in both documents
        expect(result).toEqual([1,2])

    })

    it("Can get trgirams sorted by document frequency",async ()=>{
        const result = await sortTrigramsByDF(["Tal","Hel", " am","123"]) // 123 not in the index
        expect(result.length).toEqual(3)
        const lastItem = result.slice(-1)[0]
        expect(lastItem.trigram).toEqual("Tal")
        expect(lastItem.freq).toEqual(2)
    })


})
