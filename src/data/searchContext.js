import React from 'react'
import { useDB } from './db/dbContext.dexie';


const SearchContextType = React.createContext('searchContext')
export const SearchContext = (props)=>{
    const db = useDB();
    const [examples,setExamples] = React.useState(db.allDocs())
    const [lastQuery,setlastQuery] = React.useState(null);
    const [searching,setSearching] = React.useState(false)

    React.useEffect(()=>{
        handleQueryChange(lastQuery)
    },[db.step])
    const handleQueryChange = (query)=>{
        if (!query || query.length <1){
            db.allDocs().then(results=>{

                setExamples(results)
            })
            
        }else{
            setSearching(true)
            db.search(query).then(results=>{
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