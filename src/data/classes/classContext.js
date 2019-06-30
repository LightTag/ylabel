import React from 'react'
import { addSchemaClass, getSchemaClasses } from '../db/dexiewDB';

var randomMC = require('random-material-color');

const ClassContextType = React.createContext('classContext')
export const ClassContext = (props)=>{


    const [classes,setClasses] = React.useState({});
    React.useEffect( async ()=>{
        const classes =await getSchemaClasses()
        setClasses(classes);

    },[1])
    
    const addClass = async (name,)=>{
        const color =randomMC.getColor({text:name});
        await addSchemaClass(name,color)
        const classes =await getSchemaClasses()
        setClasses(classes);
    }

    return (
        <ClassContextType.Provider value ={{classes:Object.values(classes),addClass}}>
            {props.children}
        </ClassContextType.Provider>
    )
}

export const useClassContext = ()=>{
    return React.useContext(ClassContextType)
}