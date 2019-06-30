import React from 'react'
import { useClassContext } from './classContext';
import { Grid, Button, IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@material-ui/core';
import { Add } from '@material-ui/icons';

const AddClassDialog = (props)=>{
    const classContext =useClassContext()
    const [name,setName] = React.useState(null)
    const [open,setOpen] = React.useState(false);

    return (
        <React.Fragment>
        <IconButton onClick={()=>setOpen(true)}>
            <Add/>
        </IconButton>

        <Dialog open={open} onClose={()=>setOpen(false)}>
            <DialogTitle>
                Add a new class
            </DialogTitle>
            <DialogContent>
                <TextField 
                    onChange={e=>setName(e.target.value)}
                    value={name}
                    label="Choose a name for your class"
                />
            </DialogContent>
            <DialogActions>
                <Button 
                variant="contained" 
                color="primary" 
                disabled={name===null} 
                onClick={()=>{
                    classContext.addClass(name)
                    setOpen(false)
                    setName(null)
                
                }}
                >
                Add {name}
                </Button>
            </DialogActions>
        </Dialog>
        </React.Fragment>
    )
}
export const ClassRibbon = (props)=>{
    const classContext =useClassContext()

    return(
    <Grid container spacing={2}>
        <Grid item>
        < AddClassDialog/>
        </Grid>

        {classContext.classes.map(cls=>(
            <Grid item>
            <Button variant='outlined' style={{borderColor:cls.color}}>
                {cls.name}
            </Button>
            </Grid>
        ))}
    </Grid>
)
}