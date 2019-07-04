import React from 'react'
import { useClassContext } from './classContext';
import { Grid, Button,  Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@material-ui/core';
import { Add } from '@material-ui/icons';
import { useDB } from '../db/dbContext.dexie';

export const AddClassDialog = (props)=>{
    const classContext =useClassContext()
    const [name,setName] = React.useState(null)
    const [open,setOpen] = React.useState(false);

    return (
        <React.Fragment>
            <Add onClick={()=>setOpen(true)}/>

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
    const db = useDB()
    const classContext =useClassContext()
    const applyClass =(name)=>{
        debugger;
        db.setDocCLass(props.example.id,name)
    }
    return(
    <Grid container spacing={2}>
        
        {classContext.classes.map(cls=>(
            <Grid item>
            <Button 
                variant={props.example.human_label===cls.name ? "contained" : "outlined"}
                onClick={()=>{applyClass(cls.name)}}
                style={{borderColor:cls.color,background:props.example.human_label===cls.name ? cls.color : undefined}}>
                {cls.name}
            </Button>
            </Grid>
        ))}
    </Grid>
)
}