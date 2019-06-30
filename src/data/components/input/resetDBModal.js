import React from 'react'
import { Fab, DialogTitle, Dialog, DialogActions, Button, CircularProgress } from '@material-ui/core';
import { ClearAll } from '@material-ui/icons';
import { resetIndex } from '../../db/indexCache';
export const ResetDBModal =(props)=>{
    const [open,setOpen] = React.useState(false);
    const [erasing,setErasing] = React.useState(false)
    const handleClick = async ()=>{
        setErasing(true)
        await resetIndex();
        setOpen(false)
        setErasing(false)
    }
    return (
        <React.Fragment>
            <Fab
                style={{position:'absolute',top:10,left:10}}
                onClick={()=>setOpen(true)}
            ><ClearAll/></Fab>

            <Dialog open={open} onClose={()=>setOpen(false)}>
                <DialogTitle>
                    Erase all the data
            </DialogTitle>
            <DialogActions>
            { erasing ? <CircularProgress /> :
             <Button onClick={handleClick} variant="contained" color="danger">Yes Erase It</Button> 
            }
            </DialogActions>
            </Dialog>

        </React.Fragment>
    )
}