import React from 'react'
import { getIndex, updateIndex,resetIndex } from './indexCache';
import { Fab } from '@material-ui/core';
import { ClearAll } from '@material-ui/icons';

var elasticlunr = require('elasticlunr');

const DBContextType = React.createContext("dbContext");

export const DBContext = (props)=>{
    const dbRef = React.useRef();
    const [step,setStep] = React.useState(0)
    const [ready,setReady] = React.useState(false)

    const incrementStep = ()=>setStep(step+1) // trigger a rerender when modifying the db
    const init =  ()=>{
            getIndex().then(cachedIndex =>{
                if (cachedIndex){
                    dbRef.current =     elasticlunr.Index.load(cachedIndex)
                }else{
                    dbRef.current = elasticlunr( function(){
                        this.addField('content')
                        this.setRef('id')
                        this.addField('userLabel')
                        this.addField('modelLabel')
                        this.addField('modelConf')
                    })
            
                }
        
                setReady(true)
        
          }

        )
    
    }
    
    React.useEffect(init,[1])

    const api = {
        addDoc: (doc)=>{
            dbRef.current.addDoc(doc)
            incrementStep();
        },
        addDocsBatch:(docs)=>{
            debugger;
            for (const doc of docs){
                dbRef.current.addDoc(doc)
            }
            updateIndex(dbRef.current)
            incrementStep();

        },
        updateDoc:(doc)=>{
            dbRef.current.updateDoc(doc)
            incrementStep();
        },
        updateDocsBatch:(docs)=>{
            for (const doc of docs){
                dbRef.current.updateDoc(doc)
            }
            incrementStep();
        },
        search:(query,params)=>{
            const results = dbRef.current.search(query,params)
            const docs = results.map(res=>                dbRef.current.documentStore.docs[res.ref])
            return docs
        },
        allDocs:()=>{

            return Object.values(dbRef.current.documentStore.docs)
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