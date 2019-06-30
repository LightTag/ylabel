import React from 'react'

var randomMC = require('random-material-color');

const ClassContextType = React.createContext('classContext')
export const ClassContext = (props)=>{

    const [classes,setClasses] = React.useState({});
    const addClass =(name)=>{
        classes[name] = { name,color:randomMC.getColor({text:name})};
        setClasses({...classes});
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