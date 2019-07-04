import React from 'react'
import { Fab, DialogTitle, Dialog, DialogActions, Button, CircularProgress, IconButton } from '@material-ui/core';
import { resetIndex } from '../../db/indexCache';
import { DeleteForever } from '@material-ui/icons';
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
            <IconButton
            color='inherit'
                onClick={()=>setOpen(true)}
            ><DeleteForever/></IconButton>

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