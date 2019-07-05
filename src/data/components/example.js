import React from 'react'
import { Typography, Paper, CardHeader, CardContent,  CardActions } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { ClassRibbon } from '../classes/classRibbon';
const useStyles = makeStyles(theme=>({
    root:{
        overflow:'auto',
        marginTop:'1rem'
    }
}))
export const Example = (props)=>{
    const classes= useStyles()
    return (
        <div>
        <Paper className={classes.root} id={props.example.id} style={{maxHeight:'80vh'}}>
            <CardHeader
                style={{paddingBottom:'1rem'}}
                title={props.example.id}
                subheader={      <ClassRibbon example={props.example} handleUpdateExample={props.handleUpdateExample}/>}
            ></CardHeader>
            <CardContent style={{overflow:'auto',height:'75%'}}>
            <Typography style={{whiteSpace:'pre-line',}}>
                {props.example.content}
            </Typography>
            </CardContent>
            <CardActions>
          
            </CardActions>
        </Paper>
        </div>
    )
}