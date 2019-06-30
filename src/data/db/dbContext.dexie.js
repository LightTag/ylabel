import React from 'react'
import { getIndex, updateIndex,resetIndex } from './indexCache';
import { Fab } from '@material-ui/core';
import { ClearAll } from '@material-ui/icons';
import * as dbUtils from './dexiewDB'
var elasticlunr = require('elasticlunr');

const DBContextType = React.createContext("dbContext");

export const DBContext = (props)=>{
    const [step,setStep] = React.useState(0)
    const [ready,setReady] = React.useState(false)

    const incrementStep = ()=>setStep(step+1) // trigger a rerender when modifying the db
    const init = async ()=>{

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
        },
        updateDoc:(doc)=>{
            // dbUtils.updateDoc(doc)
            incrementStep();
        },
        updateDocsBatch:(docs)=>{
            for (const doc of docs){
                // dbRef.current.updateDoc(doc)
            }
            incrementStep();
        },
        search:  async (query,params)=>{
            const results = await dbUtils.search(query)
            debugger;
            return  results
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