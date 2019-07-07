import React from 'react'
import { TextField, Fade, MenuItem,  Button, CircularProgress } from '@material-ui/core';

import { useDB } from '../../db/dbContext.dexie';
import Papa from 'papaparse'
export function readJSONFileAsync(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();

        reader.onload = () => {
            resolve(reader.result);
        };

        reader.onerror = reject;

        reader.readAsText(file);
    })
}


export const FileInput = (props) => {
    const handleNewFile = async (e, extra) => {
        //Todo move this to a webworker (requires ejecting https://github.com/developit/workerize-loader/issues/35)
        const file = e.target.files[0]
        const contents = await readJSONFileAsync(file);
        debugger;
        if (file.name.endsWith('.json')){
            const data = JSON.parse(contents);
            props.handleNewData(data);
    
        }else{
            const data = Papa.parse(contents,{
                header:true
            }).data;
            props.handleNewData(data);
        }
    }
    return (
        <TextField
            type="file"
            label="Add a file"
            onChange={handleNewFile}
            helperText="Select a file"
        />
    )
}


export const DataIngestor = (props) => {
    const [data, setData] = React.useState(null)
    const [keys, setKeys] = React.useState([]);
    const [textField, setTextField] = React.useState(null)
    const [loading,setLoading] = React.useState(false)
    const db = useDB()
    const handleNewData = (data) => {
        setKeys(Object.keys(data[0]));
        setData(data);
    }

    const handleSubmit = () => {
        setLoading(true)
        const formtedData = data.map((x, id) => ({
            content: x[textField]
        }))
        db.addDocsBatch(formtedData)
        .then(()=>setLoading(false))
        ;
    }
    return (
        <form>
            <FileInput handleNewData={handleNewData} />
            <Fade in={keys.length}>
                <TextField
                    onChange={e => setTextField(e.target.value)}
                    value={textField}

                    select
                    label="Text Field"
                    helperText="Please select the field in the data we'll be labeling"
                    margin="normal"
                >

                    {keys.map(x => (
                        <MenuItem value={x}>{x}</MenuItem>
                    ))}
                </TextField>
            </Fade>
            {loading ? <CircularProgress /> : 
            <Button
                onClick={handleSubmit}
                disabled={textField === null}
                variant="outlined"
                color="primary"
            >
                Load Data
                </Button>
            }
        </form>
    )
}