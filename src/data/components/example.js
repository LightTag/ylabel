import React from 'react'
import { Typography, Paper, CardHeader, CardContent, CardActions, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { ClassRibbon } from '../classes/classRibbon';
import { useDB } from '../db/dbContext.dexie';
const useStyles = makeStyles(theme => ({
    root: {
        overflow: 'auto',
        marginTop: '1rem'
    }
}))
export const Example = (props) => {
    const classes = useStyles()
    const db = useDB()
    const [example, setExample] = React.useState(null)
    const [loading, setLoading] = React.useState(false);
    const loadExample = ()=>{


        db.getDocumentById(props.exampleId)
            .then((example) => {
                setExample(example);
                setLoading(false);

                try{
                    props.onLoad();
                }
                catch  {
                    console.error("Node was unmounted before loading")
                }
             
    })
}
    React.useEffect(()=>{
                setLoading(true)
        loadExample()
    }
        ,[1]);

    if ( example===null ){
        return (
        <div style={{height:'50vh'}}>
        <CircularProgress />
        </div>
        )
        
    }
    return (
        <div>
            <Paper className={classes.root} id={props.exampleId} style={{ maxHeight: '80vh' }}>
                <CardHeader
                    style={{ paddingBottom: '1rem' }}
                    title={props.exampleId}
                    subheader={<ClassRibbon example={example} handleUpdateExample={loadExample} />}
                ></CardHeader>
                <CardContent style={{ overflow: 'auto', height: '75%' }}>
                    <Typography style={{ whiteSpace: 'pre-line', }}>
                        {example.content}
                    </Typography>
                </CardContent>
                <CardActions>

                </CardActions>
            </Paper>
        </div>
    )
}