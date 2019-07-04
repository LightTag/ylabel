import React from 'react'
import { useDB } from './db/dbContext.dexie';


const SearchContextType = React.createContext('searchContext')
export const SearchContext = (props)=>{
    const db = useDB();
    const [examples,setExamples] = React.useState(db.allDocs())
    const [lastQuery,setlastQuery] = React.useState(null);
    const [searching,setSearching] = React.useState(false)

    React.useEffect(()=>{
        // This runs the last query when something happens in the db. 
        // E.g. if we apply a class we refresh the data
        // Lots of potential for UX bugs
        //TODO improve this
        handleQueryChange(lastQuery)
    },[db.step])
    const handleQueryChange = (query,regex=false)=>{
        
        const searchFunction = regex ? db.regexSearch : db.search
        if (!query || query.length <1){
            db.allDocs().then(results=>{

                setExamples(results)
            })
            
        }else{
            setSearching(true)
            searchFunction(query).then(results=>{
                setExamples(results);
                setSearching(false)
    
            })

    
        }
        setlastQuery(query)
    }

    return (
        <SearchContextType.Provider value={{examples,handleQueryChange,searching}}>
            {props.children}
        </SearchContextType.Provider>
    )
}

export const useSearch =()=>{
    return  React.useContext(SearchContextType)
}