import React from 'react'
import { TextField, IconButton } from '@material-ui/core';
import {Search} from '@material-ui/icons'
import { useDebouncedCallback } from 'use-debounce';

export const SearchBar = (props)=>{
    const [query,setQuery] = React.useState(null);
    const [debouncedCallback] = useDebouncedCallback(
        // function
        (query) => {
            props.onChange(query)
        },
        // delay in ms
        250
      );
    
    return (
<React.Fragment>
        <TextField 
            type="text"
            label="Search for something"
            helperText="Runs a full text search on your data"
            onChange={e=>{debouncedCallback(e.target.value)}}
        />
        <IconButton onClick={()=>props.onChange(query)} > <Search/> </IconButton>
</React.Fragment>
    )
}