import React from 'react'
import { TextField, LinearProgress } from '@material-ui/core';
import { useDebouncedCallback } from 'use-debounce';
import { useSearch } from '../searchContext';

export const SearchBar = (props)=>{
    const search = useSearch()
    const [debouncedCallback] = useDebouncedCallback(
        // function
        (query) => {
            search.handleQueryChange(query)
        },
        // delay in ms
        250
      );
    
    return (
<React.Fragment>
        <TextField 
            type="text"
            label="Search for something"
            helperText={search.searching ? <LinearProgress /> : "Runs a full text search on your data" }
            onChange={e=>{debouncedCallback(e.target.value)}}
            fullWidth
        />
</React.Fragment>
    )
}