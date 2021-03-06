import React from 'react'
import * as dbUtils from './dexiewDB'

const DBContextType = React.createContext("dbContext");

export const DBContext = (props)=>{
    const [step,setStep] = React.useState(0)
    const [ready,setReady] = React.useState(false)

    const incrementStep = ()=>setStep(step+1) // trigger a rerender when modifying the db
    const init =  ()=>{

        setReady(true)
    
    }
    React.useEffect(init,[1])

    const api = {
        addDoc: (doc)=>{
            // dbUtils.addDoc(doc)
            incrementStep();
        },
        addDocsBatch: async (docs)=>{
            const result = await dbUtils.addData(docs)
            return result
        },
        updateDoc:(doc)=>{
            // dbUtils.updateDoc(doc)
            incrementStep();
        },
        setDocCLass: (exampleId,className)=>{
            return dbUtils.applyClassToExample(exampleId,className)
            
        },
        updateDocsBatch:(docs)=>{
            // for (const doc of docs){
            //     // dbRef.current.updateDoc(doc)
            // }
            incrementStep();
        },
        search:  async (query,params)=>{
            const results = await dbUtils.search(query,params)
            return  results
        },
        regexSearch:  async (pattern,)=>{
            const results = await dbUtils.regexSearch(pattern)
            return  results
        },

        getDocumentById: (id)=>{
            return dbUtils.getDocById(id)
        },

        allDocs:()=>{

            return dbUtils.first(20)
        },
        step

    }
    return (
        <DBContextType.Provider value={api}>
            {ready ? props.children : null}
        </DBContextType.Provider>
    )
}

export const useDB = ()=>{
    const context = React.useContext(DBContextType)
    return context;
}